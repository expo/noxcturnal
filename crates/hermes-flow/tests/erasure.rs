//! What the rules do to real Flow, checked against the linked Hermes.
//!
//! Every case here is either a rule from `PLAN_NATIVE_FLOW_ERASURE.md` or a
//! place the plan's first draft got wrong. The output is compared as text
//! because that is the point of erasure: the formatting the Babel printer would
//! have destroyed survives.

#![cfg(feature = "parser")]

use hermes_flow::{BailKind, erase_source};

#[track_caller]
fn erased(source: &str) -> String {
    erase_source(source)
        .unwrap_or_else(|bail| panic!("bailed on {source:?}: {bail}"))
        .apply(source)
}

#[track_caller]
fn bailed(source: &str) -> BailKind {
    match erase_source(source) {
        Ok(erasure) => panic!(
            "expected a bail for {source:?}, erased to {:?}",
            erasure.apply(source)
        ),
        Err(bail) => bail.kind,
    }
}

#[test]
fn leaves_plain_javascript_byte_identical() {
    for source in [
        "const x = 1;\n",
        "export default function f(a, b) { return a + b; }\n",
        "class A extends B { #x = 1; static y = 2; get z() { return 3; } }\n",
        "const f = async (a) => { for await (const x of y) {} };\n",
        "import a, { b as c } from './m';\nexport { c };\nexport * from './n';\n",
        "const o = { ...rest, [k]: v, m() {}, get g() { return 1; } };\n",
        "label: for (;;) { break label; }\n",
        "const re = /a?b/gu, t = `x${y}z`;\n",
    ] {
        assert_eq!(erased(source), source, "changed plain JavaScript");
    }
}

#[test]
fn erases_type_declarations_whole() {
    assert_eq!(
        erased("type A = number;\nconst x = 1;\n"),
        "\nconst x = 1;\n"
    );
    assert_eq!(erased("opaque type A = number;\n"), "\n");
    assert_eq!(erased("interface I { a: number }\n"), "\n");
    assert_eq!(erased("declare var x: number;\n"), "\n");
    assert_eq!(erased("declare function f(): void;\n"), "\n");
    assert_eq!(erased("declare class C {}\n"), "\n");
    assert_eq!(
        erased("declare module 'm' { declare var x: number; }\n"),
        "\n"
    );
    assert_eq!(erased("declare module.exports: number;\n"), "\n");
    assert_eq!(erased("declare export default number;\n"), "\n");
    assert_eq!(erased("declare export * from 'm';\n"), "\n");
}

#[test]
fn erases_annotations_on_bindings() {
    assert_eq!(erased("const x: number = 1;\n"), "const x = 1;\n");
    assert_eq!(erased("let y: ?string;\n"), "let y;\n");
    assert_eq!(
        erased("function f(a: number, b: string): void {}\n"),
        "function f(a, b) {}\n"
    );
    assert_eq!(
        erased("const {a}: Props = p;\nconst [b]: Array<T> = q;\n"),
        "const {a} = p;\nconst [b] = q;\n"
    );
}

/// The rule the plan calls out as having no node to anchor to: `optional` is a
/// boolean, so the `?` has to be found in the gap between the name and the
/// annotation. `?string` puts a second `?` inside the annotation, which is why
/// the search is bounded by the annotation's start rather than the node's end.
#[test]
fn erases_the_optional_marker() {
    assert_eq!(erased("function f(x?: string) {}\n"), "function f(x) {}\n");
    assert_eq!(erased("function f(x?: ?string) {}\n"), "function f(x) {}\n");
    assert_eq!(erased("function f(x?) {}\n"), "function f(x) {}\n");
    // `ClassProperty.optional` is in the rules because `ESTree.def` declares
    // it, but this Hermes rejects `foo?: T` in a class body: the field is only
    // reachable inside a `declare class` or an interface, both of which are
    // erased wholesale. Pinned here so a pin bump that starts accepting it
    // shows up as a test failure rather than as wrong output.
    assert_eq!(bailed("class A { foo?: number; }\n"), BailKind::ParseFailed);
}

/// The other anchorless rule. Erasing only the annotation would leave `this` as
/// a real parameter, so the whole parameter goes, and its comma with it.
#[test]
fn erases_a_this_parameter() {
    assert_eq!(
        erased("function f(this: T, x: number) {}\n"),
        "function f( x) {}\n"
    );
    assert_eq!(erased("function f(this: T) {}\n"), "function f() {}\n");
    // Only at index 0: a later parameter named `this` is not a thing, but a
    // property named `this` is, and must not be touched.
    assert_eq!(
        erased("const o = { this: 1 };\n"),
        "const o = { this: 1 };\n"
    );
}

/// The case the plan says the equivalence harness must cover explicitly:
/// Hermes' JavaScript stripper drops the default from a typed parameter, and
/// erasure cannot, because the annotation span lies strictly inside `left` and
/// `right` lies outside it.
#[test]
fn keeps_defaults_on_typed_parameters() {
    assert_eq!(
        erased("function f(nodes: Array<number> = [], x?: string = 'a') {}\n"),
        "function f(nodes = [], x = 'a') {}\n"
    );
    assert_eq!(
        erased("const g = ({a}: Props = {}) => a;\n"),
        "const g = ({a} = {}) => a;\n"
    );
}

#[test]
fn erases_function_type_syntax() {
    assert_eq!(
        erased("function f<T>(x: T): T { return x; }\n"),
        "function f(x) { return x; }\n"
    );
    assert_eq!(
        erased("const g = <T>(x: T): T => x;\n"),
        "const g = (x) => x;\n"
    );
    assert_eq!(
        erased("function f(x: mixed): boolean %checks { return true; }\n"),
        "function f(x)  { return true; }\n"
    );
}

/// `superTypeArguments`, not `superTypeParameters` as the plan's first draft
/// had it, and `implements` needs the keyword that belongs to no node.
#[test]
fn erases_class_type_syntax() {
    assert_eq!(
        erased("class A<T> extends B<T> implements C, D {}\n"),
        "class A extends B  {}\n"
    );
    assert_eq!(erased("class A implements C {}\n"), "class A  {}\n");
    assert_eq!(
        erased("class A { +x: number; static -y: string; }\n"),
        "class A {   }\n"
    );
    assert_eq!(
        erased("class A { typed: number = 1; runtime; }\n"),
        "class A { typed = 1; runtime; }\n"
    );
    assert_eq!(
        erased("class A { #value: ?number; read() { return this.#value; } }\n"),
        "class A { #value; read() { return this.#value; } }\n"
    );
    assert_eq!(
        erased("class A { declare foo: number; }\n"),
        "class A {  }\n"
    );
}

#[test]
fn erases_call_and_jsx_type_arguments() {
    assert_eq!(erased("f<T>(x);\n"), "f(x);\n");
    assert_eq!(erased("new C<T>(x);\n"), "new C(x);\n");
    assert_eq!(erased("a?.b<T>(x);\n"), "a?.b(x);\n");
    // Missing from the plan's first draft.
    assert_eq!(erased("const e = <Foo<T> />;\n"), "const e = <Foo />;\n");
}

#[test]
fn erases_type_only_imports_and_exports() {
    assert_eq!(erased("import type A from 'm';\n"), "\n");
    assert_eq!(erased("import typeof A from 'm';\n"), "\n");
    assert_eq!(erased("export type A = number;\n"), "\n");
    // `export type * from` was missing from the plan's first draft.
    assert_eq!(erased("export type * from 'm';\n"), "\n");
    assert_eq!(
        erased("import { type A, B } from 'm';\n"),
        "import {  B } from 'm';\n"
    );
    assert_eq!(
        erased("import { A, type B } from 'm';\n"),
        "import { A } from 'm';\n"
    );
    // Every specifier type-only makes the whole declaration type-only, so it
    // goes. Leaving `import {} from 'm'` would keep the module in the
    // dependency graph — six type-only React Native modules and 426 KB of
    // bundle, measured against `apps/native-component-list`.
    assert_eq!(erased("import { type A } from 'm';\n"), "\n");
    assert_eq!(erased("import { type A, type B } from 'm';\n"), "\n");
}

/// A side-effect import starts with no specifiers and must survive. Hermes'
/// own stripper removes every zero-specifier import, which is why
/// `@expo/metro-config` carries a workaround to put them back; drawing the
/// distinction on "did it have specifiers to begin with" avoids needing one.
#[test]
fn keeps_side_effect_imports() {
    assert_eq!(erased("import './m';\n"), "import './m';\n");
    assert_eq!(
        erased("import 'm';\nimport type A from 'n';\n"),
        "import 'm';\n\n"
    );
}

#[test]
fn erases_casts_but_keeps_the_value() {
    assert_eq!(erased("const a = (x: number);\n"), "const a = (x);\n");
    assert_eq!(erased("const b = x as number;\n"), "const b = x ;\n");
    assert_eq!(erased("const c = x as const;\n"), "const c = x ;\n");
}

/// From the corpus. Hermes excludes a node's own parentheses from its range but
/// includes them in the enclosing node's, so bounding the erasure by the value's
/// end and the node's end swallows the `)` and the file stops parsing.
#[test]
fn keeps_the_parentheses_around_a_cast_value() {
    assert_eq!(
        erased("export default (a ? b : c) as component(...Props);\n"),
        "export default (a ? b : c) ;\n"
    );
    assert_eq!(erased("const d = (x) as T;\n"), "const d = (x) ;\n");
}

/// `as` is two letters and plenty of identifiers end in them, so the scan for
/// the keyword has to check both word boundaries.
#[test]
fn does_not_find_as_inside_an_identifier() {
    assert_eq!(
        erased("const e = (bananas: T);\n"),
        "const e = (bananas);\n"
    );
    assert_eq!(erased("const f = alias as T;\n"), "const f = alias ;\n");
}

/// The proposal transforms beside the stripper. Every expectation here was
/// taken from `hermes-parser`'s own JavaScript transforms — `TransformEnumSyntax`
/// and `TransformComponentSyntax` — and checked to canonicalise identically to
/// them, because their output is what the ecosystem's semantics are defined by.
#[test]
fn transforms_enum_declarations() {
    // A defaulted string enum is the `Mirrored` case.
    assert_eq!(
        erased("enum Status { Active, Off }\n"),
        "const Status = require(\"flow-enums-runtime\").Mirrored([\"Active\",\"Off\"])\n"
    );
    assert_eq!(
        erased("enum Suit of string { Hearts = \"h\" }\n"),
        "const Suit = require(\"flow-enums-runtime\")({Hearts: \"h\"})\n"
    );
    assert_eq!(
        erased("enum N of number { A = 1, B = 2 }\n"),
        "const N = require(\"flow-enums-runtime\")({A: 1, B: 2})\n"
    );
    // A defaulted member outside a string body is a symbol.
    assert_eq!(
        erased("enum S of symbol { A, B }\n"),
        "const S = require(\"flow-enums-runtime\")({A: Symbol(\"A\"), B: Symbol(\"B\")})\n"
    );
}

#[test]
fn transforms_component_declarations() {
    // Parameters become one object pattern in the parameter list, and the body
    // keeps its own bytes so the walk erases the Flow inside it.
    assert_eq!(
        erased("component Foo(bar: string) { return bar; }\n"),
        "function Foo({bar}) { return bar; }\n"
    );
    // `as` renames, defaults survive, and the `?` goes with the annotation.
    assert_eq!(
        erased("component Foo(a: T, b as c: U = 1) { return c; }\n"),
        "function Foo({a, b: c = 1}) { return c; }\n"
    );
    assert_eq!(
        erased("component Foo(x?: string = \"d\") { return x; }\n"),
        "function Foo({x = \"d\"}) { return x; }\n"
    );
    // A destructured binding keeps its pattern and loses its annotation.
    assert_eq!(
        erased("component Foo(prop as {a, b}: Props) { return a; }\n"),
        "function Foo({prop: {a, b}}) { return a; }\n"
    );
    // A sole rest parameter needs no pattern at all.
    assert_eq!(
        erased("component Foo(...props: P) { return props; }\n"),
        "function Foo(props) { return props; }\n"
    );
    assert_eq!(
        erased("component Foo(a: T, ...rest: R) { return rest; }\n"),
        "function Foo({a, ...rest}) { return rest; }\n"
    );
    assert_eq!(
        erased("component Foo() { return 1; }\n"),
        "function Foo() { return 1; }\n"
    );
    // Type parameters and the `renders` clause sit inside the replaced header.
    assert_eq!(
        erased("component Foo<T>(a: T) renders React.Node { return a; }\n"),
        "function Foo({a}) { return a; }\n"
    );
}

/// React 18 lifts `ref` out of props and wraps the component. The binding comes
/// before the function, which is safe because a function declaration hoists —
/// and is the order `TransformComponentSyntax` emits.
#[test]
fn transforms_component_ref_parameters() {
    assert_eq!(
        erased("component Foo(ref?: R, a: T) { return a; }\n"),
        "const Foo = React.forwardRef(Foo_withRef);\nfunction Foo_withRef({a}, ref) { return a; }\n"
    );
    // The sole-rest shortcut does not apply once a ref shares the list.
    assert_eq!(
        erased("component Foo(ref?: R, ...props: P) { return props; }\n"),
        "const Foo = React.forwardRef(Foo_withRef);\nfunction Foo_withRef({...props}, ref) { return props; }\n"
    );
    // A ref alone still needs a props slot, named as the JS transform names it.
    assert_eq!(
        erased("component Foo(ref?: R) { return null; }\n"),
        "const Foo = React.forwardRef(Foo_withRef);\nfunction Foo_withRef(_$$empty_props_placeholder$$, ref) { return null; }\n"
    );
    // A reference above the declaration would read the `const` before it is
    // initialised, so the file goes to the fallback instead.
    assert_eq!(
        bailed("const x = Foo;\ncomponent Foo(ref?: R) { return null; }\n"),
        BailKind::Proposal
    );
}

#[test]
fn transforms_hook_declarations() {
    // Only the keyword changes; the parameters are ordinary ones and the rules
    // erase the type parameters and return type like any other function's.
    assert_eq!(
        erased("hook useThing<T>(a: T): R { return a; }\n"),
        "function useThing(a) { return a; }\n"
    );
}

/// The fallthrough throw, misspelling included: it is the string
/// `TransformMatchSyntax` writes and the one the ecosystem's tests assert on.
const FELL_THROUGH: &str = "throw Error(\"Match: No case succesfully matched. \
     Make exhaustive or add a wildcard case using '_'. Argument: \"";

/// A match statement becomes a labelled block, one `if` per case, and a `break`
/// at the end of each body. The bodies keep their own bytes, which is why the
/// `break` is inserted before the `}` they already had.
#[test]
fn transforms_match_statements() {
    assert_eq!(
        erased("match (a) { 1 => { f(); }, _ => { g(); } }\n"),
        "$$gen$m0: {if (a === 1)  { f(); \nbreak $$gen$m0;} { g(); \nbreak $$gen$m0;}}\n"
    );
    // No wildcard, so falling off the end throws.
    assert_eq!(
        erased("match (a) { 1 => { f(); } }\n"),
        format!("$$gen$m0: {{if (a === 1)  {{ f(); \nbreak $$gen$m0;}} {FELL_THROUGH} + a);}}\n")
    );
    assert_eq!(
        erased("match (a) {}\n"),
        format!("$$gen$m0: {{ {FELL_THROUGH} + a);}}\n")
    );
    // A guard needs the body's braces for its own `if`, so the case gets an
    // outer block of its own.
    assert_eq!(
        erased("match (a) { 1 if (b) => { f(); }, _ => {} }\n"),
        "$$gen$m0: {if (a === 1) {if (b)  { f(); \nbreak $$gen$m0;}} {\nbreak $$gen$m0;}}\n"
    );
}

/// The `break` goes on a line of its own because the body's last statement may
/// have relied on automatic semicolon insertion, and a `break` on the same line
/// would join it.
#[test]
fn breaks_out_of_a_body_that_ends_without_a_semicolon() {
    assert_eq!(
        erased("match (a) { _ => { f() } }\n"),
        "$$gen$m0: { { f() \nbreak $$gen$m0;}}\n"
    );
}

/// An expression with nothing to bind and an argument that is safe to repeat
/// becomes nested conditionals — no function, and no name generated at all.
#[test]
fn transforms_match_expressions() {
    assert_eq!(
        erased("const e = match (a) { 1 => 'one', _ => 'other' };\n"),
        "const e = (a === 1 ?  'one' :  'other');\n"
    );
    assert_eq!(
        erased("const e = match (a) { 1 => 'one' };\n"),
        format!("const e = (a === 1 ?  'one' : (() => {{{FELL_THROUGH} + a);}})());\n")
    );
    assert_eq!(
        erased("const e = match (a) { 1 if (b) => 'one', _ => 'other' };\n"),
        "const e = (a === 1 && (b) ?  'one' :  'other');\n"
    );
    // The whole conditional is parenthesised, because a match expression can
    // stand where a conditional would need to be.
    assert_eq!(
        erased("const e = 1 + match (a) { _ => 2 };\n"),
        "const e = 1 + ( 2);\n"
    );
}

/// An argument that is not an identifier or a member chain over one cannot be
/// repeated, and neither can any argument once a case binds something. Then it
/// is evaluated once into a name — in front of the cases for a statement, and
/// as the parameter of the arrow the expression form becomes.
#[test]
fn binds_an_argument_it_cannot_repeat() {
    assert_eq!(
        erased("match (f()) { 1 => { g(); }, _ => {} }\n"),
        "$$gen$m0: {const $$gen$m1 = (f());if ($$gen$m1 === 1)  { g(); \
         \nbreak $$gen$m0;} {\nbreak $$gen$m0;}}\n"
    );
    assert_eq!(
        erased("const e = match (a) { const n => n + 1 };\n"),
        "const e = (($$gen$m0) => {{const n = $$gen$m0;return  n + 1;}})((a));\n"
    );
    // Parenthesised on both paths, whatever the argument's own range covered:
    // `match (a, b)` would otherwise declare two variables, or pass two
    // arguments.
    assert_eq!(
        erased("match (a, b) { _ => {} }\n"),
        "$$gen$m0: {const $$gen$m1 = ((a, b)); {\nbreak $$gen$m0;}}\n"
    );
}

/// Every pattern shape, against `TransformMatchSyntax`'s conditions for it.
#[test]
fn transforms_match_patterns() {
    // An object is `typeof`-checked, a property that could match `undefined`
    // is tested with `in`, and the property itself is read from the argument.
    assert_eq!(
        erased("const e = match (a) { {kind: 'x', const v} => v, _ => 0 };\n"),
        "const e = (($$gen$m0) => {if (((typeof $$gen$m0 === \"object\" && $$gen$m0 !== null) \
         || typeof $$gen$m0 === \"function\") && $$gen$m0.kind === 'x' && \"v\" in $$gen$m0) \
         {const v = $$gen$m0.v;return  v;}return  0;})((a));\n"
    );
    assert_eq!(
        erased("const e = match (a) { [1, ...const rest] => rest, _ => 0 };\n"),
        "const e = (($$gen$m0) => {if (Array.isArray($$gen$m0) && $$gen$m0.length >= 1 \
         && $$gen$m0[0] === 1) {const rest = $$gen$m0.slice(1);return  rest;}return  0;})((a));\n"
    );
    // An instance pattern replaces the object check with `instanceof`.
    assert_eq!(
        erased("const e = match (a) { Box {const v} => v, _ => 0 };\n"),
        "const e = (($$gen$m0) => {if ($$gen$m0 instanceof Box && \"v\" in $$gen$m0) \
         {const v = $$gen$m0.v;return  v;}return  0;})((a));\n"
    );
    // An object rest names every property it excludes, which is where the
    // generated names past the argument's come from.
    assert_eq!(
        erased("const e = match (a) { {const x, ...const rest} => rest, _ => 0 };\n"),
        "const e = (($$gen$m0) => {if (((typeof $$gen$m0 === \"object\" && $$gen$m0 !== null) \
         || typeof $$gen$m0 === \"function\") && \"x\" in $$gen$m0) {const x = $$gen$m0.x;\
         const {x: $$gen$m1, ...rest} = $$gen$m0;return  rest;}return  0;})((a));\n"
    );
    assert_eq!(
        erased("const e = match (a) { [1] as whole => whole, _ => 0 };\n"),
        "const e = (($$gen$m0) => {if (Array.isArray($$gen$m0) && $$gen$m0.length === 1 \
         && $$gen$m0[0] === 1) {const whole = $$gen$m0;return  whole;}return  0;})((a));\n"
    );
    // An alternation is parenthesised, a bare `NaN` is not an equality test at
    // all, and a bare name is a comparison against that variable.
    assert_eq!(
        erased("const e = match (a) { 1 | 2 => 'low', NaN => 'nan', b.c => 'ref', _ => 0 };\n"),
        "const e = ((a === 1 || a === 2) ?  'low' : Number.isNaN(a) ?  'nan' \
         : a === b.c ?  'ref' :  0);\n"
    );
}

/// A numeric key is the property `String(key)` names, so `0x10` is `"16"` in
/// the existence test while the lookup keeps the literal as written.
#[test]
fn names_a_numeric_property_as_javascript_prints_it() {
    assert_eq!(
        erased("const e = match (a) { {'b b': 1, 0x10: const v} => v, _ => 0 };\n"),
        "const e = (($$gen$m0) => {if (((typeof $$gen$m0 === \"object\" && $$gen$m0 !== null) \
         || typeof $$gen$m0 === \"function\") && $$gen$m0['b b'] === 1 && \"16\" in $$gen$m0) \
         {const v = $$gen$m0[0x10];return  v;}return  0;})((a));\n"
    );
}

/// The point of laying the transform over the source: a case body is not
/// rebuilt, so the walk erases the Flow inside it and the two sets of edits
/// compose. A guard is left in place for the same reason.
#[test]
fn erases_flow_inside_the_parts_it_keeps() {
    assert_eq!(
        erased("match (a) { 1 => { const x: number = 1; }, _ => {} }\n"),
        "$$gen$m0: {if (a === 1)  { const x = 1; \nbreak $$gen$m0;} {\nbreak $$gen$m0;}}\n"
    );
    assert_eq!(
        erased("const e = match (a) { 1 => (x: T), _ => 0 };\n"),
        "const e = (a === 1 ?  (x) :  0);\n"
    );
    assert_eq!(
        erased("const e = match (a) { const n if (n as number) => n, _ => 0 };\n"),
        "const e = (($$gen$m0) => {{const n = $$gen$m0;if (n ) return  n;}return  0;})((a));\n"
    );
}

/// A case below one that matches everything never runs, so it is not walked and
/// its bytes go with the rest of the construct.
#[test]
fn drops_cases_below_a_wildcard() {
    assert_eq!(
        erased("match (a) { _ => { f(); }, 1 => { dead(); } }\n"),
        "$$gen$m0: { { f(); \nbreak $$gen$m0;}}\n"
    );
}

/// `TransformMatchSyntax` avoids colliding with a name the file wrote itself by
/// noting the identifiers its traversal has passed, which misses one further
/// down the file. Counting from above every such name in the source does not.
#[test]
fn numbers_names_above_the_ones_the_file_uses() {
    assert_eq!(
        erased("const $$gen$m0 = 1;\nmatch (a) { _ => { f($$gen$m0); } }\n"),
        "const $$gen$m0 = 1;\n$$gen$m1: { { f($$gen$m0); \nbreak $$gen$m1;}}\n"
    );
}

/// Each of these is a `createSyntaxError` in `TransformMatchSyntax`, so no
/// implementation compiles them and there is nothing to fall back to. The
/// message is the transform's own, and it carries a position, because the point
/// of reporting here rather than bailing is that the report is useful.
#[test]
fn rejects_match_syntax_no_transform_compiles() {
    for (source, expected) in [
        // A `var` would hoist out of the case it was written in.
        (
            "const e = match (a) { var y => y };\n",
            "'var' bindings are not allowed. Use 'const' or 'let'. (1:23)",
        ),
        (
            "const e = match (a) { {const x, other: const x} => x };\n",
            "Duplicate variable name 'x' in match case pattern. (1:40)",
        ),
        (
            "const e = match (a) { {const x, x: 1} => x };\n",
            "Duplicate property name 'x' in match object pattern. (1:33)",
        ),
        // Unspecified rather than invalid, but the ecosystem's answer is the
        // same error either way, and inventing semantics is not an option.
        (
            "const e = match (a) { const x | const y => 0 };\n",
            "Bindings in match 'or' patterns are not yet supported. (1:23)",
        ),
        (
            "const e = match (a) { +0 => 1, _ => 2 };\n",
            "'+0' and '-0' are not yet supported in match unary patterns. (1:23)",
        ),
        (
            "const e = match (a) { const x as y => 0 };\n",
            "Match 'as' patterns are not allowed directly on binding patterns. (1:23)",
        ),
    ] {
        let bail = erase_source(source).expect_err(source);
        assert_eq!(bail.kind, BailKind::Rejected, "{source:?}");
        assert!(!bail.kind.has_fallback());
        assert_eq!(bail.detail, expected);
    }
}

/// A match expression that binds moves its case bodies into an arrow, and an
/// `await` does not survive that on its own. `TransformMatchSyntax` emits the
/// plain arrow and produces a file that does not parse; making the arrow async
/// and awaiting the call compiles the same program, one tick later.
#[test]
fn awaits_through_the_function_it_wraps_a_case_in() {
    assert_eq!(
        erased("async function f() { return match (a) { const n => await g(n) }; }\n"),
        "async function f() { return (await (async ($$gen$m0) => \
         {{const n = $$gen$m0;return  await g(n);}})((a))); }\n"
    );
    // Only where the wrapping happens. A statement's bodies stay where they
    // are, an argument stays outside the arrow, and a conditional has no
    // function in it at all.
    assert_eq!(
        erased("async function f() { match (a) { _ => { await g(); } } }\n"),
        "async function f() { $$gen$m0: { { await g(); \nbreak $$gen$m0;}} }\n"
    );
    assert_eq!(
        erased("async function f() { return match (a) { 1 => await g(1), _ => 0 }; }\n"),
        "async function f() { return (a === 1 ?  await g(1) :  0); }\n"
    );
    // An `await` inside a function of the case's own belongs to that function,
    // and wrapping on its account would put an `await` where none is allowed.
    assert_eq!(
        erased("function f() { return match (a) { const n => (async () => await g(n))() }; }\n"),
        "function f() { return (($$gen$m0) => {{const n = $$gen$m0;\
         return  (async () => await g(n))();}})((a)); }\n"
    );
}

/// `yield` has no such lowering: delegating to an inner generator would change
/// what `this`, `super`, `arguments`, and `new.target` mean inside the body,
/// and a generator cannot be an arrow. Nothing else compiles it either.
#[test]
fn rejects_a_yield_it_would_have_to_wrap() {
    let bail = erase_source("function* f() { return match (a) { const n => yield n }; }\n")
        .expect_err("yield");
    assert_eq!(bail.kind, BailKind::Rejected);
    assert!(
        bail.detail.starts_with("'yield' is not supported"),
        "{bail}"
    );
    // A generator whose match binds nothing keeps the `yield` where it is.
    assert_eq!(
        erased("function* f() { return match (a) { 1 => yield 1, _ => 0 }; }\n"),
        "function* f() { return (a === 1 ?  yield 1 :  0); }\n"
    );
}

/// Records are the one proposal the shim parses and nothing here rewrites.
#[test]
fn bails_on_untransformed_proposals() {
    assert_eq!(bailed("const x = R {a: 1};\n"), BailKind::Proposal);
}

#[test]
fn bails_on_decorators() {
    assert_eq!(
        bailed("class A { @dec foo = 1; }\n"),
        BailKind::UnhandledSyntax
    );
}

#[test]
fn bails_on_a_syntax_error() {
    assert_eq!(bailed("const = ;\n"), BailKind::ParseFailed);
}

/// Erasure preserves formatting where the Babel printer reformats. That is the
/// property the byte-identical corpus gate loses and the equivalence harness
/// replaces, so it is worth pinning directly.
#[test]
fn preserves_formatting_around_what_it_removes() {
    let source = "// leading comment\n\
                  const   x   : number   =   1 ;   // trailing\n\
                  \n\
                  \tfunction  f ( a : string ) : void { }\n";
    assert_eq!(
        erased(source),
        "// leading comment\n\
         const   x      =   1 ;   // trailing\n\
         \n\
         \tfunction  f ( a  )  { }\n"
    );
}
