//! The Flow proposal transforms that sit beside type erasure.
//!
//! Erasure only deletes. `enum`, `component`, `hook`, and `match` declare
//! runtime constructs, so they have to write something in place of what they
//! remove. The output matches `hermes-parser`'s JavaScript transforms —
//! `TransformEnumSyntax.js`, `TransformComponentSyntax.js`, and
//! `TransformMatchSyntax.js` — because that is what the ecosystem's semantics
//! are defined by, not because the shape is the only possible one.
//!
//! Two rules keep this compatible with the erasure walk around it.
//!
//! **Only rewrite what changes.** A component's body stays exactly where it is,
//! so the Flow inside it is erased by the ordinary walk and the piece table
//! composes the two. Replacing the whole declaration would swallow those edits
//! and reject the pair, which is the same mistake the destructuring lowering
//! made. `match` is the same idea taken further: a case body is left alone and
//! the generated conditions, bindings, and punctuation are written into the
//! gaps around it.
//!
//! **Read the source, do not rebuild it.** A parameter's default value, an
//! enum member's initializer, a type argument list, the value a match pattern
//! compares against — all of them are copied as source slices, so formatting
//! survives and nothing has to be printed back.

use std::ops::Range;

use crate::generated::estree::{NODE_KINDS, kind};
use crate::reader::Cursor;

/// Reads the `name` of an `Identifier` the cursor is parked on, without
/// consuming it.
pub(crate) fn identifier_name<'a>(cursor: &Cursor<'a>) -> Option<&'a [u8]> {
    let mut probe = *cursor;
    probe.node().ok()??;
    for field in NODE_KINDS[kind::IDENTIFIER as usize].fields {
        if field.name == "name" {
            return probe.label().ok().flatten();
        }
        probe.skip_field(field.ty).ok()?;
    }
    None
}

/// `enum Status { Active, Off }` and friends.
///
/// Mirrors `TransformEnumSyntax.js`: a defaulted string enum becomes
/// `Mirrored([...])`, everything else an object literal. A defaulted member of
/// a symbol enum becomes `Symbol("name")`.
pub(crate) struct Enum {
    pub id: Range<u32>,
    pub members: Vec<EnumMember>,
    /// True when every member is defaulted and the body is a string body, which
    /// is the case `flow-enums-runtime` has a dedicated constructor for.
    pub mirrored: bool,
}

pub(crate) struct EnumMember {
    pub name: Range<u32>,
    /// `None` for a defaulted member.
    pub init: Option<Range<u32>>,
}

impl Enum {
    /// The `const NAME = …` that replaces the declaration.
    pub fn render(&self, source: &str) -> String {
        let name = &source[self.id.start as usize..self.id.end as usize];
        let runtime = "require(\"flow-enums-runtime\")";
        if self.mirrored {
            let names = self
                .members
                .iter()
                .map(|member| format!("\"{}\"", slice(source, &member.name)))
                .collect::<Vec<_>>()
                .join(",");
            return format!("const {name} = {runtime}.Mirrored([{names}])");
        }
        let entries = self
            .members
            .iter()
            .map(|member| {
                let key = slice(source, &member.name);
                match &member.init {
                    Some(init) => format!("{key}: {}", slice(source, init)),
                    // A defaulted member outside a string body is a symbol.
                    None => format!("{key}: Symbol(\"{key}\")"),
                }
            })
            .collect::<Vec<_>>()
            .join(", ");
        format!("const {name} = {runtime}({{{entries}}})")
    }
}

/// `component Foo(a: T, b as c: U = 1, ...rest: R) renders X { … }`
///
/// Mirrors `TransformComponentSyntax.js`. The parameters become one object
/// pattern in the function's parameter list rather than a prologue in the body,
/// which is what that transform emits and what keeps the body untouched.
pub(crate) struct Component {
    pub id: Range<u32>,
    pub params: Vec<ComponentParam>,
    /// Present when a single rest parameter takes the whole props object, which
    /// needs no destructuring at all.
    pub whole_props: Option<Range<u32>>,
    /// The binding of a `ref` parameter. React 18 treats `ref` specially, so
    /// the component becomes an inner function taking `(props, ref)` wrapped in
    /// `React.forwardRef`.
    pub ref_binding: Option<Range<u32>>,
    pub is_async: bool,
}

pub(crate) struct ComponentParam {
    /// The property name as written, which may be a string literal.
    pub name: Range<u32>,
    /// The binding, without its type annotation.
    pub local: Range<u32>,
    /// A default value, if the parameter had one.
    pub default: Option<Range<u32>>,
    /// `a` rather than `a as a`, so the pattern can use shorthand.
    pub shorthand: bool,
    /// `...rest`.
    pub rest: bool,
}

impl Component {
    /// The name the function is declared under. With a `ref` parameter the
    /// declared name belongs to the `forwardRef` wrapper instead, so the inner
    /// function takes a derived one.
    fn function_name(&self, source: &str) -> String {
        let name = slice(source, &self.id);
        match self.ref_binding {
            Some(_) => format!("{name}_withRef"),
            None => name.to_owned(),
        }
    }

    /// Everything that replaces the source from `component` up to the body's
    /// `{`: the `forwardRef` binding when there is one, then the function
    /// header.
    ///
    /// The binding comes *first*, which is what `TransformComponentSyntax`
    /// emits and is safe because the function declaration below it hoists.
    pub fn render(&self, source: &str) -> String {
        let name = self.function_name(source);
        let prefix = if self.is_async {
            "async function"
        } else {
            "function"
        };
        let reference = match &self.ref_binding {
            Some(binding) => format!(", {}", slice(source, binding)),
            None => String::new(),
        };
        let wrapper = self.forward_ref(source).unwrap_or_default();
        if let Some(props) = &self.whole_props {
            return format!(
                "{wrapper}{prefix} {name}({}{reference}) ",
                slice(source, props)
            );
        }
        if self.params.is_empty() {
            // A component whose only parameter was the ref still needs a props
            // slot, and `TransformComponentSyntax` names it exactly this.
            let props = if reference.is_empty() {
                ""
            } else {
                "_$$empty_props_placeholder$$"
            };
            return format!("{wrapper}{prefix} {name}({props}{reference}) ");
        }
        let properties = self
            .params
            .iter()
            .map(|param| param.render(source))
            .collect::<Vec<_>>()
            .join(", ");
        format!("{wrapper}{prefix} {name}({{{properties}}}{reference}) ")
    }

    /// `const Foo = React.forwardRef(Foo_withRef);`, or nothing when there was
    /// no `ref` parameter.
    pub fn forward_ref(&self, source: &str) -> Option<String> {
        self.ref_binding.as_ref()?;
        let name = slice(source, &self.id);
        Some(format!(
            "const {name} = React.forwardRef({});\n",
            self.function_name(source)
        ))
    }
}

impl ComponentParam {
    fn render(&self, source: &str) -> String {
        if self.rest {
            return format!("...{}", slice(source, &self.local));
        }
        let local = slice(source, &self.local);
        let binding = match &self.default {
            Some(default) => format!("{local} = {}", slice(source, default)),
            None => local.to_owned(),
        };
        if self.shorthand {
            return binding;
        }
        format!("{}: {binding}", slice(source, &self.name))
    }
}

// -- match ------------------------------------------------------------------

/// Generated identifiers, `$$gen$m0` upwards.
///
/// `TransformMatchSyntax` names them the same way, from a counter that runs for
/// the whole file. It avoids colliding with a name the file wrote itself by
/// noting every identifier its traversal has already passed, which leaves a
/// hole: a `$$gen$m0` further down the file has not been seen yet. Starting the
/// counter above every such name in the source closes it, and costs one scan of
/// a file that mentions the prefix at all.
#[derive(Debug, Default)]
pub(crate) struct Names {
    next: u32,
}

/// What every generated name starts with. The `m` is this transform's; the
/// other transforms in `hermes-parser` each have their own letter.
const GENERATED_PREFIX: &str = "$$gen$m";

impl Names {
    pub fn after(source: &str) -> Self {
        let mut next = 0u32;
        for (at, _) in source.match_indices(GENERATED_PREFIX) {
            let digits: String = source[at + GENERATED_PREFIX.len()..]
                .chars()
                .take_while(char::is_ascii_digit)
                .collect();
            if let Ok(index) = digits.parse::<u32>() {
                next = next.max(index.saturating_add(1));
            }
        }
        Self { next }
    }

    pub fn reserve(&mut self) -> String {
        let name = format!("{GENERATED_PREFIX}{}", self.next);
        self.next += 1;
        name
    }
}

/// The message `TransformMatchSyntax` throws when no case matched, misspelling
/// included: it is the string the ecosystem's tests assert on.
const FALLTHROUGH: &str =
    "Match: No case succesfully matched. Make exhaustive or add a wildcard case using '_'. ";

/// One step from the match argument down to the value a pattern looks at.
#[derive(Debug, Clone)]
pub(crate) enum Step {
    /// `.foo`, from an identifier key.
    Field(String),
    /// `[…]`, from a literal key or an array index, as written.
    Index(String),
}

/// The path from the argument to a value. Empty is the argument itself.
pub(crate) type Key = Vec<Step>;

fn key_expression(root: &str, key: &Key) -> String {
    let mut out = root.to_owned();
    for step in key {
        match step {
            Step::Field(name) => {
                out.push('.');
                out.push_str(name);
            }
            Step::Index(text) => {
                out.push('[');
                out.push_str(text);
                out.push(']');
            }
        }
    }
    out
}

/// A test a case has to pass, in the order `TransformMatchSyntax` emits it.
#[derive(Debug)]
pub(crate) enum Condition {
    /// `<x> === <value>`, where the value is the pattern as written.
    Equals { key: Key, value: Range<u32> },
    /// `Number.isNaN(<x>)`, which is what the identifier pattern `NaN` means.
    NotANumber { key: Key },
    /// `Array.isArray(<x>) && <x>.length === <length>`, or `>=` with a rest.
    Array {
        key: Key,
        length: usize,
        exact: bool,
    },
    /// `(typeof <x> === "object" && <x> !== null) || typeof <x> === "function"`
    Object { key: Key },
    /// `<x> instanceof <constructor>`
    Instance { key: Key, constructor: Range<u32> },
    /// `<literal> in <x>`, for a property whose pattern could match `undefined`.
    PropertyExists { key: Key, literal: String },
    /// `<a> || <b> || …`, one branch per alternative of an `or` pattern.
    Or(Vec<Vec<Condition>>),
}

impl Condition {
    /// Appends this condition's tests. Two of them for an array, because the
    /// JavaScript transform emits `isArray` and the length check separately.
    ///
    /// Anything containing `||` is parenthesised here rather than left to a
    /// printer, since these are strings joined with `&&` and not a tree.
    fn push_tests(&self, source: &str, root: &str, out: &mut Vec<String>) {
        match self {
            Self::Equals { key, value } => out.push(format!(
                "{} === {}",
                key_expression(root, key),
                slice(source, value)
            )),
            Self::NotANumber { key } => {
                out.push(format!("Number.isNaN({})", key_expression(root, key)));
            }
            Self::Array { key, length, exact } => {
                let value = key_expression(root, key);
                let operator = if *exact { "===" } else { ">=" };
                out.push(format!("Array.isArray({value})"));
                out.push(format!("{value}.length {operator} {length}"));
            }
            Self::Object { key } => {
                let value = key_expression(root, key);
                out.push(format!(
                    "((typeof {value} === \"object\" && {value} !== null) \
                     || typeof {value} === \"function\")"
                ));
            }
            Self::Instance { key, constructor } => out.push(format!(
                "{} instanceof {}",
                key_expression(root, key),
                slice(source, constructor)
            )),
            Self::PropertyExists { key, literal } => {
                out.push(format!("{literal} in {}", key_expression(root, key)));
            }
            Self::Or(branches) => {
                let branches = branches
                    .iter()
                    .map(|conditions| conjunction(source, root, conditions))
                    .collect::<Vec<_>>()
                    .join(" || ");
                out.push(format!("({branches})"));
            }
        }
    }
}

/// The whole test for a case: every condition, joined with `&&`.
fn conjunction(source: &str, root: &str, conditions: &[Condition]) -> String {
    let mut tests = Vec::new();
    for condition in conditions {
        condition.push_tests(source, root, &mut tests);
    }
    tests.join(" && ")
}

/// A variable a pattern introduces for its case's body.
#[derive(Debug)]
pub(crate) enum Binding {
    /// `const <name> = <x>;`
    Value {
        key: Key,
        kind: &'static str,
        name: String,
    },
    /// `const <name> = <x>.slice(<after>);`
    ArrayRest {
        key: Key,
        kind: &'static str,
        name: String,
        after: usize,
    },
    /// `const {<excluded>, ...<name>} = <x>;`
    ObjectRest {
        key: Key,
        kind: &'static str,
        name: String,
        exclude: Vec<Step>,
    },
}

impl Binding {
    /// The declaration this binding becomes. An object rest needs a throwaway
    /// name per property it excludes, which is where the generated names beyond
    /// the label and the root come from.
    fn render(&self, root: &str, names: &mut Names) -> String {
        match self {
            Self::Value { key, kind, name } => {
                format!("{kind} {name} = {};", key_expression(root, key))
            }
            Self::ArrayRest {
                key,
                kind,
                name,
                after,
            } => format!(
                "{kind} {name} = {}.slice({after});",
                key_expression(root, key)
            ),
            Self::ObjectRest {
                key,
                kind,
                name,
                exclude,
            } => {
                let mut properties = exclude
                    .iter()
                    .map(|step| match step {
                        Step::Field(field) => format!("{field}: {}", names.reserve()),
                        Step::Index(text) => format!("[{text}]: {}", names.reserve()),
                    })
                    .collect::<Vec<_>>();
                properties.push(format!("...{name}"));
                format!(
                    "{kind} {{{}}} = {};",
                    properties.join(", "),
                    key_expression(root, key)
                )
            }
        }
    }
}

/// Which of `TransformMatchSyntax`'s three shapes a construct takes.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Form {
    /// A statement: a labelled block, one `if` per case, `break` out of the
    /// label at the end of a case's body.
    Statement,
    /// An expression with no bindings and an argument that is safe to evaluate
    /// once per test: nested conditionals, and no function at all.
    Conditional,
    /// An expression that needs somewhere to put a binding: an immediately
    /// invoked arrow taking the argument as its parameter.
    Iife,
}

/// One `<pattern> [if (<guard>)] => <body>`, with the spans it sits on.
#[derive(Debug)]
pub(crate) struct MatchCase {
    pub conditions: Vec<Condition>,
    pub bindings: Vec<Binding>,
    /// The pattern's first byte to the body's last, the body's own parentheses
    /// included — which the case node's own range leaves out.
    pub span: Range<u32>,
    pub body: Range<u32>,
    pub guard: Option<Range<u32>>,
    /// Just past the `=>`. Everything before it belongs to the transform;
    /// everything after it, up to the body, is the body's own parentheses.
    pub arrow: u32,
}

/// `match (x) { … }`, laid out over the source it replaces.
///
/// Only the gaps are written: the argument keeps its bytes wherever the shape
/// allows, and every case body does, so the erasure walk reaches the Flow
/// inside them and the piece table composes the two sets of edits.
#[derive(Debug)]
pub(crate) struct Match {
    pub form: Form,
    pub span: Range<u32>,
    pub argument: Range<u32>,
    /// The argument's text once its own Flow is erased.
    ///
    /// `None` means it stays where it is, which is the statement form binding
    /// it to a name. The conditional form repeats it inside every test and the
    /// iife form moves it past the cases, and neither can be done with the
    /// original bytes in place.
    pub argument_text: Option<String>,
    /// What the tests and bindings read from: a generated name, or the
    /// argument's own text when it is cheap enough to repeat.
    pub root: String,
    /// The label a case breaks out of. Only the statement form has one.
    pub label: Option<String>,
    /// A case body awaits, so the arrow the iife form wraps them in has to be
    /// async — and the call to it awaited, so the construct still evaluates to
    /// the body's value rather than to a promise.
    pub asynchronous: bool,
    /// A case that matches everything, so the fallthrough throw is dead.
    pub has_wildcard: bool,
    /// Every case up to and including a wildcard. Cases after one are dead and
    /// are not here; the last case's trailing edit covers their bytes.
    pub cases: Vec<MatchCase>,
}

impl Match {
    /// Every edit that turns the construct into JavaScript, in source order.
    ///
    /// Each is a replacement, and the ones with an empty span are insertions
    /// into a case body — a binding after its `{`, a `break` before its `}`.
    pub fn edits(&self, source: &str, names: &mut Names) -> Vec<(Range<u32>, String)> {
        let mut edits = Vec::new();
        let first = self
            .cases
            .first()
            .map_or(self.span.end, |case| case.span.start);

        let mut opening = self.open();
        if self.argument_text.is_none() {
            // `match (` … the argument stays … `) {`.
            edits.push((self.span.start..self.argument.start, opening));
            opening = ");".to_owned();
            if self.cases.is_empty() {
                opening += &self.tail(false);
            }
            edits.push((self.argument.end..first, opening));
        } else {
            if self.cases.is_empty() {
                opening += &self.tail(false);
            }
            edits.push((self.span.start..first, opening));
        }

        for (index, case) in self.cases.iter().enumerate() {
            let last = index + 1 == self.cases.len();
            let next = match self.cases.get(index + 1) {
                Some(following) => following.span.start,
                // Everything left of the construct, dead cases included.
                None => self.span.end,
            };
            let tests = conjunction(source, &self.root, &case.conditions);
            let bindings = case
                .bindings
                .iter()
                .map(|binding| binding.render(&self.root, names))
                .collect::<String>();
            let (head, joint, mut tail) = match self.form {
                Form::Statement => self.statement_case(case, &tests, &bindings),
                Form::Conditional => self.conditional_case(case, &tests, last),
                Form::Iife => self.iife_case(case, &tests, &bindings),
            };
            if last {
                tail += &self.tail(true);
            }

            let head_end = case.guard.as_ref().map_or(case.arrow, |guard| guard.start);
            edits.push((case.span.start..head_end, head));
            if let Some(guard) = &case.guard {
                // The `(` and `)` the guard is written with are reused as the
                // parentheses the generated `if` or conditional needs.
                edits.push((guard.end..case.arrow, joint));
            }
            if self.form == Form::Statement {
                let label = self.label.as_deref().unwrap_or_default();
                if case.guard.is_none() && !bindings.is_empty() {
                    let at = case.body.start + 1;
                    edits.push((at..at, bindings.clone()));
                }
                // A newline, not a semicolon: the body's last statement may
                // have relied on automatic insertion, and `break` can never
                // continue an expression, so the newline restores it.
                let at = case.body.end - 1;
                edits.push((at..at, format!("\nbreak {label};")));
            }
            edits.push((case.span.end..next, tail));
        }

        edits
    }

    /// `if (<tests>) ` and, when a guard needs the body's braces for itself, an
    /// outer block for the bindings to live in.
    fn statement_case(
        &self,
        case: &MatchCase,
        tests: &str,
        bindings: &str,
    ) -> (String, String, String) {
        let mut head = String::new();
        if !case.conditions.is_empty() {
            head = format!("if ({tests}) ");
        }
        if case.guard.is_none() {
            // The body's own braces are the case's block, so the bindings are
            // inserted after its `{` rather than written here.
            return (head, String::new(), String::new());
        }
        head.push('{');
        head += bindings;
        head += "if (";
        (head, ") ".to_owned(), "}".to_owned())
    }

    /// `<tests> ? <body> : …`, one conditional per case.
    fn conditional_case(
        &self,
        case: &MatchCase,
        tests: &str,
        last: bool,
    ) -> (String, String, String) {
        let mut head = String::new();
        if !case.conditions.is_empty() {
            head += tests;
            head += if case.guard.is_some() { " && " } else { " ? " };
        }
        if case.guard.is_some() {
            head.push('(');
        }
        let tail = if last {
            String::new()
        } else {
            " : ".to_owned()
        };
        (head, ") ? ".to_owned(), tail)
    }

    /// `if (<tests>) { <bindings> return <body>; }`, one statement per case.
    fn iife_case(&self, case: &MatchCase, tests: &str, bindings: &str) -> (String, String, String) {
        let block = !case.conditions.is_empty() || !case.bindings.is_empty();
        let mut head = String::new();
        if !case.conditions.is_empty() {
            head = format!("if ({tests}) {{");
        } else if block {
            head.push('{');
        }
        head += bindings;
        head += if case.guard.is_some() {
            "if ("
        } else {
            "return "
        };
        let tail = if block { ";}" } else { ";" };
        (head, ") return ".to_owned(), tail.to_owned())
    }

    /// What replaces `match (` — and the argument with it, unless it stays.
    fn open(&self) -> String {
        let label = self.label.as_deref().unwrap_or_default();
        match self.form {
            Form::Statement if self.argument_text.is_none() => {
                // The argument keeps its bytes, so it is parenthesised here:
                // `match (a, b)` would otherwise declare two variables.
                format!("{label}: {{const {} = (", self.root)
            }
            Form::Statement => format!("{label}: {{"),
            // A conditional expression binds looser than almost everything, so
            // it is wrapped whatever context the match sat in.
            Form::Conditional => "(".to_owned(),
            // The `await` is legal wherever the construct stood: a case body
            // only awaits if the function around it does.
            Form::Iife if self.asynchronous => format!("(await (async ({}) => {{", self.root),
            Form::Iife => format!("(({}) => {{", self.root),
        }
    }

    /// What follows the last case body, or the whole construct when it has no
    /// cases. `after_case` distinguishes the two: only a conditional that has a
    /// case in front of it needs the `:` that separates them.
    fn tail(&self, after_case: bool) -> String {
        // Nothing reached a case, which the JavaScript transform reports by
        // throwing. A wildcard case makes that unreachable, so it is left out.
        let unmatched = match self.has_wildcard {
            true => String::new(),
            false => format!("throw Error(\"{FALLTHROUGH}Argument: \" + {});", self.root),
        };
        match self.form {
            Form::Statement if self.has_wildcard => "}".to_owned(),
            Form::Statement => format!(" {unmatched}}}"),
            Form::Conditional if self.has_wildcard => ")".to_owned(),
            Form::Conditional => {
                let separator = if after_case { " : " } else { "" };
                format!("{separator}(() => {{{unmatched}}})())")
            }
            // The argument is parenthesised for the same reason the statement
            // form parenthesises it: a sequence expression would otherwise
            // become two arguments.
            Form::Iife => format!(
                "{unmatched}}})(({})){}",
                self.argument_text.as_deref().unwrap_or_default(),
                if self.asynchronous { ")" } else { "" }
            ),
        }
    }
}

fn slice<'a>(source: &'a str, span: &Range<u32>) -> &'a str {
    &source[span.start as usize..span.end as usize]
}
