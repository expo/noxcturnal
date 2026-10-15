use std::collections::VecDeque;
use std::fmt::Write as _;
use std::path::{Path, PathBuf};
use std::rc::Rc;

use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use oxc_allocator::{Allocator, Box as ArenaBox, CloneIn, TakeIn};
use oxc_ast::{
    AstBuilder, AstKind,
    ast::{
        Argument, AssignmentTargetPattern, CatchClause, Class, Decorator, Expression,
        ForOfStatement, FormalParameters, IdentifierReference, ImportDeclarationSpecifier,
        MethodDefinition, PrivateInExpression, Program, PropertyKey, RegExpFlags, RegExpLiteral,
        Statement, StaticMemberExpression, StringLiteral, TSTypeParameterInstantiation,
        VariableDeclarator, WithClause,
    },
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions};
use oxc_parser::{ParseOptions, Parser};
#[cfg(feature = "react_compiler")]
use oxc_react_compiler::{
    CompilationMode, CompilerTarget, PanicThreshold, PluginOptions as ReactCompilerOptions,
};
use oxc_semantic::{NodeId, Scoping, SemanticBuilder, SymbolFlags};
use oxc_span::{GetSpan, SourceType, Span};
use oxc_syntax::scope::ScopeFlags;
use oxc_transformer::{
    CompilerAssumptions, HelperLoaderMode, JsxOptions, JsxRuntime, ReactRefreshOptions,
    TransformOptions, Transformer,
};
use rustc_hash::FxHashMap;
use self_cell::self_cell;

use crate::sourcemap::{DecodedLayer, compose_decoded_layers, pack_decoded_layer};
use crate::syntax::classification::source_type;

use super::block_scoping;
use super::helpers::{
    CustomHelper, CustomHelperRequests, RuntimeAvailability, RuntimeHelperPolicy,
    SourceNameReservations, compatibility_for_request, inline_helpers,
};
use super::object_spread;
use super::optimize;
use super::options::NativePreflightOptions;

struct ExportNamespaceAttribute<'a> {
    source: String,
    exported: String,
    with_clause: Option<ArenaBox<'a, WithClause<'a>>>,
}

fn capture_export_namespace_attributes<'a>(
    allocator: &'a Allocator,
    program: &Program<'a>,
) -> Vec<ExportNamespaceAttribute<'a>> {
    program
        .body
        .iter()
        .filter_map(|statement| {
            let Statement::ExportAllDeclaration(declaration) = statement else {
                return None;
            };
            let exported = declaration.exported.as_ref()?;
            let with_clause = declaration.with_clause.as_ref()?;
            Some(ExportNamespaceAttribute {
                source: declaration.source.value.to_string(),
                exported: exported.name().to_string(),
                with_clause: Some(with_clause.clone_in(allocator)),
            })
        })
        .collect()
}

fn restore_export_namespace_attributes<'a>(
    program: &mut Program<'a>,
    attributes: &mut [ExportNamespaceAttribute<'a>],
) {
    if attributes.is_empty() {
        return;
    }
    let mut pending = FxHashMap::<String, FxHashMap<String, VecDeque<_>>>::default();
    for attribute in attributes {
        pending
            .entry(std::mem::take(&mut attribute.source))
            .or_default()
            .entry(std::mem::take(&mut attribute.exported))
            .or_default()
            .push_back(attribute.with_clause.take());
    }
    for index in 0..program.body.len().saturating_sub(1) {
        let (before, after) = program.body.split_at_mut(index + 1);
        let Statement::ImportDeclaration(import) = &mut before[index] else {
            continue;
        };
        if import.with_clause.is_some() {
            continue;
        }
        let Some(import_specifiers) = import.specifiers.as_ref() else {
            continue;
        };
        let [ImportDeclarationSpecifier::ImportNamespaceSpecifier(namespace)] =
            import_specifiers.as_slice()
        else {
            continue;
        };
        let Statement::ExportNamedDeclaration(export) = &after[0] else {
            continue;
        };
        let [specifier] = export.specifiers.as_slice() else {
            continue;
        };
        if specifier.local.name() != namespace.local.name {
            continue;
        }
        let Some(with_clause) = pending
            .get_mut(import.source.value.as_str())
            .and_then(|exports| exports.get_mut(specifier.exported.name().as_str()))
            .and_then(VecDeque::pop_front)
        else {
            continue;
        };
        import.with_clause = with_clause;
    }
}

struct AsyncIteratorResultValidator<'a, 's> {
    ast: oxc_ast::AstBuilder<'a>,
    iterators: rustc_hash::FxHashSet<oxc_semantic::SymbolId>,
    scoping: &'s Scoping,
    helper: String,
    changed: bool,
}

impl AsyncIteratorResultValidator<'_, '_> {
    fn is_iterator_call(&self, expression: &Expression<'_>) -> bool {
        let Expression::CallExpression(call) = expression else {
            return false;
        };
        let Expression::StaticMemberExpression(member) = &call.callee else {
            return false;
        };
        matches!(member.property.name.as_str(), "next" | "return")
            && matches!(&member.object, Expression::Identifier(identifier) if identifier.reference_id.get().and_then(|id| self.scoping.get_reference(id).symbol_id()).is_some_and(|id| self.iterators.contains(&id)))
    }
}

impl<'a> VisitMut<'a> for AsyncIteratorResultValidator<'a, '_> {
    #[expect(deprecated)]
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        walk_mut::walk_expression(self, expression);
        let should_wrap = match expression {
            Expression::AwaitExpression(await_expression) => {
                self.is_iterator_call(&await_expression.argument)
            }
            Expression::YieldExpression(yield_expression) => yield_expression
                .argument
                .as_ref()
                .is_some_and(|argument| self.is_iterator_call(argument)),
            _ => false,
        };
        if !should_wrap {
            return;
        }
        let span = expression.span();
        let value = expression.take_in(&self.ast);
        *expression = self.ast.expression_call(
            span,
            self.ast
                .expression_identifier(span, self.ast.allocator.alloc_str(&self.helper)),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            self.ast.vec1(Argument::from(value)),
            false,
        );
        self.changed = true;
    }
}

fn validate_generated_async_iterator_results<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    scoping: &Scoping,
    generated_iterators: &[oxc_semantic::SymbolId],
) -> CustomHelperRequests {
    if generated_iterators.is_empty() {
        return CustomHelperRequests::default();
    }
    let used = scoping
        .symbol_names()
        .chain(
            scoping
                .root_unresolved_references()
                .keys()
                .map(|name| name.as_str()),
        )
        .map(str::to_owned)
        .collect::<rustc_hash::FxHashSet<_>>();
    let mut helper = "_iteratorResult".to_owned();
    let mut suffix = 2;
    while used.contains(&helper)
        || scoping
            .root_unresolved_references()
            .contains_key(helper.as_str())
    {
        helper = format!("_iteratorResult{suffix}");
        suffix += 1;
    }
    let mut validator = AsyncIteratorResultValidator {
        ast: oxc_ast::AstBuilder::new(allocator),
        iterators: generated_iterators.iter().copied().collect(),
        scoping,
        helper: helper.clone(),
        changed: false,
    };
    validator.visit_program(program);
    if !validator.changed {
        return CustomHelperRequests::default();
    }
    let mut requests = CustomHelperRequests::default();
    requests.materialize_custom(CustomHelper::IteratorResult, &helper);
    requests
}

#[napi(object)]
pub struct NativePreflightResult {
    pub status: String,
    pub changed: bool,
    pub normalized_javascript: bool,
    pub jsx: bool,
    pub reason: Option<String>,
    pub code: Option<String>,
    pub map: Option<Buffer>,
    pub diagnostics: Vec<String>,
    pub helpers_used: Vec<String>,
}

struct ParseOwner {
    allocator: Allocator,
    source: String,
    source_type: SourceType,
}

type ParsedProgram<'a> = oxc_parser::ParserReturn<'a>;

self_cell! {
    struct OwnedProgram {
        owner: ParseOwner,

        #[covariant]
        dependent: ParsedProgram,
    }
}

fn parse_owned(
    source: String,
    source_type: SourceType,
    parse_regular_expression: bool,
) -> OwnedProgram {
    OwnedProgram::new(
        ParseOwner {
            allocator: Allocator::default(),
            source,
            source_type,
        },
        move |owner| {
            Parser::new(&owner.allocator, &owner.source, owner.source_type)
                .with_options(ParseOptions {
                    parse_regular_expression,
                    ..ParseOptions::default()
                })
                .parse()
        },
    )
}

impl OwnedProgram {
    fn has_diagnostics(&self) -> bool {
        !self.borrow_dependent().diagnostics.is_empty()
    }

    fn with_program_mut<R>(
        &mut self,
        use_program: impl for<'a> FnOnce(&'a str, &'a Allocator, Program<'a>) -> R,
    ) -> R {
        self.with_dependent_mut(|owner, parsed| {
            let program = parsed.program.take_in(&&owner.allocator);
            use_program(&owner.source, &owner.allocator, program)
        })
    }
}

pub fn transform(
    source: String,
    filename: String,
    options: NativePreflightOptions,
) -> Result<NativePreflightResult> {
    transform_impl(source, filename, options, true, false, None)
}

pub(crate) fn transform_resident(
    source: String,
    filename: String,
    options: NativePreflightOptions,
    normalized_javascript: bool,
    resident_jsx: Option<bool>,
) -> Result<NativePreflightResult> {
    transform_impl(
        source,
        filename,
        options,
        false,
        normalized_javascript,
        resident_jsx,
    )
}

fn transform_impl(
    mut source: String,
    filename: String,
    mut options: NativePreflightOptions,
    standalone_identity_map: bool,
    normalized_javascript: bool,
    resident_jsx: Option<bool>,
) -> Result<NativePreflightResult> {
    validate_option_ownership(&options)?;
    let initial_jsx = resident_jsx.unwrap_or_else(|| {
        let filename = filename.to_ascii_lowercase();
        filename.ends_with(".jsx") || filename.ends_with(".tsx")
    });
    if !has_active_operation(&options) {
        return Ok(identity_result(
            source,
            standalone_identity_map,
            normalized_javascript,
            initial_jsx,
        ));
    }
    if options.react_compiler == Some(true) && !cfg!(feature = "react_compiler") {
        return Ok(unsupported("react-compiler-not-built", [] as [String; 0]));
    }
    let conditional_jsx = options.jsx.as_deref() == Some("automatic-if-present");
    if conditional_jsx {
        options.jsx = Some("automatic".into());
    }
    let helper_mode = options.helpers_mode.as_deref().unwrap_or("runtime");
    let mut runtime_policy = (helper_mode == "runtime")
        .then(|| RuntimeHelperPolicy::parse(options.helpers_version.as_deref()));
    let mut transform_options = compile_options(
        &options,
        runtime_policy
            .as_ref()
            .and_then(|policy| policy.as_ref().ok()),
    )?;
    let mut rewrite_layers = Vec::new();
    let mut decorator_helper_requests = CustomHelperRequests::default();
    let focused_object_rest = options.object_rest_spread == Some(true);
    let object_rest_loose = options.object_rest_spread_loose == Some(true);
    let focused_class_features = options.class_properties == Some(true)
        || options.private_methods == Some(true)
        || options.private_property_in_object == Some(true);
    let class_rewrite_selected = options.classes == Some(true) || focused_class_features;
    let classes_ast_selected = class_rewrite_selected;
    let regexp_rewrite_selected = options.regexp_unicode == Some(true)
        || options.regexp_unicode_property_escapes == Some(true)
        || options.regexp_dot_all == Some(true)
        || options.regexp_named_capture_groups == Some(true)
        || options.regexp_unicode_sets == Some(true);
    let regexp_ast_selected = options.regexp_unicode_sets != Some(true)
        && (options.regexp_unicode_property_escapes == Some(true)
            || options.regexp_named_capture_groups == Some(true));
    // Whether anything downstream of the language reads it.
    let selects_source_rewrite = options.block_scoping == Some(true)
        || options.classes == Some(true)
        || focused_class_features
        || options.parameters == Some(true)
        || options.for_of == Some(true)
        || options.destructuring == Some(true)
        || focused_object_rest
        || regexp_rewrite_selected;
    // Language prepass.
    //
    // TypeScript describes the dialect a file is written in, not the ES feature
    // level it targets — the same category as Flow, which the JavaScript entry
    // point already erases before any of this runs. Oxc instead fuses it into
    // one traversal with the ES lowerings, and that traversal runs after the
    // rewrites below. Two things follow, and both have cost real bugs: the
    // rewrites have to understand a dialect they do not implement — parameter
    // properties, ambient classes, overload signatures, `declare` fields, a
    // parameter list that only exists as a type — and Oxc's own lowerings land
    // downstream of passes that needed to see them, its `enum` becoming a `let`
    // that block scoping has already walked past.
    //
    // Erasing it first costs one parse and one codegen and saves about as much
    // again on the smaller source the rewrites then read. It is here for the
    // ordering, not for the speed.
    //
    // JSX and React Refresh stay behind. Refresh registers a `const Foo = f()`
    // only when `Foo` is used as a JSX element name, so it has to run while the
    // JSX is still JSX, and it inserts its `_s()` call at the top of a body that
    // the parameter rewrite also writes to — running it early would reverse the
    // two against what Babel emits. The React Compiler reads JSX for the same
    // reason. None of them misread TypeScript, so none of them need to move.
    let mut active_source_type = source_type(&filename, &source)?;
    let mut output_normalized_javascript = normalized_javascript;
    if normalized_javascript {
        active_source_type = active_source_type
            .with_javascript(true)
            .with_standard(!initial_jsx)
            .with_jsx(initial_jsx);
    }
    if options.typescript.as_deref() == Some("strip") {
        active_source_type = active_source_type.with_typescript(true);
    }
    if options.jsx.is_some() {
        active_source_type = active_source_type.with_jsx(true);
    }
    let possible_decorators =
        options.legacy_decorators == Some(true) && source.contains('@') && source.contains("class");
    let language_prepass = (active_source_type.is_typescript()
        // Nothing downstream would read the language otherwise: the rewrites do,
        // and so does block scoping, because Oxc's `enum` lowering emits a `let`.
        // `automatic-if-present` is the one conditional phase, and the pipeline
        // requires it to stand alone, so it selects nothing here either.
        && selects_source_rewrite)
        || possible_decorators;
    // Attributed to the phases they belong to, so a prepass does not look free.
    if language_prepass {
        let language_allocator = Allocator::default();
        let parsed = Parser::new(&language_allocator, &source, active_source_type).parse();
        // A file that does not parse is reported by the parse below, with its
        // original spans rather than the prepass's.
        if parsed.diagnostics.is_empty() {
            let mut program = parsed.program;
            let has_decorators = if possible_decorators {
                let mut decorator_detector = DecoratorDetector(false);
                decorator_detector.visit_program(&program);
                decorator_detector.0
            } else {
                false
            };
            if active_source_type.is_typescript() || has_decorators {
                let built = {
                    SemanticBuilder::new_compiler()
                        .with_excess_capacity(2.0)
                        .with_enum_eval(true)
                        .build(&program)
                };
                if built.diagnostics.is_empty() {
                    let mut language_options = TransformOptions {
                        cwd: transform_options.cwd.clone(),
                        assumptions: CompilerAssumptions {
                            // Oxc's TypeScript pass owns class fields when this is
                            // set and the class-properties plugin is not, lowering
                            // `static x = 1` to `static { this.x = 1 }`. A class
                            // field is an ES feature, so it stays for whoever the
                            // caller selected to lower it — here, the `classes`
                            // rewrite, which does not implement static blocks unless
                            // the caller asked for them.
                            set_public_class_fields: false,
                            ..transform_options.assumptions
                        },
                        jsx: JsxOptions::disable(),
                        // No helper loader, because `oxc_transformer::typescript`
                        // requests no helper. That is what lets this run under inline
                        // helper materialization as well: that mode recognises
                        // `babelHelpers` references by their empty span, and printing
                        // one here would give it a span it could no longer match.
                        ..TransformOptions::default()
                    };
                    // Preserve the factory bindings needed by the later JSX pass while
                    // leaving JSX syntax intact for source rewrites and React tooling.
                    // Transformer still applies source directives over these defaults.
                    if let Some(pragma) = &transform_options.jsx.pragma {
                        language_options.typescript.jsx_pragma = pragma.clone().into();
                    }
                    if let Some(pragma) = &transform_options.jsx.pragma_frag {
                        language_options.typescript.jsx_pragma_frag = pragma.clone().into();
                    }
                    if has_decorators {
                        // NOTE: Decorators use the legacy evaluation model. Lower them
                        // before type and class rewrites so those passes never discard
                        // decorator expressions attached to syntax they consume.
                        language_options.decorator.legacy = true;
                        language_options.helper_loader.mode = HelperLoaderMode::External;
                    }
                    let transformed = Transformer::new(
                        &language_allocator,
                        Path::new(&filename),
                        &language_options,
                    )
                    .build_with_scoping(built.semantic.into_scoping(), &mut program);
                    if transformed.diagnostics.is_empty() {
                        if has_decorators {
                            #[expect(deprecated)]
                            let decorate = transformed
                                .helpers_used
                                .contains_key(&oxc_transformer::Helper::Decorate);
                            #[expect(deprecated)]
                            let decorate_param = transformed
                                .helpers_used
                                .contains_key(&oxc_transformer::Helper::DecorateParam);
                            let mut reserved = transformed
                                .scoping
                                .symbol_names()
                                .chain(
                                    transformed
                                        .scoping
                                        .root_unresolved_references()
                                        .keys()
                                        .map(|name| name.as_str()),
                                )
                                .map(str::to_owned)
                                .collect::<std::collections::HashSet<_>>();
                            let decorate_name = reserve_prepass_name("_decorate", &mut reserved);
                            let decorate_param_name =
                                reserve_prepass_name("_decorateParam", &mut reserved);
                            DecoratorHelperReferenceRewriter {
                                allocator: &language_allocator,
                                decorate_name: &decorate_name,
                                decorate_param_name: &decorate_param_name,
                            }
                            .visit_program(&mut program);
                            decorator_helper_requests = decorator_helpers(
                                &decorate_name,
                                &decorate_param_name,
                                decorate,
                                decorate_param,
                            );
                        }
                        // The intermediate is never the output, so it is printed
                        // unminified whatever the caller asked for: the final codegen
                        // does the minifying, and readable input keeps the rewrites'
                        // own textual guards honest.
                        let (printed, layer) = render_program(
                            &program,
                            &filename,
                            false,
                            options.comments.unwrap_or(true),
                            None,
                        )?;
                        source = printed;
                        rewrite_layers.push(layer);
                        #[expect(deprecated)]
                        {
                            debug_assert!(
                                has_decorators || transformed.helpers_used.is_empty(),
                                "only the decorator prepass may request language helpers"
                            );
                        }
                        // The strip is selected by the program's source type rather
                        // than by an option, so the intermediate is reclassified for
                        // what it now is — the way the Flow adapter reclassifies its
                        // own output. Left as TypeScript, the strip would run a
                        // second time and, with no JSX pragma left to hold it,
                        // elide the `React` import it had just decided to keep.
                        // `with_typescript(false)` is a no-op — Oxc's `with_*`
                        // setters only ever set — so the language has to be moved to
                        // JavaScript outright. The JSX variant is separate and stays.
                        active_source_type = active_source_type.with_javascript(true);
                        output_normalized_javascript = true;
                    }
                }
            }
        }
    }
    let mut final_program = {
        parse_owned(
            std::mem::take(&mut source),
            active_source_type,
            regexp_ast_selected,
        )
    };
    if final_program.has_diagnostics() {
        let parsed = final_program.borrow_dependent();
        if crate::syntax::validation::escaped_regexp_name_boundary(
            &parsed.program,
            &parsed.diagnostics,
        ) {
            crate::syntax::validation::validate_program(&parsed.program, "native-phase")?;
            return Ok(unsupported("parse-error", &parsed.diagnostics));
        }
        return Err(crate::parse_failure::error(
            &final_program.borrow_owner().source,
            &final_program.borrow_dependent().diagnostics,
            "native-phase",
        ));
    }
    // The parser recognizes HTML-style script comments as well as // and /*.
    // Reuse its comment list instead of scanning text (which also matches strings).
    let strip_comments = options.comments == Some(false)
        && !final_program.borrow_dependent().program.comments.is_empty();
    if !requires_generic_pipeline(&options) {
        let checked_scoping = crate::syntax::validation::validate_program(
            &final_program.borrow_dependent().program,
            "native-phase",
        )?;
        let should_render = options.constant_folding == Some(true)
            || options.dead_code_elimination == Some(true)
            || options.compact == Some(true)
            || strip_comments;
        if !should_render {
            return Ok(identity_result(
                final_program.into_owner().source,
                standalone_identity_map,
                output_normalized_javascript,
                active_source_type.is_jsx(),
            ));
        }
        return final_program.with_program_mut(|_, allocator, mut program| {
            optimize::run(
                allocator,
                &mut program,
                options.constant_folding == Some(true),
                options.dead_code_elimination == Some(true),
                (options.constant_folding != Some(true)).then_some(checked_scoping),
            );
            let (code, layer) = render_program(
                &program,
                &filename,
                options.compact.unwrap_or(false),
                options.comments.unwrap_or(true),
                None,
            )?;
            Ok(NativePreflightResult {
                status: "complete".into(),
                changed: true,
                normalized_javascript: output_normalized_javascript,
                jsx: active_source_type.is_jsx(),
                reason: None,
                code: Some(code),
                map: Some(layer.pack().into()),
                diagnostics: Vec::new(),
                helpers_used: Vec::new(),
            })
        });
    }
    final_program.with_program_mut(|source, allocator, mut program| {
        let (had_object_spread_syntax, object_spread_helper_requests) =
            if options.object_rest_spread == Some(true) && object_rest_loose {
                object_spread::run(
                    allocator,
                    &mut program,
                    object_spread::Options {
                        use_built_ins: options.object_rest_spread_use_built_ins == Some(true),
                        inline_helpers: options.helpers_mode.as_deref() == Some("inline"),
                    },
                )
            } else {
                (false, super::helpers::CustomHelperRequests::default())
            };
        let (had_regexp_syntax, mut structural_custom_helper_requests) = if regexp_rewrite_selected
        {
            match super::regexp::run(
                allocator,
                &mut program,
                source,
                super::regexp::Options {
                    unicode: options.regexp_unicode == Some(true),
                    // Babel's transform-unicode-regex expands Unicode property
                    // escapes as a prerequisite before removing the `u` flag.
                    unicode_properties: options.regexp_unicode == Some(true)
                        || options.regexp_unicode_property_escapes == Some(true),
                    dot_all: options.regexp_dot_all == Some(true),
                    named_groups: options.regexp_named_capture_groups == Some(true),
                    unicode_sets: options.regexp_unicode_sets == Some(true),
                    inline_helpers: options.helpers_mode.as_deref() == Some("inline"),
                },
            ) {
                Ok(result) => result,
                Err(failure) => {
                    return Ok(match failure.disposition {
                        super::regexp::FailureDisposition::Unsupported => {
                            unsupported(failure.reason, [] as [String; 0])
                        }
                        super::regexp::FailureDisposition::Fatal => {
                            fatal(failure.reason, [] as [String; 0])
                        }
                    });
                }
            }
        } else {
            (false, super::helpers::CustomHelperRequests::default())
        };
        structural_custom_helper_requests.prepend(object_spread_helper_requests);
        structural_custom_helper_requests.prepend(decorator_helper_requests);
        if conditional_jsx {
            let mut detector = JsxDetector(false);
            detector.visit_program(&program);
            // A conditional JSX-only phase can return the original bytes
            // without printing. A fused source rewrite still has work even
            // when this particular file contains no JSX.
            if !detector.0 && !selects_source_rewrite {
                crate::syntax::validation::validate_program(&program, "native-phase")?;
                return Ok(identity_result(
                    source.to_owned(),
                    standalone_identity_map,
                    output_normalized_javascript,
                    false,
                ));
            }
        }
        if options.classes != Some(true)
            && options.class_properties == Some(true)
            && options.class_properties_loose == Some(true)
        {
            // NOTE: Loose public fields assume the superclass binding is constant.
            // Rewrite static initializer `super` access before the downstream field
            // transform so inherited accessors observe the same receiver semantics.
            super::classes::rewrite_loose_static_field_super(allocator, &mut program);
        }
        let check_regexp = options.regexp_unicode == Some(true)
            || options.regexp_unicode_property_escapes == Some(true)
            || options.regexp_dot_all == Some(true)
            || options.regexp_named_capture_groups == Some(true)
            || options.regexp_unicode_sets == Some(true);
        let mut detector = PostconditionDetector {
            // NOTE: The focused class pass now owns class-property/private
            // composition, so Oxc's historical fusion guard is unreachable.
            check_regexp,
            // Flat declarators now run after semantic planning. Remaining
            // shapes have already taken the compatibility path.
            check_destructuring: false,
            // Converted ordinary Parameters run after semantic planning below.
            // Remaining arrow/wrapper cases have already taken their temporary
            // compatibility path before this parse.
            check_parameters: false,
            // Converted ForOf runs after this prerequisite check, once semantic
            // has supplied its collision plan. Its postcondition is checked
            // immediately after that mutation below.
            check_for_of: false,
            ..PostconditionDetector::default()
        };
        if detector.is_active() {
            detector.visit_program(&program);
        }
        if let Some(reason) = detector.failure_reason(&options) {
            return Ok(fatal(reason, [] as [String; 0]));
        }
        let semantic = {
            SemanticBuilder::new_compiler()
                .with_build_nodes(
                    options.block_scoping == Some(true)
                        || options.parameters == Some(true)
                        || options.destructuring == Some(true)
                        || focused_object_rest
                        || classes_ast_selected,
                )
                .with_excess_capacity(2.0)
                .with_enum_eval(true)
                .build(&program)
        };
        if !semantic.diagnostics.is_empty() {
            return Err(crate::parse_failure::error(source, &semantic.diagnostics, "native-phase"));
        }
        let mut semantic = semantic;
        if options.block_scoping == Some(true) {
            loop {
                let plan =
                    match block_scoping::prepare_captured_loop_ast(source, &semantic.semantic) {
                        Ok(plan) => plan,
                        Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
                    };
                if plan.is_empty() {
                    break;
                }
                drop(semantic);
                match block_scoping::run_captured_loop_ast(allocator, &mut program, plan) {
                    Ok(true) => {}
                    Ok(false) => {
                        return Ok(fatal("captured-loop-ast-target-missing", [] as [String; 0]));
                    }
                    Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
                }
                semantic = {
                    SemanticBuilder::new()
                        .with_build_nodes(true)
                        .with_excess_capacity(2.0)
                        .with_enum_eval(true)
                        .build(&program)
                };
                if !semantic.diagnostics.is_empty() {
                    return Ok(fatal(
                        "captured-loop-post-rewrite-semantic-error",
                        semantic.diagnostics,
                    ));
                }
            }
        }
        let classes_ast_plan = if classes_ast_selected {
            match super::classes::prepare_ast(
                &semantic.semantic,
                options.classes == Some(true),
                if options.classes == Some(true) {
                    // NOTE: Class lowering uses spec-style public fields by default.
                    // The direct pass must own fields even when the prerequisite
                    // transform was not separately selected, because no class can
                    // remain after this phase.
                    Some(options.class_properties_loose.unwrap_or(false))
                } else {
                    options
                        .class_properties
                        .filter(|enabled| *enabled)
                        .map_or(Some(true), |_| {
                            Some(options.class_properties_loose.unwrap_or(false))
                        })
                },
                class_rewrite_selected || options.class_static_block == Some(true),
                if options.classes == Some(true) {
                    // NOTE: Use the loose private representation and do not retain a second
                    // class-lowering implementation solely for spec private state.
                    Some(true)
                } else {
                    options
                        .private_methods
                        .filter(|enabled| *enabled)
                        .map(|_| true)
                        .or(focused_class_features.then_some(true))
                },
                if options.classes == Some(true) {
                    Some(true)
                } else {
                    options
                        .private_property_in_object
                        .filter(|enabled| *enabled)
                        .map(|_| true)
                        .or(focused_class_features.then_some(true))
                },
                options.helpers_mode.as_deref() == Some("inline"),
            ) {
                Ok(plan) => Some(plan),
                Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
            }
        } else {
            None
        };
        let (mut semantic, had_classes_ast_syntax, classes_custom_helper_requests) =
            if classes_ast_plan
                .as_ref()
                .is_some_and(|plan| !plan.is_empty())
            {
                drop(semantic);
                let (changed, requests) = match super::classes::run_ast(
                    allocator,
                    &mut program,
                    classes_ast_plan.unwrap(),
                ) {
                    Ok(result) => result,
                    Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
                };
                if !changed {
                    return Ok(fatal("classes-ast-target-missing", [] as [String; 0]));
                }
                let rebuilt = {
                    SemanticBuilder::new()
                        .with_build_nodes(true)
                        .with_excess_capacity(2.0)
                        .with_enum_eval(true)
                        .build(&program)
                };
                if !rebuilt.diagnostics.is_empty() {
                    return Ok(fatal(
                        "classes-post-rewrite-semantic-error",
                        rebuilt.diagnostics,
                    ));
                }
                (rebuilt, true, requests)
            } else {
                (
                    semantic,
                    false,
                    super::helpers::CustomHelperRequests::default(),
                )
            };
        // Classes preceded Parameters/ForOf/Destructuring in the text pipeline,
        // so its parsed helper bindings participated in their UID allocation.
        // Regexp ran after all three; keep its structural helper names out until
        // block scoping and the fused transformer below.
        reserve_custom_helper_scope_names(
            semantic.semantic.scoping_mut(),
            classes_custom_helper_requests.scope_names(),
        );
        if classes_ast_selected && options.classes == Some(true) {
            let mut classes_postcondition = PostconditionDetector {
                check_classes: true,
                ..PostconditionDetector::default()
            };
            classes_postcondition.visit_program(&program);
            if classes_postcondition.classes {
                return Ok(fatal("classes-postcondition-failed", [] as [String; 0]));
            }
        }
        let had_block_scoping_syntax =
            options.block_scoping == Some(true) && block_scoping::has_remaining_syntax(&program);
        let early_block_scoping_plan = if had_block_scoping_syntax
            && !had_classes_ast_syntax
            && options.parameters != Some(true)
            && options.for_of != Some(true)
            && options.destructuring != Some(true)
            && !focused_object_rest
        {
            match block_scoping::prepare_with_reserved(
                &semantic.semantic,
                structural_custom_helper_requests
                    .scope_names()
                    .chain(classes_custom_helper_requests.scope_names()),
            ) {
                Ok(plan) => Some(plan),
                Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
            }
        } else {
            None
        };
        let parameters_ast_plan = if options.parameters == Some(true) {
            match super::parameters::prepare_ast(source, &semantic.semantic) {
                Ok(plan) => Some(plan),
                Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
            }
        } else if focused_object_rest {
            match super::parameters::prepare_object_rest(
                source,
                &semantic.semantic,
                object_rest_loose,
            ) {
                Ok(plan) => Some(plan),
                Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
            }
        } else {
            None
        };
        let early_destructuring_ast_plan = if (options.destructuring == Some(true)
            || focused_object_rest)
            && parameters_ast_plan
                .as_ref()
                .is_none_or(super::parameters::AstPlan::is_empty)
            && options.for_of != Some(true)
        {
            match super::destructuring::prepare_ast(
                &semantic.semantic,
                options.helpers_mode.as_deref() == Some("inline"),
                options.destructuring != Some(true),
                object_rest_loose,
            ) {
                Ok(plan) => Some(plan),
                Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
            }
        } else {
            None
        };
        let mut scoping = semantic.semantic.into_scoping();
        let had_parameters_ast_syntax =
            if let Some(plan) = parameters_ast_plan.filter(|plan| !plan.is_empty()) {
                match super::parameters::run_ast(allocator, &mut program, plan) {
                    Ok(changed) => changed,
                    Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
                }
            } else {
                false
            };
        let for_of_plan = if options.for_of == Some(true) {
            // Parameters can introduce `_len`, `_key`, and capture aliases.
            // Rebuild before planning ForOf so its reservation set includes
            // every binding now present in the program.
            let mut semantic = {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .with_enum_eval(true)
                    .build(&program)
            };
            if !semantic.diagnostics.is_empty() {
                return Ok(fatal("pre-for-of-semantic-error", semantic.diagnostics));
            }
            reserve_custom_helper_scope_names(
                semantic.semantic.scoping_mut(),
                classes_custom_helper_requests
                    .scope_names()
                    .chain(structural_custom_helper_requests.scope_names()),
            );
            Some(super::for_of::prepare(&semantic.semantic))
        } else {
            None
        };
        let inline_for_of_helper = helper_mode != "runtime"
            || runtime_policy
                .as_ref()
                .and_then(|policy| policy.as_ref().ok())
                .is_some_and(|policy| {
                    policy.availability("createForOfIteratorHelper") == RuntimeAvailability::Inline
                });
        let had_for_of_syntax = if let Some(plan) = for_of_plan.filter(|plan| !plan.is_empty()) {
            if inline_for_of_helper && plan.shadows_helper_globals() {
                return Ok(unsupported(
                    "for-of-inline-helper-shadowed-global",
                    [] as [String; 0],
                ));
            }
            match super::for_of::run(allocator, &mut program, plan, inline_for_of_helper) {
                Ok((changed, requests)) => {
                    structural_custom_helper_requests.prepend(requests);
                    changed
                }
                Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
            }
        } else {
            false
        };
        if had_for_of_syntax {
            let mut for_of_postcondition = PostconditionDetector {
                check_for_of: true,
                ..PostconditionDetector::default()
            };
            for_of_postcondition.visit_program(&program);
            if for_of_postcondition.for_of {
                return Ok(fatal("for-of-postcondition-failed", [] as [String; 0]));
            }
        }
        let mut destructuring_ast_plan = if early_destructuring_ast_plan.is_some() {
            early_destructuring_ast_plan
        } else if options.destructuring == Some(true) || focused_object_rest {
            let mut semantic = {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .with_enum_eval(true)
                    .build(&program)
            };
            if !semantic.diagnostics.is_empty() {
                return Ok(fatal(
                    "pre-destructuring-semantic-error",
                    semantic.diagnostics,
                ));
            }
            reserve_custom_helper_scope_names(
                semantic.semantic.scoping_mut(),
                classes_custom_helper_requests.scope_names(),
            );
            let plan = match super::destructuring::prepare_ast(
                &semantic.semantic,
                options.helpers_mode.as_deref() == Some("inline"),
                options.destructuring != Some(true),
                object_rest_loose,
            ) {
                Ok(plan) => plan,
                Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
            };
            Some(plan)
        } else {
            None
        };
        let mut had_destructuring_ast_syntax = false;
        let mut destructuring_custom_helper_requests =
            super::helpers::CustomHelperRequests::default();
        if let Some(plan) = destructuring_ast_plan
            .take()
            .filter(|plan| !plan.is_empty())
        {
            let (changed, requests) = {
                match super::destructuring::run_ast(allocator, &mut program, plan) {
                    Ok(result) => result,
                    Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
                }
            };
            if changed {
                had_destructuring_ast_syntax = true;
                destructuring_custom_helper_requests.prepend(requests);
            }
        }
        if options.parameters == Some(true) {
            let mut parameters_postcondition = PostconditionDetector {
                check_parameters: true,
                ..PostconditionDetector::default()
            };
            parameters_postcondition.visit_program(&program);
            if parameters_postcondition.parameters {
                return Ok(fatal("parameters-postcondition-failed", [] as [String; 0]));
            }
        }
        if had_block_scoping_syntax {
            // Plan block scoping from the AST after Parameters, ForOf, and
            // Destructuring have introduced bindings. The earlier semantic
            // snapshot cannot safely determine collisions or loop ownership.
            let plan = if let Some(plan) = early_block_scoping_plan {
                plan
            } else {
                let semantic = {
                    SemanticBuilder::new()
                        .with_build_nodes(true)
                        .with_excess_capacity(2.0)
                        .with_enum_eval(true)
                        .build(&program)
                };
                if !semantic.diagnostics.is_empty() {
                    return Ok(fatal(
                        "pre-block-scoping-semantic-error",
                        semantic.diagnostics,
                    ));
                }
                match block_scoping::prepare_with_reserved(
                    &semantic.semantic,
                    structural_custom_helper_requests
                        .scope_names()
                        .chain(destructuring_custom_helper_requests.scope_names())
                        .chain(classes_custom_helper_requests.scope_names()),
                ) {
                    Ok(plan) => plan,
                    Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
                }
            };
            let requests = block_scoping::run(
                allocator,
                &mut program,
                plan,
                options.helpers_mode.as_deref() != Some("runtime"),
            );
            structural_custom_helper_requests.prepend(requests);
        }
        if had_classes_ast_syntax
            || had_for_of_syntax
            || had_parameters_ast_syntax
            || had_destructuring_ast_syntax
        {
            // ForOf introduces a try/catch scope and six bindings. Oxc 0.141
            // has no incremental semantic update, so refresh scoping after all
            // pre-transform mutations and before handing the program to Oxc.
            let rebuilt = {
                SemanticBuilder::new()
                    .with_excess_capacity(2.0)
                    .with_enum_eval(true)
                    .build(&program)
            };
            if !rebuilt.diagnostics.is_empty() {
                return Ok(fatal("post-rewrite-semantic-error", rebuilt.diagnostics));
            }
            scoping = rebuilt.semantic.into_scoping();
        }
        reserve_custom_helper_scope_names(
            &mut scoping,
            structural_custom_helper_requests
                .scope_names()
                .chain(destructuring_custom_helper_requests.scope_names())
                .chain(classes_custom_helper_requests.scope_names()),
        );
        // Oxc visits React Refresh before async-to-generator on the same expression.
        // Refresh replaces a hook-using async function expression with
        // `_s(<function>, "…")`, so by the time the async visitor exits that
        // expression there is no function left for it to wrap — while the `await`s
        // inside it, visited earlier as descendants, have already become `yield`s.
        // The result is a bare `yield` in a body that is still `async`, which the
        // next parse rejects. Babel avoids this by re-queuing replaced nodes.
        //
        // Refresh has to stay in this pass to see JSX, so separating the two is this
        // pass's problem and not the language prepass's. Deferring async lowering to
        // a second run restores the ordering; the first hands back its updated
        // scoping, so it costs one traversal and no semantic rebuild, and it only
        // happens for the app source that enables Refresh at all.
        let deferred_async = (transform_options.jsx.refresh.is_some()
            && (transform_options.env.es2017.async_to_generator
                || transform_options.env.es2018.async_generator_functions))
            .then(|| {
                let mut deferred = TransformOptions {
                    cwd: transform_options.cwd.clone(),
                    assumptions: transform_options.assumptions,
                    jsx: JsxOptions::disable(),
                    ..TransformOptions::default()
                };
                deferred.helper_loader = transform_options.helper_loader.clone();
                deferred.env.es2017.async_to_generator =
                    std::mem::take(&mut transform_options.env.es2017.async_to_generator);
                deferred.env.es2018.async_generator_functions =
                    std::mem::take(&mut transform_options.env.es2018.async_generator_functions);
                deferred
            });
        let mut export_namespace_attributes = if options.export_namespace_from == Some(true) {
            capture_export_namespace_attributes(allocator, &program)
        } else {
            Vec::new()
        };
        // Oxc preserves the complete JSX element span on its generated factory
        // call. Fragments have no props to spread; nested elements are collected.
        // Comment directives can select the classic runtime after options are
        // parsed, so record origins before the transform and apply them only when
        // the returned runtime is classic.
        let origins = object_spread::JsxOrigins::collect(&program);
        let mut transformed = Transformer::new(
            allocator,
            Path::new(options.source_filename.as_deref().unwrap_or(&filename)),
            &transform_options,
        )
        .build_with_scoping(scoping, &mut program);
        restore_export_namespace_attributes(&mut program, &mut export_namespace_attributes);
        if let Some(deferred) = deferred_async
            && transformed.diagnostics.is_empty()
        {
            let async_pass = Transformer::new(
                allocator,
                Path::new(options.source_filename.as_deref().unwrap_or(&filename)),
                &deferred,
            )
            .build_with_scoping(transformed.scoping, &mut program);
            transformed
                .generated_async_iterators
                .extend(async_pass.generated_async_iterators);
            transformed.diagnostics = async_pass.diagnostics;
            transformed.scoping = async_pass.scoping;
            #[expect(deprecated)]
            transformed.helpers_used.extend(async_pass.helpers_used);
        }
        if !transformed.generated_async_iterators.is_empty() && transformed.diagnostics.is_empty() {
            let requests = validate_generated_async_iterator_results(
                allocator,
                &mut program,
                &transformed.scoping,
                &transformed.generated_async_iterators,
            );
            if !requests.is_empty() {
                structural_custom_helper_requests.prepend(requests);
            }
        }
        if !transformed.diagnostics.is_empty() {
            // This pinned Oxc diagnostic is an explicit compatibility boundary,
            // not malformed TypeScript. Do not hide any accompanying fatal error.
            if transformed.diagnostics.iter().all(|diagnostic| diagnostic.message == "Namespaces exporting non-const are not supported by Oxc. Change to const or see: https://oxc.rs/docs/guide/usage/transformer/typescript.html#partial-namespace-support") {
                return Ok(unsupported("mutable-namespace-export", transformed.diagnostics));
            }
            return Ok(fatal("transform-error", transformed.diagnostics));
        }
        if transform_options.jsx.jsx_plugin && transformed.jsx_runtime == JsxRuntime::Classic {
            let (changed, jsx_helper_requests) = object_spread::run_jsx_props(
                allocator,
                &mut program,
                options.helpers_mode.as_deref() != Some("runtime"),
                &origins,
            );
            if changed {
                structural_custom_helper_requests.prepend(jsx_helper_requests);
            }
        }
        #[expect(deprecated)]
        let rewrites_object_rest_helper = object_rest_loose
            && transformed
                .helpers_used
                .iter()
                .any(|(helper, _)| *helper == oxc_transformer::Helper::ObjectWithoutProperties);
        if rewrites_object_rest_helper {
            ObjectRestLooseCompletionRewriter { allocator }.visit_program(&mut program);
        }
        if options.private_methods == Some(true) || options.private_property_in_object == Some(true)
        {
            let mut detector = ClassFeaturesUnsupportedDetector {
                check_private_methods: options.private_methods == Some(true),
                check_private_in: options.private_property_in_object == Some(true),
                ..ClassFeaturesUnsupportedDetector::default()
            };
            detector.visit_program(&program);
            if detector.has_unsupported_syntax() {
                return Ok(fatal(
                    "class-features-postcondition-failed",
                    [] as [String; 0],
                ));
            }
        }
        if options.block_scoping == Some(true) && block_scoping::has_remaining_syntax(&program) {
            // The pass above runs before the Oxc transformer, and the transformer
            // lowers TypeScript enums and namespaces into `let` bindings of its own
            // — `enum E {}` becomes `let E = function(E){…}({})`. Babel does not hit
            // this because its TypeScript plugin emits `var`. Rebuilding semantic
            // over the transformed program and running the pass a second time
            // lowers what the transformer introduced, with the same collision
            // planning the first round used. Only files that would otherwise have
            // been rejected here pay for the extra semantic build.
            let semantic = {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .build(&program)
            };
            if !semantic.diagnostics.is_empty() {
                return Ok(fatal(
                    "block-scoping-postcondition-semantic-error",
                    semantic.diagnostics,
                ));
            }
            match block_scoping::prepare(&semantic.semantic) {
                Ok(plan) => {
                    let requests = block_scoping::run(
                        allocator,
                        &mut program,
                        plan,
                        options.helpers_mode.as_deref() != Some("runtime"),
                    );
                    structural_custom_helper_requests.prepend(requests);
                }
                Err(reason) => return Ok(fatal(reason, [] as [String; 0])),
            }
            if block_scoping::has_remaining_syntax(&program) {
                return Ok(fatal(
                    "block-scoping-postcondition-failed",
                    [] as [String; 0],
                ));
            }
        }
        if options.constant_folding == Some(true) || options.dead_code_elimination == Some(true) {
            optimize::run(
                allocator,
                &mut program,
                options.constant_folding == Some(true),
                options.dead_code_elimination == Some(true),
                None,
            );
        }
        #[expect(deprecated)]
        let helper_requests: Vec<_> = transformed.helpers_used.into_iter().collect();
        let helper_scope_names = transformed
            .scoping
            .symbol_names()
            .map(str::to_owned)
            .collect::<Vec<_>>();
        let oxc_codegen_only_transform_selected = options.explicit_resource_management
            == Some(true)
            || options.logical_assignment_operators == Some(true)
            || options.optional_chaining == Some(true)
            || options.nullish_coalescing_operator == Some(true)
            || options.export_namespace_from == Some(true)
            || options.optional_catch_binding == Some(true)
            || options.exponentiation_operator == Some(true)
            || options.regexp_sticky == Some(true)
            || (options.class_static_block == Some(true) && options.classes != Some(true))
            || options.object_rest_spread == Some(true)
            || (options.class_properties == Some(true) && options.classes != Some(true))
            || (options.private_methods == Some(true) && options.classes != Some(true))
            || (options.private_property_in_object == Some(true) && options.classes != Some(true));
        if rewrite_layers.is_empty()
            && helper_requests.is_empty()
            && !had_block_scoping_syntax
            && !had_object_spread_syntax
            && !had_regexp_syntax
            && !had_classes_ast_syntax
            && !had_for_of_syntax
            && !had_parameters_ast_syntax
            && !had_destructuring_ast_syntax
            && !oxc_codegen_only_transform_selected
            && options.typescript.is_none()
            && options.jsx.is_none()
            && options.react_compiler != Some(true)
            && options.react_refresh != Some(true)
            && options.constant_folding != Some(true)
            && options.dead_code_elimination != Some(true)
            && options.compact != Some(true)
            && !strip_comments
        {
            return Ok(identity_result(
                source.to_owned(),
                standalone_identity_map,
                output_normalized_javascript,
                active_source_type.is_jsx(),
            ));
        }
        let helper_module = options
            .helpers_module_name
            .as_deref()
            .unwrap_or("@babel/runtime");
        let runtime_policy = if helper_mode == "runtime" {
            if helper_module != "@babel/runtime" {
                return Ok(unsupported(
                    &format!("helper-runtime-module-unsupported:{helper_module}"),
                    [] as [String; 0],
                ));
            }
            match runtime_policy.take().expect("runtime policy was prepared") {
                Ok(policy) => Some(policy),
                Err(reason) => return Ok(unsupported(&reason, [] as [String; 0])),
            }
        } else {
            None
        };
        let output_is_module = program.source_type.is_module();
        let mut custom_helper_requests = Vec::new();
        let mut custom_helper_fragments = Vec::new();
        let compact = options.compact.unwrap_or(false);
        let mut helper_globals = structural_custom_helper_requests.extend_into(
            &mut custom_helper_requests,
            &mut custom_helper_fragments,
            compact,
            runtime_policy.as_ref(),
        );
        helper_globals.extend(destructuring_custom_helper_requests.extend_into(
            &mut custom_helper_requests,
            &mut custom_helper_fragments,
            compact,
            runtime_policy.as_ref(),
        ));
        helper_globals.extend(classes_custom_helper_requests.extend_into(
            &mut custom_helper_requests,
            &mut custom_helper_fragments,
            compact,
            runtime_policy.as_ref(),
        ));
        let unavailable_helpers = helper_requests
            .iter()
            .filter_map(|(helper, _)| {
                let spec = compatibility_for_request(*helper, object_rest_loose)
                    .expect("reachable Oxc helper has compatibility metadata");
                (helper_mode == "inline"
                    || runtime_policy
                        .as_ref()
                        .expect("runtime policy exists")
                        .availability_for(spec)
                        == RuntimeAvailability::Inline)
                    .then_some(*helper)
            })
            .collect::<Vec<_>>();
        let inline = if !unavailable_helpers.is_empty() {
            match inline_helpers(
                unavailable_helpers.iter().copied(),
                helper_mode == "runtime"
                    || (!object_rest_loose
                        && unavailable_helpers.iter().all(|helper| {
                            matches!(
                                helper,
                                oxc_transformer::Helper::ObjectWithoutProperties
                                    | oxc_transformer::Helper::ObjectDestructuringEmpty
                                    | oxc_transformer::Helper::Extends
                            )
                        })),
            ) {
                Ok(inline) => inline,
                Err(reason) => return Ok(unsupported(&reason, [] as [String; 0])),
            }
        } else {
            None
        };
        if let Some(inline) = &inline {
            helper_globals.extend(inline.globals.iter().copied());
        }
        let mut helpers_used: Vec<String> = helper_requests
            .iter()
            .map(|(helper, _)| {
                compatibility_for_request(*helper, object_rest_loose)
                    .expect("reachable Oxc helper has compatibility metadata")
                    .oxc_name
                    .to_string()
            })
            .collect();
        helpers_used.extend(custom_helper_requests.into_iter().map(str::to_string));
        helpers_used.sort_unstable();
        helpers_used.dedup();
        let oxc_runtime_loader = helper_mode == "runtime"
            && runtime_policy
                .as_ref()
                .is_some_and(RuntimeHelperPolicy::all_generated_available);
        let mut inline_prefix = None;
        if (!oxc_runtime_loader && !helper_requests.is_empty())
            || !custom_helper_fragments.is_empty()
        {
            let mut reservations = SourceNameReservations::new(source);
            reservations.include(helper_scope_names);
            let unavailable_names = unavailable_helpers
                .iter()
                .map(|helper| helper.name())
                .collect::<rustc_hash::FxHashSet<_>>();
            // Generated fragments are already formatted by our code generator.
            // Keep them opaque, as with Oxc's inline bundle. Runtime module
            // fragments still need parsing to convert requires into imports.
            let custom_inline_prefix = (!compact
                && (helper_mode == "inline" || !output_is_module)
                && helper_requests.is_empty()
                && program
                    .body
                    .first()
                    .is_none_or(|statement| !statement.span().is_empty()))
            .then(|| custom_helper_fragments.concat());
            let mut declarations = if custom_inline_prefix.is_some() {
                String::new()
            } else {
                custom_helper_fragments.concat()
            };
            let mut replacements = Vec::new();
            let fallback = (helper_mode == "runtime" && !unavailable_helpers.is_empty())
                .then(|| reservations.reserve("babelHelpersFallback"));
            for (helper, _) in helper_requests.iter().filter(|_| !oxc_runtime_loader) {
                let spec = compatibility_for_request(*helper, object_rest_loose)
                    .expect("reachable Oxc helper has compatibility metadata");
                if unavailable_names.contains(helper.name()) {
                    replacements.push((spec.oxc_name, None));
                } else if output_is_module {
                    let binding = reservations.reserve(&format!(
                        "_{}",
                        helper.name().strip_suffix('2').unwrap_or(helper.name())
                    ));
                    let _ = write!(
                        declarations,
                        "import {binding} from \"{helper_module}/helpers/{}\";",
                        spec.babel_path
                    );
                    replacements.push((spec.oxc_name, Some(binding)));
                } else {
                    let binding = reservations.reserve(&format!(
                        "_{}",
                        helper.name().strip_suffix('2').unwrap_or(helper.name())
                    ));
                    let _ = write!(
                        declarations,
                        "var {binding}=require(\"{helper_module}/helpers/{}\");",
                        spec.babel_path
                    );
                    replacements.push((spec.oxc_name, Some(binding)));
                }
            }
            if let (Some(inline), Some(fallback)) = (&inline, &fallback) {
                let _ = write!(declarations, "var {fallback}={};", inline.prefix);
            }
            let inline_binding =
                (helper_mode == "inline" && !helper_requests.is_empty() && !oxc_runtime_loader)
                    .then(|| {
                        let binding = reservations.reserve("babelHelpers");
                        inline_prefix = Some(format!(
                            "var {binding}={};\n",
                            inline.as_ref().expect("inline helpers exist").prefix
                        ));
                        binding
                    });
            if let Some(custom_prefix) = custom_inline_prefix.filter(|source| !source.is_empty()) {
                let prefix = inline_prefix.get_or_insert_with(String::new);
                prefix.push_str(&custom_prefix);
                if !prefix.ends_with('\n') {
                    prefix.push('\n');
                }
            }
            protect_helper_globals(
                allocator,
                &mut program,
                &helper_globals,
                &mut reservations,
                &transformed.scoping,
            );
            if !declarations.is_empty() {
                let bridge_source = allocator.alloc_str(&declarations);
                let mut parsed_bridge =
                    Parser::new(allocator, bridge_source, active_source_type).parse();
                if !parsed_bridge.diagnostics.is_empty() {
                    return Ok(fatal(
                        "helper-bridge-parse-error",
                        parsed_bridge.diagnostics,
                    ));
                }
                if output_is_module {
                    let mut imports = HelperImportRewriter {
                        allocator,
                        reservations: &mut reservations,
                        imports: Vec::new(),
                    };
                    imports.visit_program(&mut parsed_bridge.program);
                    let import_source = imports
                        .imports
                        .into_iter()
                        .map(|(path, binding)| format!("import {binding} from {path:?};"))
                        .collect::<String>();
                    if !import_source.is_empty() {
                        let imports = Parser::new(
                            allocator,
                            allocator.alloc_str(&import_source),
                            active_source_type,
                        )
                        .parse();
                        let trailing = parsed_bridge.program.body.split_off(0);
                        parsed_bridge.program.body.extend(imports.program.body);
                        parsed_bridge.program.body.extend(trailing);
                    }
                }
                SyntheticSpanZeroer.visit_program(&mut parsed_bridge.program);
                let insertion = program
                    .body
                    .iter()
                    .take_while(|statement| statement.span().is_empty())
                    .count();
                let trailing = program.body.split_off(insertion);
                program.body.extend(parsed_bridge.program.body);
                program.body.extend(trailing);
            }
            if let Some(binding) = inline_binding {
                InlineHelperRenamer {
                    binding: allocator.alloc_str(&binding),
                }
                .visit_program(&mut program);
            } else {
                MixedHelperReferenceRewriter {
                    allocator,
                    fallback: fallback.as_deref(),
                    replacements: &replacements,
                }
                .visit_program(&mut program);
            }
        }
        let (generated_code, codegen_layer) = render_program(
            &program,
            &filename,
            options.compact.unwrap_or(false),
            options.comments.unwrap_or(true),
            inline_prefix.as_deref(),
        )?;
        rewrite_layers.push(codegen_layer);
        let layer = if rewrite_layers.len() == 1 {
            rewrite_layers.pop().unwrap().pack()
        } else {
            compose_decoded_layers(&rewrite_layers).map_err(|error| {
                Error::new(
                    Status::GenericFailure,
                    match error {
                        crate::sourcemap::DecodedMapError::Invalid => {
                            "native rewrite map composition failed"
                        }
                        crate::sourcemap::DecodedMapError::ResidentLimit => {
                            "native rewrite map composition exceeds its mapping-storage limit"
                        }
                        crate::sourcemap::DecodedMapError::EncodedLimit => {
                            "native rewrite map composition exceeds its encoded-mappings limit"
                        }
                    },
                )
            })?
        };
        Ok(NativePreflightResult {
            status: "complete".into(),
            changed: true,
            normalized_javascript: output_normalized_javascript
                || active_source_type.is_typescript(),
            jsx: active_source_type.is_jsx() && options.jsx.is_none(),
            reason: None,
            code: Some(generated_code),
            map: Some(layer.into()),
            diagnostics: Vec::new(),
            helpers_used,
        })
    })
}

fn validate_option_ownership(options: &NativePreflightOptions) -> Result<()> {
    let invalid = |message: &str| Error::new(Status::InvalidArg, message.to_owned());
    for (secondary, owner, name) in [
        (
            options.class_properties_loose.is_some(),
            options.class_properties == Some(true),
            "classPropertiesLoose",
        ),
        (
            options.optional_chaining_loose.is_some(),
            options.optional_chaining == Some(true),
            "optionalChainingLoose",
        ),
        (
            options.nullish_coalescing_operator_loose.is_some(),
            options.nullish_coalescing_operator == Some(true),
            "nullishCoalescingOperatorLoose",
        ),
        (
            options.object_rest_spread_loose.is_some()
                || options.object_rest_spread_use_built_ins.is_some(),
            options.object_rest_spread == Some(true),
            "objectRestSpread options",
        ),
    ] {
        if secondary && !owner {
            return Err(invalid(&format!("{name} requires its owning transform")));
        }
    }
    let jsx_secondary = options.jsx_pure.is_some()
        || options.jsx_throw_if_namespace.is_some()
        || options.jsx_import_source.is_some()
        || options.jsx_pragma.is_some()
        || options.jsx_pragma_frag.is_some();
    if jsx_secondary && options.jsx.is_none() {
        return Err(invalid("JSX options require an active JSX mode"));
    }
    let refresh_secondary = options.react_refresh_reg.is_some()
        || options.react_refresh_sig.is_some()
        || options.react_refresh_emit_full_signatures.is_some();
    if refresh_secondary && options.react_refresh != Some(true) {
        return Err(invalid("React Refresh options require reactRefresh"));
    }
    Ok(())
}

fn has_active_operation(options: &NativePreflightOptions) -> bool {
    options.react_compiler == Some(true)
        || options.react_refresh == Some(true)
        || options.typescript.is_some()
        || options.jsx.is_some()
        || options.compact == Some(true)
        || options.comments == Some(false)
        || [
            options.constant_folding,
            options.dead_code_elimination,
            options.block_scoping,
            options.classes,
            options.legacy_decorators,
            options.destructuring,
            options.parameters,
            options.for_of,
            options.explicit_resource_management,
            options.class_static_block,
            options.class_properties,
            options.logical_assignment_operators,
            options.optional_chaining,
            options.nullish_coalescing_operator,
            options.export_namespace_from,
            options.optional_catch_binding,
            options.object_rest_spread,
            options.async_generator_functions,
            options.async_functions,
            options.exponentiation_operator,
            options.private_methods,
            options.private_property_in_object,
            options.regexp_sticky,
            options.regexp_unicode,
            options.regexp_unicode_property_escapes,
            options.regexp_dot_all,
            options.regexp_named_capture_groups,
            options.regexp_look_behind,
            options.regexp_match_indices,
            options.regexp_unicode_sets,
        ]
        .contains(&Some(true))
}

fn requires_generic_pipeline(options: &NativePreflightOptions) -> bool {
    options.react_compiler == Some(true)
        || options.react_refresh == Some(true)
        || options.typescript.is_some()
        || options.jsx.is_some()
        || [
            options.block_scoping,
            options.classes,
            options.legacy_decorators,
            options.destructuring,
            options.parameters,
            options.for_of,
            options.explicit_resource_management,
            options.class_static_block,
            options.class_properties,
            options.logical_assignment_operators,
            options.optional_chaining,
            options.nullish_coalescing_operator,
            options.export_namespace_from,
            options.optional_catch_binding,
            options.object_rest_spread,
            options.async_generator_functions,
            options.async_functions,
            options.exponentiation_operator,
            options.private_methods,
            options.private_property_in_object,
            options.regexp_sticky,
            options.regexp_unicode,
            options.regexp_unicode_property_escapes,
            options.regexp_dot_all,
            options.regexp_named_capture_groups,
            options.regexp_unicode_sets,
        ]
        .contains(&Some(true))
}

fn reserve_custom_helper_scope_names<'a>(
    scoping: &mut Scoping,
    names: impl IntoIterator<Item = &'a str>,
) {
    let helper_names = names
        .into_iter()
        .map(str::to_owned)
        .collect::<rustc_hash::FxHashSet<_>>();
    if helper_names.is_empty() {
        return;
    }
    let existing_names = scoping
        .symbol_names()
        .map(str::to_owned)
        .collect::<rustc_hash::FxHashSet<_>>();
    let missing_names = helper_names
        .difference(&existing_names)
        .map(String::as_str)
        .collect::<Vec<_>>();
    if missing_names.is_empty() {
        return;
    }
    // Helper fragments are inserted after codegen and therefore are absent from
    // Oxc's collision planning. Reserve their program-scope names in an orphan
    // scope without resolving user references to synthetic AST.
    let helper_scope = scoping.add_scope(
        Some(scoping.root_scope_id()),
        NodeId::DUMMY,
        ScopeFlags::Function,
    );
    for name in missing_names {
        scoping.create_symbol(
            Span::default(),
            name.into(),
            SymbolFlags::FunctionScopedVariable,
            helper_scope,
            NodeId::DUMMY,
        );
    }
}

/// Append one codegen segment, replacing the previous one when both describe the
/// same generated position: codegen order decides which token owns it.
fn push_codegen_segment(words: &mut Vec<u32>, segment: [u32; 5]) {
    if words
        .chunks_exact(5)
        .next_back()
        .is_some_and(|previous| previous[0] == segment[0] && previous[1] == segment[1])
    {
        words.truncate(words.len() - 5);
    }
    words.extend_from_slice(&segment);
}

/// Print a program and pack its map into a decoded layer.
///
/// Inline helper bundles remain opaque generated text to avoid reparsing large
/// Babel bodies. Insert them after hashbangs/directives and shift only subsequent
/// mappings, explicitly marking the helper span as unmapped.
fn render_program(
    program: &Program<'_>,
    filename: &str,
    minify: bool,
    comments: bool,
    prefix: Option<&str>,
) -> Result<(String, DecodedLayer)> {
    debug_assert!(prefix.is_none_or(|prefix| prefix.ends_with('\n')));
    let options = CodegenOptions {
        minify,
        comments: if comments {
            CommentOptions::default()
        } else {
            CommentOptions::disabled()
        },
        source_map_path: Some(PathBuf::from(filename)),
        ..CodegenOptions::default()
    };
    let mut generated = Codegen::new().with_options(options.clone()).build(program);
    let insertion =
        if prefix.is_some() && (program.hashbang.is_some() || !program.directives.is_empty()) {
            let allocator = Allocator::default();
            let last_header = program
                .directives
                .last()
                .map_or(0, |directive| directive.span.end);
            let mut header = Parser::new(&allocator, "", program.source_type)
                .parse()
                .program;
            header.span = program.span;
            header.source_text = program.source_text;
            header.comments.extend(
                program
                    .comments
                    .iter()
                    .filter(|comment| comment.span.end <= last_header)
                    .map(|comment| comment.clone_in(&allocator)),
            );
            header.hashbang = program.hashbang.clone_in(&allocator);
            header.directives = program.directives.clone_in(&allocator);
            let header = Codegen::new().with_options(options).build(&header).code;
            if !generated.code.starts_with(&header) {
                return Err(Error::new(
                    Status::GenericFailure,
                    "generated helper header mismatch",
                ));
            }
            header.len()
        } else {
            0
        };
    let header = &generated.code[..insertion];
    let insertion_line = header.bytes().filter(|byte| *byte == b'\n').count() as u32;
    let insertion_column = header
        .rsplit('\n')
        .next()
        .unwrap_or("")
        .encode_utf16()
        .count() as u32;
    let generated_line_offset = prefix.map_or(0, |prefix| {
        prefix.bytes().filter(|byte| *byte == b'\n').count() as u32
    });
    let map = generated.map.ok_or_else(|| {
        Error::new(
            Status::GenericFailure,
            "native preflight map was not emitted",
        )
    })?;
    let names: Vec<Rc<str>> = map.get_names().map(Rc::from).collect();
    let tokens = map.get_tokens();
    let mut words = Vec::with_capacity(tokens.size_hint().0 * 5);
    let emitted_last_line =
        u32::try_from(generated.code.bytes().filter(|byte| *byte == b'\n').count())
            .ok()
            .and_then(|line| line.checked_add(generated_line_offset))
            .ok_or_else(|| {
                Error::new(
                    Status::GenericFailure,
                    "generated output has too many lines",
                )
            })?;
    let mut last_segment_line = None;
    let mut prefix_unmapped = false;
    for token in tokens {
        let after_prefix = prefix.is_some()
            && (token.get_dst_line(), token.get_dst_col()) >= (insertion_line, insertion_column);
        if after_prefix && !prefix_unmapped {
            push_codegen_segment(
                &mut words,
                [insertion_line, insertion_column, u32::MAX, u32::MAX, 0],
            );
            for line in 1..generated_line_offset {
                push_codegen_segment(
                    &mut words,
                    [insertion_line + line, 0, u32::MAX, u32::MAX, 0],
                );
            }
            prefix_unmapped = true;
        }
        let generated_line = token
            .get_dst_line()
            .checked_add(if after_prefix {
                generated_line_offset
            } else {
                0
            })
            .ok_or_else(|| {
                Error::new(Status::GenericFailure, "generated source-map line overflow")
            })?;
        let generated_column = token.get_dst_col()
            - if after_prefix && token.get_dst_line() == insertion_line {
                insertion_column
            } else {
                0
            };
        // Generated punctuation must close the preceding mapped span instead of
        // inheriting its source position. For duplicate positions, the later
        // codegen token is authoritative.
        if token.get_source_id().is_some() {
            push_codegen_segment(
                &mut words,
                [
                    generated_line,
                    generated_column,
                    token.get_src_line(),
                    token.get_src_col(),
                    token.get_name_id().map_or(0, |id| id + 1),
                ],
            );
        } else {
            push_codegen_segment(
                &mut words,
                [generated_line, generated_column, u32::MAX, u32::MAX, 0],
            );
        }
        last_segment_line = Some(generated_line);
    }
    // Codegen normally terminates output with a newline but has no mapped token
    // on the resulting empty line. Retain that line explicitly as unmapped so a
    // later EOF edit cannot interpolate a stale mapping across the boundary.
    if !generated.code.is_empty() && last_segment_line.is_none_or(|line| line < emitted_last_line) {
        push_codegen_segment(&mut words, [emitted_last_line, 0, u32::MAX, u32::MAX, 0]);
    }
    if let Some(prefix) = prefix {
        generated.code.insert_str(insertion, prefix);
    }
    Ok((
        generated.code,
        DecodedLayer {
            words,
            names,
            last_generated_line: emitted_last_line,
        },
    ))
}

fn compile_options(
    options: &NativePreflightOptions,
    runtime_policy: Option<&RuntimeHelperPolicy>,
) -> Result<TransformOptions> {
    let mut compiled = TransformOptions {
        jsx: JsxOptions::disable(),
        ..TransformOptions::default()
    };
    if options.react_refresh == Some(true) {
        compiled.jsx.refresh = Some(ReactRefreshOptions {
            refresh_reg: options
                .react_refresh_reg
                .clone()
                .unwrap_or_else(|| "$RefreshReg$".into()),
            refresh_sig: options
                .react_refresh_sig
                .clone()
                .unwrap_or_else(|| "$RefreshSig$".into()),
            emit_full_signatures: options.react_refresh_emit_full_signatures.unwrap_or(false),
        });
    }
    #[cfg(feature = "react_compiler")]
    if options.react_compiler == Some(true) {
        let compilation_mode = options
            .react_compiler_compilation_mode
            .as_deref()
            .unwrap_or("infer")
            .parse::<CompilationMode>()
            .map_err(|()| {
                Error::new(Status::InvalidArg, "invalid React Compiler compilationMode")
            })?;
        let panic_threshold = options
            .react_compiler_panic_threshold
            .as_deref()
            .unwrap_or("none")
            .parse::<PanicThreshold>()
            .map_err(|()| {
                Error::new(Status::InvalidArg, "invalid React Compiler panicThreshold")
            })?;
        let target = match options.react_compiler_target.as_deref().unwrap_or("19") {
            value @ ("17" | "18" | "19") => CompilerTarget::Version(value.into()),
            _ => {
                return Err(Error::new(
                    Status::InvalidArg,
                    "invalid React Compiler target",
                ));
            }
        };
        let mut opt_out_directives = vec!["use no memo".into(), "use no forget".into()];
        for directive in options
            .react_compiler_custom_opt_out_directives
            .iter()
            .flatten()
        {
            if !opt_out_directives.contains(directive) {
                opt_out_directives.push(directive.clone());
            }
        }
        let environment = oxc_react_compiler::EnvironmentConfig {
            enable_reset_cache_on_source_file_changes: options
                .react_compiler_enable_reset_cache_on_source_file_changes,
            ..oxc_react_compiler::EnvironmentConfig::default()
        };
        compiled.react_compiler = Some(ReactCompilerOptions {
            compilation_mode,
            panic_threshold,
            target,
            // Oxc 0.141 treats this list as a replacement despite documenting it
            // as additions. Preserve the upstream defaults in the conformance layer.
            custom_opt_out_directives: Some(opt_out_directives),
            environment,
            ..ReactCompilerOptions::default()
        });
    }
    compiled.env.es2026.explicit_resource_management =
        options.explicit_resource_management == Some(true);
    // Selecting `classes` hands every class to the source-level rewrite, which
    // lowers its fields, static blocks and private members along with it. Oxc's
    // class-feature transforms then have nothing left to visit, and the
    // assumptions that configure them are read by passes that were never meant
    // to act on them — `set_public_class_fields` is what makes Oxc's TypeScript
    // strip lower `static x = 1` into a static block. Neither is selected here.
    let class_features_owned_by_rewrite = options.classes == Some(true);
    compiled.env.es2022.class_static_block =
        options.class_static_block == Some(true) && !class_features_owned_by_rewrite;
    compiled.env.es2021.logical_assignment_operators =
        options.logical_assignment_operators == Some(true);
    compiled.env.es2020.optional_chaining = options.optional_chaining == Some(true);
    compiled.env.es2020.nullish_coalescing_operator =
        options.nullish_coalescing_operator == Some(true);
    compiled.env.es2020.export_namespace_from = options.export_namespace_from == Some(true);
    compiled.env.es2019.optional_catch_binding = options.optional_catch_binding == Some(true);
    compiled.env.es2018.async_generator_functions = options.async_generator_functions == Some(true);
    compiled.env.es2017.async_to_generator = options.async_functions == Some(true);
    compiled.env.es2016.exponentiation_operator = options.exponentiation_operator == Some(true);
    if options.object_rest_spread == Some(true) {
        // Focused passes own ordered patterns and object expressions. Oxc's
        // default/spec pass completes flat rest declarations, assignments, and
        // parameters. Oxc rejects `loose` and `useBuiltIns` at construction time,
        // so keep its options at defaults.
        compiled.env.es2018.object_rest_spread = Some(Default::default());
    }
    // NOTE: Public fields use spec semantics while private fields use the loose
    // representation. The focused class pass owns private syntax, so the
    // historical Babel plugin requirement that every `loose` option agree is
    // neither necessary nor representative of the selected transform semantics.
    if options.class_properties == Some(true) && !class_features_owned_by_rewrite {
        // `ClassProperties::new` already reads `loose` into both
        // `set_public_class_fields` and `private_fields_as_properties`, and only
        // ORs the assumptions of the same name on top
        // (`es2022/class_properties/mod.rs:296,320`). Setting them here would add
        // nothing for this plugin and would put `set_public_class_fields` where
        // Oxc's TypeScript strip can read it — which is the one other place that
        // does, and which lowers class fields of its own accord when it sees it.
        let loose = options.class_properties_loose.unwrap_or(false);
        compiled.env.es2022.class_properties =
            Some(oxc_transformer::ClassPropertiesOptions { loose });
    }
    let mut nullish_loose: Option<bool> = None;
    for (enabled, loose) in [
        (options.optional_chaining, options.optional_chaining_loose),
        (
            options.nullish_coalescing_operator,
            options.nullish_coalescing_operator_loose,
        ),
    ] {
        if enabled == Some(true) {
            let loose = loose.unwrap_or(false);
            if nullish_loose.is_some_and(|selected| selected != loose) {
                return Err(Error::new(
                    Status::InvalidArg,
                    "optionalChaining and nullishCoalescingOperator must use the same loose value",
                ));
            }
            nullish_loose = Some(loose);
        }
    }
    // `no_document_all` is an assumption about the whole program, and the only
    // transforms that read it are optional chaining
    // (`es2020/optional_chaining.rs`) and the optional chain that class
    // properties builds around a private field
    // (`es2022/class_properties/private_field.rs:1626`). Oxc's nullish
    // coalescing does not read it at all, so deriving it from that option's
    // `loose` would leave the nullish output untouched while quietly loosening
    // two transforms the caller did not configure. The validation above already
    // requires the two `loose` values to agree wherever both are selected, so
    // reading only optional chaining's changes nothing when they are.
    if options.optional_chaining == Some(true) {
        compiled.assumptions.no_document_all = options.optional_chaining_loose.unwrap_or(false);
    }
    compiled.env.regexp.sticky_flag = options.regexp_sticky == Some(true);
    compiled.env.regexp.unicode_flag = options.regexp_unicode == Some(true);
    compiled.env.regexp.unicode_property_escapes =
        options.regexp_unicode_property_escapes == Some(true);
    compiled.env.regexp.dot_all_flag = options.regexp_dot_all == Some(true);
    // The focused RegExp pass owns named groups. Oxc's pass also treats escaped
    // `\(?<...>` text as a group candidate, producing a semantic mismatch.
    compiled.env.regexp.named_capture_groups = false;
    // Lookbehind and match indices have no semantics-preserving syntax-only
    // lowering. Selecting either option explicitly retains the native syntax.
    compiled.env.regexp.look_behind_assertions = false;
    compiled.env.regexp.match_indices = false;
    // The focused RegExp pass owns Unicode set notation so unsupported set
    // grammar yields a precise diagnostic instead of surviving postcondition.
    compiled.env.regexp.set_notation = false;
    match options.typescript.as_deref() {
        None => {}
        Some("strip") => {}
        Some(value) => {
            return Err(Error::new(
                Status::InvalidArg,
                format!("invalid native TypeScript transform: {value}"),
            ));
        }
    }
    match options.jsx.as_deref() {
        None | Some("preserve") => {}
        Some(
            mode @ ("classic"
            | "classic-development"
            | "automatic"
            | "automatic-if-present"
            | "automatic-development"),
        ) => {
            let refresh = compiled.jsx.refresh.take();
            compiled.jsx = JsxOptions::enable();
            compiled.jsx.refresh = refresh;
            compiled.jsx.runtime = if matches!(mode, "classic" | "classic-development") {
                JsxRuntime::Classic
            } else {
                JsxRuntime::Automatic
            };
            compiled.jsx.development =
                matches!(mode, "classic-development" | "automatic-development");
            compiled.jsx.pure = options.jsx_pure.unwrap_or(!matches!(
                mode,
                "classic-development" | "automatic-development"
            ));
            compiled.jsx.throw_if_namespace = options.jsx_throw_if_namespace.unwrap_or(true);
            compiled.jsx.import_source = options.jsx_import_source.clone();
            compiled.jsx.pragma = options.jsx_pragma.clone();
            compiled.jsx.pragma_frag = options.jsx_pragma_frag.clone();
            compiled.jsx.conform();
        }
        Some(value) => {
            return Err(Error::new(
                Status::InvalidArg,
                format!("invalid native JSX transform: {value}"),
            ));
        }
    }
    match options.helpers_mode.as_deref().unwrap_or("runtime") {
        "runtime" => {
            let all_available =
                runtime_policy.is_some_and(|policy| policy.all_generated_available());
            compiled.helper_loader.mode = if all_available {
                HelperLoaderMode::Runtime
            } else {
                HelperLoaderMode::External
            };
        }
        "inline" => compiled.helper_loader.mode = HelperLoaderMode::External,
        value => {
            return Err(Error::new(
                Status::InvalidArg,
                format!("invalid native helper mode: {value}"),
            ));
        }
    }
    compiled.helper_loader.module_name = options
        .helpers_module_name
        .clone()
        .unwrap_or_else(|| "@babel/runtime".into())
        .into();
    Ok(compiled)
}

struct DecoratorDetector(bool);

struct JsxDetector(bool);

fn reserve_prepass_name(
    preferred: &str,
    reserved: &mut std::collections::HashSet<String>,
) -> String {
    if reserved.insert(preferred.to_owned()) {
        return preferred.to_owned();
    }
    let mut suffix = 2;
    loop {
        let candidate = format!("{preferred}{suffix}");
        if reserved.insert(candidate.clone()) {
            return candidate;
        }
        suffix += 1;
    }
}

fn decorator_helpers(
    decorate_name: &str,
    decorate_param_name: &str,
    decorate: bool,
    decorate_param: bool,
) -> CustomHelperRequests {
    let mut requests = CustomHelperRequests::default();
    if decorate {
        requests.materialize_custom(CustomHelper::LegacyDecorate, decorate_name);
    }
    if decorate_param {
        requests.materialize_custom(CustomHelper::LegacyDecorateParam, decorate_param_name);
    }
    requests
}

struct DecoratorHelperReferenceRewriter<'a, 'n> {
    allocator: &'a Allocator,
    decorate_name: &'n str,
    decorate_param_name: &'n str,
}

impl<'a> VisitMut<'a> for DecoratorHelperReferenceRewriter<'a, '_> {
    #[expect(deprecated)]
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let Expression::StaticMemberExpression(member) = expression else {
            walk_mut::walk_expression(self, expression);
            return;
        };
        let Expression::Identifier(object) = &member.object else {
            walk_mut::walk_expression(self, expression);
            return;
        };
        if !object.span.is_empty() || object.name != "babelHelpers" {
            walk_mut::walk_expression(self, expression);
            return;
        }
        let replacement = match member.property.name.as_str() {
            "decorate" => self.decorate_name,
            "decorateParam" => self.decorate_param_name,
            _ => {
                walk_mut::walk_expression(self, expression);
                return;
            }
        };
        *expression = AstBuilder::new(self.allocator)
            .expression_identifier(member.span, self.allocator.alloc_str(replacement));
    }
}

impl<'a> Visit<'a> for JsxDetector {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.0 |= matches!(kind, AstKind::JSXElement(_) | AstKind::JSXFragment(_));
    }
}

impl<'a> Visit<'a> for DecoratorDetector {
    fn visit_decorator(&mut self, decorator: &Decorator<'a>) {
        self.0 = true;
        walk::walk_decorator(self, decorator);
    }
}

#[derive(Default)]
struct PostconditionDetector {
    check_regexp: bool,
    check_classes: bool,
    check_destructuring: bool,
    check_parameters: bool,
    check_for_of: bool,
    unicode: bool,
    unicode_property: bool,
    dot_all: bool,
    named_capture_groups: bool,
    unicode_sets: bool,
    classes: bool,
    destructuring: bool,
    parameters: bool,
    for_of: bool,
}

impl PostconditionDetector {
    fn is_active(&self) -> bool {
        self.check_regexp
            || self.check_classes
            || self.check_destructuring
            || self.check_parameters
            || self.check_for_of
    }

    fn failure_reason(&self, options: &NativePreflightOptions) -> Option<&'static str> {
        if options.regexp_unicode == Some(true) && self.unicode {
            Some("regexp-unicode-postcondition-failed")
        } else if options.regexp_unicode_property_escapes == Some(true) && self.unicode_property {
            Some("regexp-unicode-property-escapes-postcondition-failed")
        } else if options.regexp_dot_all == Some(true) && self.dot_all {
            Some("regexp-dot-all-postcondition-failed")
        } else if options.regexp_named_capture_groups == Some(true) && self.named_capture_groups {
            Some("regexp-named-capture-groups-postcondition-failed")
        } else if options.regexp_unicode_sets == Some(true) && self.unicode_sets {
            Some("regexp-unicode-sets-postcondition-failed")
        } else if self.check_destructuring && self.destructuring {
            Some("destructuring-postcondition-failed")
        } else if self.check_parameters && self.parameters {
            Some("parameters-postcondition-failed")
        } else if self.check_for_of && self.for_of {
            Some("for-of-postcondition-failed")
        } else {
            None
        }
    }
}

impl<'a> Visit<'a> for PostconditionDetector {
    fn visit_reg_exp_literal(&mut self, literal: &RegExpLiteral<'a>) {
        if !self.check_regexp {
            return;
        }
        self.unicode |= literal.regex.flags.contains(RegExpFlags::U);
        self.dot_all |= literal.regex.flags.contains(RegExpFlags::S);
        self.unicode_sets |= literal.regex.flags.contains(RegExpFlags::V);
        let remainder = literal.regex.pattern.text.as_str();
        self.unicode_property |= super::regexp::pattern_has_unicode_property(remainder);
        self.named_capture_groups |= literal
            .regex
            .pattern
            .pattern
            .as_deref()
            .is_some_and(super::regexp::pattern_has_named_group);
        walk::walk_reg_exp_literal(self, literal);
    }

    fn visit_class(&mut self, class: &Class<'a>) {
        if self.check_classes {
            self.classes = true;
            return;
        }
        walk::walk_class(self, class);
    }

    fn visit_variable_declarator(&mut self, declarator: &VariableDeclarator<'a>) {
        self.destructuring |= self.check_destructuring && !declarator.id.is_binding_identifier();
        walk::walk_variable_declarator(self, declarator);
    }

    fn visit_catch_clause(&mut self, clause: &CatchClause<'a>) {
        self.destructuring |= self.check_destructuring
            && clause
                .param
                .as_ref()
                .is_some_and(|param| !param.pattern.is_binding_identifier());
        walk::walk_catch_clause(self, clause);
    }

    fn visit_assignment_target_pattern(&mut self, pattern: &AssignmentTargetPattern<'a>) {
        self.destructuring |= self.check_destructuring;
        walk::walk_assignment_target_pattern(self, pattern);
    }

    fn visit_formal_parameters(&mut self, parameters: &FormalParameters<'a>) {
        if self.check_parameters
            && (parameters.rest.is_some()
                || parameters.items.iter().any(|parameter| {
                    parameter.initializer.is_some() || !parameter.pattern.is_binding_identifier()
                }))
        {
            self.parameters = true;
            return;
        }
        walk::walk_formal_parameters(self, parameters);
    }

    fn visit_for_of_statement(&mut self, statement: &ForOfStatement<'a>) {
        if self.check_for_of && !statement.r#await {
            self.for_of = true;
            return;
        }
        walk::walk_for_of_statement(self, statement);
    }
}

#[derive(Default)]
struct ClassFeaturesUnsupportedDetector {
    private_methods: bool,
    private_in: bool,
    check_private_methods: bool,
    check_private_in: bool,
}

impl ClassFeaturesUnsupportedDetector {
    fn has_unsupported_syntax(&self) -> bool {
        (self.check_private_methods && self.private_methods)
            || (self.check_private_in && self.private_in)
    }
}

impl<'a> Visit<'a> for ClassFeaturesUnsupportedDetector {
    fn visit_method_definition(&mut self, method: &MethodDefinition<'a>) {
        if matches!(method.key, PropertyKey::PrivateIdentifier(_)) {
            self.private_methods = true;
            if !self.check_private_in {
                return;
            }
        }
        walk::walk_method_definition(self, method);
    }

    fn visit_private_in_expression(&mut self, expression: &PrivateInExpression<'a>) {
        self.private_in = true;
        if !self.check_private_methods {
            return;
        }
        walk::walk_private_in_expression(self, expression);
    }
}

// Only generated fragments enter this visitor: user calls to require are untouched.
struct HelperImportRewriter<'a, 'r> {
    allocator: &'a Allocator,
    reservations: &'r mut SourceNameReservations,
    imports: Vec<(String, String)>,
}

impl<'a> VisitMut<'a> for HelperImportRewriter<'a, '_> {
    #[expect(deprecated)]
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if let Expression::CallExpression(call) = expression
            && matches!(&call.callee, Expression::Identifier(id) if id.name == "require")
            && call.arguments.len() == 1
            && let Argument::StringLiteral(path) = &call.arguments[0]
            && path.value.starts_with("@babel/runtime/helpers/")
        {
            let binding = if let Some((_, binding)) = self
                .imports
                .iter()
                .find(|(name, _)| name == path.value.as_str())
            {
                binding.clone()
            } else {
                let binding = self.reservations.reserve("_babelHelper");
                self.imports.push((path.value.to_string(), binding.clone()));
                binding
            };
            *expression = AstBuilder::new(self.allocator)
                .expression_identifier(Span::default(), self.allocator.alloc_str(&binding));
            return;
        }
        walk_mut::walk_expression(self, expression);
    }
}

/// Keep Babel's free globals free when embedding its module bodies in the source
/// program. Rename only colliding program bindings, preserving reference identity
/// and public export names. Nested source bindings cannot capture root helpers.
fn protect_helper_globals<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    globals: &rustc_hash::FxHashSet<&str>,
    reservations: &mut SourceNameReservations,
    scoping: &Scoping,
) {
    let mut renames = FxHashMap::default();
    let bindings = scoping.get_bindings(scoping.root_scope_id());
    for name in globals {
        if let Some(symbol) = bindings.get(*name) {
            renames.insert(*symbol, reservations.reserve(&format!("_{name}")));
        }
    }
    if renames.is_empty() {
        return;
    }
    let mut exports = String::new();
    for statement in &mut program.body {
        if let Statement::ExportNamedDeclaration(export) = statement
            && let Some(declaration) = &export.declaration
        {
            let mut bindings = Vec::new();
            oxc_ecmascript::BoundNames::bound_names(declaration, &mut |id| {
                if let Some(symbol) = id.symbol_id.get() {
                    bindings.push((id.name.to_string(), symbol));
                }
            });
            if bindings.iter().any(|(_, id)| renames.contains_key(id)) {
                for (name, id) in bindings {
                    let local = renames.get(&id).map_or(name.as_str(), String::as_str);
                    let _ = write!(exports, "export {{{local} as {name}}};");
                }
                *statement = export.declaration.take().unwrap().into();
            }
        }
    }
    struct Renamer<'a, 's> {
        allocator: &'a Allocator,
        scoping: &'s Scoping,
        renames: &'s FxHashMap<oxc_semantic::SymbolId, String>,
    }
    impl<'a> VisitMut<'a> for Renamer<'a, '_> {
        fn visit_binding_identifier(&mut self, id: &mut oxc_ast::ast::BindingIdentifier<'a>) {
            if let Some(symbol) = id.symbol_id.get()
                && let Some(name) = self.renames.get(&symbol)
            {
                id.name = self.allocator.alloc_str(name).into();
            }
        }
        fn visit_identifier_reference(&mut self, id: &mut IdentifierReference<'a>) {
            if let Some(reference) = id.reference_id.get()
                && let Some(symbol) = self.scoping.get_reference(reference).symbol_id()
                && let Some(name) = self.renames.get(&symbol)
            {
                id.name = self.allocator.alloc_str(name).into();
            }
        }
    }
    Renamer {
        allocator,
        scoping,
        renames: &renames,
    }
    .visit_program(program);
    if !exports.is_empty() {
        let parsed =
            Parser::new(allocator, allocator.alloc_str(&exports), SourceType::mjs()).parse();
        program.body.extend(parsed.program.body);
    }
}

struct InlineHelperRenamer<'a> {
    binding: &'a str,
}

struct ObjectRestLooseCompletionRewriter<'a> {
    allocator: &'a Allocator,
}

impl<'a> VisitMut<'a> for ObjectRestLooseCompletionRewriter<'a> {
    fn visit_string_literal(&mut self, literal: &mut StringLiteral<'a>) {
        if literal.span.is_empty()
            && literal
                .value
                .as_str()
                .ends_with("/helpers/objectWithoutProperties")
        {
            let replacement = format!("{}Loose", literal.value.as_str());
            literal.value = self.allocator.alloc_str(&replacement).into();
            literal.raw = None;
        }
    }

    fn visit_static_member_expression(&mut self, member: &mut StaticMemberExpression<'a>) {
        if member.property.name == "objectWithoutProperties"
            && matches!(
                &member.object,
                Expression::Identifier(identifier)
                    if identifier.span.is_empty()
                        && identifier.name.starts_with("babelHelpers")
            )
        {
            member.property.name = self
                .allocator
                .alloc_str("objectWithoutPropertiesLoose")
                .into();
        }
        walk_mut::walk_static_member_expression(self, member);
    }
}

impl<'a> VisitMut<'a> for InlineHelperRenamer<'a> {
    fn visit_identifier_reference(&mut self, identifier: &mut IdentifierReference<'a>) {
        if identifier.span.is_empty() && identifier.name == "babelHelpers" {
            identifier.name = self.binding.into();
        }
        walk_mut::walk_identifier_reference(self, identifier);
    }
}

struct MixedHelperReferenceRewriter<'a, 'n> {
    allocator: &'a Allocator,
    fallback: Option<&'n str>,
    replacements: &'n [(&'static str, Option<String>)],
}

struct SyntheticSpanZeroer;

impl<'a> VisitMut<'a> for SyntheticSpanZeroer {
    fn visit_span(&mut self, span: &mut Span) {
        *span = Span::default();
    }
}

impl<'a> VisitMut<'a> for MixedHelperReferenceRewriter<'a, '_> {
    #[expect(deprecated)]
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let Expression::StaticMemberExpression(member) = expression else {
            walk_mut::walk_expression(self, expression);
            return;
        };
        let Expression::Identifier(object) = &member.object else {
            walk_mut::walk_expression(self, expression);
            return;
        };
        if !object.span.is_empty() || object.name != "babelHelpers" {
            walk_mut::walk_expression(self, expression);
            return;
        }
        let Some((_, replacement)) = self
            .replacements
            .iter()
            .find(|(name, _)| *name == member.property.name)
        else {
            walk_mut::walk_expression(self, expression);
            return;
        };
        if let Some(binding) = replacement {
            *expression = AstBuilder::new(self.allocator)
                .expression_identifier(member.span, self.allocator.alloc_str(binding));
        } else {
            member.object = AstBuilder::new(self.allocator).expression_identifier(
                member.object.span(),
                self.allocator
                    .alloc_str(self.fallback.expect("fallback binding exists")),
            );
        }
    }
}

fn unsupported(
    reason: &str,
    diagnostics: impl IntoIterator<Item = impl std::fmt::Display>,
) -> NativePreflightResult {
    NativePreflightResult {
        status: "unsupported".into(),
        changed: false,
        normalized_javascript: false,
        jsx: false,
        reason: Some(reason.into()),
        code: None,
        map: None,
        diagnostics: diagnostics
            .into_iter()
            .map(|diagnostic| diagnostic.to_string())
            .collect(),
        helpers_used: Vec::new(),
    }
}

/// Report an internal transform failure without exposing any partially rewritten
/// source or source map to the JavaScript boundary.
fn fatal(
    reason: &str,
    diagnostics: impl IntoIterator<Item = impl std::fmt::Display>,
) -> NativePreflightResult {
    NativePreflightResult {
        status: "error".into(),
        changed: false,
        normalized_javascript: false,
        jsx: false,
        reason: Some(reason.into()),
        code: None,
        map: None,
        diagnostics: diagnostics
            .into_iter()
            .map(|diagnostic| diagnostic.to_string())
            .collect(),
        helpers_used: Vec::new(),
    }
}

fn identity_result(
    source: String,
    include_map: bool,
    normalized_javascript: bool,
    jsx: bool,
) -> NativePreflightResult {
    let map = include_map.then(|| {
        let last_generated_line = source.bytes().filter(|byte| *byte == b'\n').count() as u32;
        let mut words = Vec::with_capacity((last_generated_line as usize + 1) * 5);
        for line in 0..=last_generated_line {
            words.extend_from_slice(&[line, 0, line, 0, 0]);
        }
        pack_decoded_layer(&words, &[] as &[String], last_generated_line).into()
    });
    NativePreflightResult {
        status: "complete".into(),
        changed: false,
        normalized_javascript,
        jsx,
        reason: None,
        code: Some(source),
        map,
        diagnostics: Vec::new(),
        helpers_used: Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        edit::{EditCommand, EditKind, MappingPolicy, build},
        sourcemap::{compose, compose_layer_chain, render},
    };

    #[test]
    fn failure_result_constructors_encode_disposition_without_artifacts() {
        let unsupported = unsupported("compatibility-boundary", ["detail"]);
        assert_eq!(unsupported.status, "unsupported");
        assert_eq!(
            unsupported.reason.as_deref(),
            Some("compatibility-boundary")
        );
        assert_eq!(unsupported.diagnostics, ["detail"]);
        assert!(!unsupported.changed);
        assert!(unsupported.code.is_none());
        assert!(unsupported.map.is_none());

        let error = fatal("internal-invariant", ["detail"]);
        assert_eq!(error.status, "error");
        assert_eq!(error.reason.as_deref(), Some("internal-invariant"));
        assert_eq!(error.diagnostics, ["detail"]);
        assert!(!error.changed);
        assert!(error.code.is_none());
        assert!(error.map.is_none());
    }

    fn nested_destructuring(depth: usize) -> String {
        let mut statement = "sink(value);".to_owned();
        for index in (0..depth).rev() {
            statement = format!(
                "const [value{index} = (() => {{ {statement} return value; }})()] = source;"
            );
        }
        statement
    }

    #[test]
    fn structural_helper_reporting_is_mode_independent() {
        for (source, configure) in [
            (
                "const value = {...input};",
                NativePreflightOptions {
                    object_rest_spread: Some(true),
                    ..NativePreflightOptions::default()
                },
            ),
            (
                "const view = <Widget a={1} {...props} />;",
                NativePreflightOptions {
                    jsx: Some("classic".into()),
                    jsx_pragma: Some("React.createElement".into()),
                    ..NativePreflightOptions::default()
                },
            ),
        ] {
            let mut inline_options = configure;
            inline_options.helpers_mode = Some("inline".into());
            let inline = transform(source.into(), "fixture.jsx".into(), inline_options).unwrap();

            let runtime_options = NativePreflightOptions {
                object_rest_spread: source.contains("input").then_some(true),
                jsx: source.contains("Widget").then(|| "classic".into()),
                jsx_pragma: source
                    .contains("Widget")
                    .then(|| "React.createElement".into()),
                helpers_mode: Some("runtime".into()),
                helpers_module_name: Some("@babel/runtime".into()),
                helpers_version: Some("7.29.7".into()),
                ..NativePreflightOptions::default()
            };
            let runtime = transform(source.into(), "fixture.jsx".into(), runtime_options).unwrap();
            assert_eq!(inline.status, "complete", "{:?}", inline.reason);
            assert_eq!(runtime.status, "complete", "{:?}", runtime.reason);
            assert_eq!(inline.helpers_used, runtime.helpers_used);
            assert!(
                !inline.helpers_used.is_empty(),
                "{source}: {:?}",
                inline.code
            );
            if source.contains("Widget") {
                assert!(inline.helpers_used.iter().any(|name| name == "extends"));
            }
        }
    }

    #[test]
    fn detects_jsx_from_the_parsed_ast() {
        let allocator = Allocator::default();
        let parsed = Parser::new(
            &allocator,
            "const view = <><Widget /></>;",
            source_type("fixture.jsx", "").unwrap(),
        )
        .parse();
        assert!(parsed.diagnostics.is_empty());
        let mut detector = JsxDetector(false);
        detector.visit_program(&parsed.program);
        assert!(detector.0);
    }

    #[test]
    fn native_layer_composed_with_visitor_layer_preserves_native_boundaries() {
        let result = transform(
            "const value: number = 1;".into(),
            "fixture.ts".into(),
            NativePreflightOptions {
                typescript: Some("strip".into()),
                ..NativePreflightOptions::default()
            },
        )
        .unwrap();
        let code = result.code.unwrap();
        let native_layer = result.map.unwrap();
        let (native_mappings, native_names) =
            compose_layer_chain(&[native_layer.as_ref()]).unwrap();
        let literal = code.find('1').unwrap();
        let pieces = build(
            &code,
            vec![EditCommand {
                kind: EditKind::Replace,
                start: literal as u32,
                end: literal as u32 + 1,
                content: Some("200".into()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::AnchorStart),
                names: None,
                order: None,
            }],
        )
        .unwrap();
        let (_, visitor_mappings, visitor_names) = render(&code, &pieces, "boundary");
        let (_, visitor_layer) = crate::sourcemap::render_decoded(&code, &pieces, "boundary");
        let (composed, names) =
            compose_layer_chain(&[native_layer.as_ref(), visitor_layer.as_slice()]).unwrap();

        let legacy = compose(
            &visitor_mappings,
            &native_mappings,
            visitor_names.len() as u32,
        );
        assert_ne!(composed, legacy);
        let composed_columns = crate::sourcemap::decoded_generated_columns(&composed);
        let legacy_columns = crate::sourcemap::decoded_generated_columns(&legacy);
        assert!(composed_columns[0].contains(&6));
        assert!(!legacy_columns[0].contains(&6));
        let mut expected_names = visitor_names;
        expected_names.extend(native_names);
        assert_eq!(names, expected_names);
    }

    #[test]
    fn codegen_layer_closes_its_trailing_line_before_an_eof_edit() {
        let result = transform(
            "const value: number = 1;".into(),
            "fixture.ts".into(),
            NativePreflightOptions {
                typescript: Some("strip".into()),
                ..NativePreflightOptions::default()
            },
        )
        .unwrap();
        let code = result.code.unwrap();
        assert!(code.ends_with('\n'));
        let native_layer = result.map.unwrap();
        let eof = code.len() as u32;
        let pieces = build(
            &code,
            vec![EditCommand {
                kind: EditKind::Replace,
                start: eof,
                end: eof,
                content: Some("tail".into()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::AnchorStart),
                names: None,
                order: None,
            }],
        )
        .unwrap();
        let (_, eof_layer) = crate::sourcemap::render_decoded(&code, &pieces, "boundary");
        let (mappings, _) =
            compose_layer_chain(&[native_layer.as_ref(), eof_layer.as_slice()]).unwrap();

        assert_eq!(
            mappings
                .split(';')
                .next_back()
                .and_then(|line| line.split(',').next()),
            Some("A")
        );
    }

    #[test]
    fn codegen_segments_retain_unmapped_duplicate_boundaries() {
        let mut words = Vec::new();
        push_codegen_segment(&mut words, [0, 4, 0, 4, 0]);
        push_codegen_segment(&mut words, [0, 4, u32::MAX, u32::MAX, 0]);
        assert_eq!(words, [0, 4, u32::MAX, u32::MAX, 0]);
    }

    #[test]
    fn nested_destructuring_completes_in_one_plan() {
        let result = transform(
            nested_destructuring(12),
            "fixture.js".into(),
            NativePreflightOptions {
                destructuring: Some(true),
                helpers_mode: Some("inline".into()),
                ..NativePreflightOptions::default()
            },
        )
        .unwrap();
        assert_eq!(result.status, "complete", "{:?}", result.reason);
    }

    #[test]
    fn deeply_nested_destructuring_has_no_fixpoint_limit() {
        let result = transform(
            nested_destructuring(128),
            "fixture.js".into(),
            NativePreflightOptions {
                destructuring: Some(true),
                helpers_mode: Some("inline".into()),
                ..NativePreflightOptions::default()
            },
        )
        .unwrap();
        assert_eq!(result.status, "complete", "{:?}", result.reason);
    }

    #[test]
    fn loose_object_rest_does_not_rewrite_user_helper_strings() {
        let marker = "@babel/runtime/helpers/objectWithoutProperties";
        let result = transform(
            format!(
                "const marker = '{marker}'; function read({{ value, ...rest }}) {{ return [marker, rest]; }}"
            ),
            "fixture.js".into(),
            NativePreflightOptions {
                object_rest_spread: Some(true),
                object_rest_spread_loose: Some(true),
                helpers_mode: Some("runtime".into()),
                helpers_module_name: Some("@babel/runtime".into()),
                helpers_version: Some("7.29.7".into()),
                ..NativePreflightOptions::default()
            },
        )
        .unwrap();
        assert_eq!(result.status, "complete");
        let code = result.code.unwrap();
        assert!(code.contains(&format!("marker = \"{marker}\"")), "{code}");
        assert!(
            code.contains("helpers/objectWithoutPropertiesLoose"),
            "{code}"
        );
    }

    #[test]
    fn selected_absent_structural_transforms_are_identity_results() {
        for options in [
            NativePreflightOptions {
                parameters: Some(true),
                ..NativePreflightOptions::default()
            },
            NativePreflightOptions {
                for_of: Some(true),
                ..NativePreflightOptions::default()
            },
            NativePreflightOptions {
                destructuring: Some(true),
                ..NativePreflightOptions::default()
            },
        ] {
            let result =
                transform("const value = source;".into(), "fixture.js".into(), options).unwrap();
            assert_eq!(result.status, "complete", "{:?}", result.reason);
            assert!(!result.changed);
            assert_eq!(result.code.as_deref(), Some("const value = source;"));
        }
    }

    #[test]
    fn empty_structural_destructuring_plan_preserves_unowned_parameter_syntax() {
        let result = transform(
            "function read({ value }) { return value; }".into(),
            "fixture.js".into(),
            NativePreflightOptions {
                destructuring: Some(true),
                ..NativePreflightOptions::default()
            },
        )
        .unwrap();
        assert_eq!(result.status, "complete", "{:?}", result.reason);
        assert!(!result.changed);
        assert_eq!(
            result.code.as_deref(),
            Some("function read({ value }) { return value; }")
        );
    }

    #[test]
    fn language_prepasses_do_not_infer_legacy_helpers_from_user_text() {
        let marker = "@babel/runtime/helpers/objectWithoutProperties";
        let typescript = transform(
            format!("const marker: string = '{marker}'; let value: number = 1;"),
            "fixture.ts".into(),
            NativePreflightOptions {
                typescript: Some("strip".into()),
                block_scoping: Some(true),
                ..NativePreflightOptions::default()
            },
        )
        .unwrap();
        assert_eq!(typescript.status, "complete");
        assert!(typescript.helpers_used.is_empty());
        assert!(typescript.code.unwrap().contains(marker));

        let decorators = transform(
            format!("const marker = '{marker}'; @sealed class Value {{}}"),
            "fixture.js".into(),
            NativePreflightOptions {
                legacy_decorators: Some(true),
                classes: Some(true),
                helpers_mode: Some("inline".into()),
                ..NativePreflightOptions::default()
            },
        )
        .unwrap();
        assert_eq!(decorators.status, "complete", "{:?}", decorators.reason);
        assert!(decorators.code.unwrap().contains(marker));
        assert!(
            decorators
                .helpers_used
                .iter()
                .all(|helper| !helper.contains("objectWithoutProperties"))
        );
    }
}
