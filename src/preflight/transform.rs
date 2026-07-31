use std::path::{Path, PathBuf};
use std::rc::Rc;

use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use oxc_allocator::{Allocator, TakeIn};
use oxc_ast::{
    AstKind,
    ast::{
        AssignmentTargetPattern, CatchClause, Class, Decorator, ForOfStatement, FormalParameters,
        IdentifierReference, MethodDefinition, PrivateInExpression, Program, PropertyDefinition,
        PropertyKey, RegExpFlags, RegExpLiteral, VariableDeclarator,
    },
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions};
use oxc_parser::Parser;
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
use self_cell::self_cell;

use crate::sourcemap::{DecodedLayer, compose_decoded_layers, pack_decoded_layer};
use crate::syntax::classification::source_type;

use super::block_scoping;
use super::helpers::{
    custom_helpers_introduced, helper_adapter_markers, inline_helpers,
    validate_custom_runtime_helpers, validate_runtime_helpers,
};
use super::object_spread;
use super::optimize;
use super::options::NativePreflightOptions;

#[napi(object)]
pub struct NativePreflightResult {
    pub status: String,
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

fn parse_owned(source: String, source_type: SourceType) -> OwnedProgram {
    OwnedProgram::new(
        ParseOwner {
            allocator: Allocator::default(),
            source,
            source_type,
        },
        |owner| Parser::new(&owner.allocator, &owner.source, owner.source_type).parse(),
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
    mut source: String,
    filename: String,
    mut options: NativePreflightOptions,
) -> Result<NativePreflightResult> {
    // The one thing the original text is needed for downstream is telling which
    // custom-helper preludes a rewrite *introduced* — seven `contains` checks.
    // Precompute those booleans now instead of retaining a whole second copy of
    // the source across the entire transform.
    let before_helper_markers = helper_adapter_markers(&source);
    let mut semantic_build_count = 0;
    let mut ast_traversal_count = 0;
    if options.react_compiler == Some(true) && !cfg!(feature = "react_compiler") {
        return Ok(unsupported("react-compiler-not-built", [] as [String; 0]));
    }
    let conditional_jsx = options.jsx.as_deref() == Some("automatic-if-present");
    if conditional_jsx {
        options.jsx = Some("automatic".into());
    }
    let mut transform_options = compile_options(&options)?;
    let mut rewrite_layers = Vec::new();
    let loose_object_rest = options.object_rest_spread == Some(true)
        && options.object_rest_spread_loose == Some(true)
        && options.object_rest_spread_use_built_ins == Some(true);
    let focused_private_features =
        options.private_methods == Some(true) || options.private_property_in_object == Some(true);
    let class_rewrite_selected = options.classes == Some(true) || focused_private_features;
    let classes_ast_selected = class_rewrite_selected;
    let regexp_rewrite_selected = options.regexp_unicode == Some(true)
        || options.regexp_unicode_property_escapes == Some(true)
        || options.regexp_dot_all == Some(true)
        || options.regexp_named_capture_groups == Some(true);
    // Whether anything downstream of the language reads it.
    let selects_source_rewrite = options.block_scoping == Some(true)
        || options.classes == Some(true)
        || focused_private_features
        || options.parameters == Some(true)
        || options.for_of == Some(true)
        || options.destructuring == Some(true)
        || loose_object_rest
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
    let language_prepass = active_source_type.is_typescript()
        // Nothing downstream would read the language otherwise: the rewrites do,
        // and so does block scoping, because Oxc's `enum` lowering emits a `let`.
        // `automatic-if-present` is the one conditional phase, and the pipeline
        // requires it to stand alone, so it selects nothing here either.
        && selects_source_rewrite;
    // Attributed to the phases they belong to, so a prepass does not look free.
    if language_prepass {
        let language_allocator = Allocator::default();
        let parsed = run(|| Parser::new(&language_allocator, &source, active_source_type).parse());
        // A file that does not parse is reported by the parse below, with its
        // original spans rather than the prepass's.
        if parsed.diagnostics.is_empty() {
            let mut program = parsed.program;
            // Decorators have to be caught here, on the file as written. Neither
            // this pass nor the `classes` rewrite implements them, and both drop
            // them on the way past — so by the time the check further down runs,
            // on the rewritten source, there is nothing left for it to find and
            // the class ships without its decorator. Every decorator attaches to
            // a class or a class element, so the two substrings are a lossless
            // prerequisite for the walk.
            if source.contains('@') && source.contains("class") {
                let mut decorator_detector = DecoratorDetector(false);
                decorator_detector.visit_program(&program);
                ast_traversal_count += 1;
                if decorator_detector.0 {
                    return Ok(unsupported("decorators-not-supported", [] as [String; 0]));
                }
            }
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let built = run(|| {
                SemanticBuilder::new()
                    .with_excess_capacity(2.0)
                    .with_enum_eval(true)
                    .build(&program)
            });
            if built.diagnostics.is_empty() {
                let language_options = TransformOptions {
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
                ast_traversal_count += 1;
                let transformed =
                    Transformer::new(&language_allocator, Path::new(&filename), &language_options)
                        .build_with_scoping(built.semantic.into_scoping(), &mut program);
                if transformed.diagnostics.is_empty() {
                    // The intermediate is never the output, so it is printed
                    // unminified whatever the caller asked for: the final codegen
                    // does the minifying, and readable input keeps the rewrites'
                    // own textual guards honest.
                    let (printed, layer) = render_program(
                        &program,
                        &filename,
                        false,
                        options.comments.unwrap_or(true),
                        0,
                    )?;
                    source = printed;
                    rewrite_layers.push(layer);
                    #[expect(deprecated)]
                    {
                        debug_assert!(
                            transformed.helpers_used.is_empty(),
                            "the language prepass must not request helpers"
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
                }
            }
        }
    }
    let mut final_program = run(|| parse_owned(std::mem::take(&mut source), active_source_type));
    if final_program.has_diagnostics() {
        return Ok(unsupported(
            "parse-error",
            &final_program.borrow_dependent().diagnostics,
        ));
    }
    final_program.with_program_mut(|source, allocator, mut program| {
        let had_object_spread_syntax =
            loose_object_rest && object_spread::run(allocator, &mut program);
        if loose_object_rest {
            ast_traversal_count += 1;
        }
        let (had_regexp_syntax, structural_custom_helper_requests) = if regexp_rewrite_selected {
            ast_traversal_count += 1;
            match super::regexp::run(
                allocator,
                &mut program,
                source,
                super::regexp::Options {
                    unicode: options.regexp_unicode == Some(true),
                    unicode_properties: options.regexp_unicode_property_escapes == Some(true),
                    dot_all: options.regexp_dot_all == Some(true),
                    named_groups: options.regexp_named_capture_groups == Some(true),
                    inline_helpers: options.helpers_mode.as_deref() == Some("inline"),
                },
            ) {
                Ok(result) => result,
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            }
        } else {
            (false, super::helpers::CustomHelperRequests::default())
        };
        if conditional_jsx {
            let mut detector = JsxDetector(false);
            detector.visit_program(&program);
            ast_traversal_count += 1;
            // A conditional JSX-only phase can return the original bytes
            // without printing. A fused source rewrite still has work even
            // when this particular file contains no JSX.
            if !detector.0 && !selects_source_rewrite {
                return Ok(identity_result(source.to_owned()));
            }
        }
        let check_decorators = source.contains('@') && source.contains("class");
        let check_regexp = options.regexp_unicode == Some(true)
            || options.regexp_unicode_property_escapes == Some(true)
            || options.regexp_dot_all == Some(true)
            || options.regexp_named_capture_groups == Some(true)
            || options.regexp_look_behind == Some(true)
            || options.regexp_match_indices == Some(true)
            || options.regexp_unicode_sets == Some(true);
        let mut detector = PostconditionDetector {
            check_decorators,
            check_class_fusion: options.class_properties == Some(true),
            check_regexp,
            // Structurally owned classes run after semantic planning below.
            check_classes: options.classes == Some(true) && !classes_ast_selected,
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
            ast_traversal_count += 1;
        }
        if let Some(reason) = detector.failure_reason(&options) {
            return Ok(unsupported(reason, [] as [String; 0]));
        }
        semantic_build_count += 1;
        ast_traversal_count += 1;
        let semantic = run(|| {
            SemanticBuilder::new()
                .with_build_nodes(
                    options.block_scoping == Some(true)
                        || options.parameters == Some(true)
                        || options.destructuring == Some(true)
                        || loose_object_rest
                        || classes_ast_selected,
                )
                .with_excess_capacity(2.0)
                .with_enum_eval(true)
                .build(&program)
        });
        if !semantic.diagnostics.is_empty() {
            return Ok(unsupported("semantic-error", semantic.diagnostics));
        }
        let mut semantic = semantic;
        if options.block_scoping == Some(true) {
            loop {
                let plan = match block_scoping::prepare_captured_loop_ast(
                    source,
                    active_source_type,
                    &semantic.semantic,
                ) {
                    Ok(plan) => plan,
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                };
                if plan.is_empty() {
                    break;
                }
                drop(semantic);
                ast_traversal_count += 1;
                match block_scoping::run_captured_loop_ast(allocator, &mut program, plan) {
                    Ok(true) => {}
                    Ok(false) => {
                        return Ok(unsupported(
                            "captured-loop-ast-target-missing",
                            [] as [String; 0],
                        ));
                    }
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                }
                semantic_build_count += 1;
                ast_traversal_count += 1;
                semantic = run(|| {
                    SemanticBuilder::new()
                        .with_build_nodes(true)
                        .with_excess_capacity(2.0)
                        .with_enum_eval(true)
                        .build(&program)
                });
                if !semantic.diagnostics.is_empty() {
                    return Ok(unsupported(
                        "captured-loop-post-rewrite-semantic-error",
                        semantic.diagnostics,
                    ));
                }
            }
        }
        let classes_ast_plan = if classes_ast_selected {
            match super::classes::prepare_ast(
                source,
                active_source_type,
                &semantic.semantic,
                options.classes == Some(true),
                if options.classes == Some(true) {
                    options
                        .class_properties
                        .filter(|enabled| *enabled)
                        .map(|_| options.class_properties_loose.unwrap_or(false))
                } else {
                    Some(true)
                },
                options.class_static_block == Some(true),
                options
                    .private_methods
                    .filter(|enabled| *enabled)
                    .map(|_| options.private_methods_loose.unwrap_or(false)),
                options
                    .private_property_in_object
                    .filter(|enabled| *enabled)
                    .map(|_| options.private_property_in_object_loose.unwrap_or(false)),
                options.helpers_mode.as_deref() == Some("inline"),
                options.block_scoping == Some(true),
            ) {
                Ok(plan) => Some(plan),
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
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
                ast_traversal_count += 1;
                let (changed, requests) = match super::classes::run_ast(
                    allocator,
                    &mut program,
                    classes_ast_plan.unwrap(),
                ) {
                    Ok(result) => result,
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                };
                if !changed {
                    return Ok(unsupported("classes-ast-target-missing", [] as [String; 0]));
                }
                semantic_build_count += 1;
                ast_traversal_count += 1;
                let rebuilt = run(|| {
                    SemanticBuilder::new()
                        .with_build_nodes(true)
                        .with_excess_capacity(2.0)
                        .with_enum_eval(true)
                        .build(&program)
                });
                if !rebuilt.diagnostics.is_empty() {
                    return Ok(unsupported(
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
            ast_traversal_count += 1;
            if classes_postcondition.classes {
                return Ok(unsupported(
                    "classes-postcondition-failed",
                    [] as [String; 0],
                ));
            }
        }
        let had_block_scoping_syntax =
            options.block_scoping == Some(true) && block_scoping::has_remaining_syntax(&program);
        let early_block_scoping_plan = if had_block_scoping_syntax
            && !had_classes_ast_syntax
            && options.parameters != Some(true)
            && options.for_of != Some(true)
            && options.destructuring != Some(true)
            && !loose_object_rest
        {
            match block_scoping::prepare_with_reserved(
                &semantic.semantic,
                structural_custom_helper_requests
                    .scope_names()
                    .chain(classes_custom_helper_requests.scope_names()),
            ) {
                Ok(plan) => Some(plan),
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            }
        } else {
            None
        };
        let parameters_ast_plan = if options.parameters == Some(true) {
            match super::parameters::prepare_ast(source, &semantic.semantic) {
                Ok(plan) => Some(plan),
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            }
        } else {
            None
        };
        let early_destructuring_ast_plan = if (options.destructuring == Some(true)
            || loose_object_rest)
            && options.parameters != Some(true)
            && options.for_of != Some(true)
        {
            match super::destructuring::prepare_ast(
                source,
                &semantic.semantic,
                options.helpers_mode.as_deref() == Some("inline"),
                options.destructuring != Some(true),
                loose_object_rest,
                false,
                &[],
            ) {
                Ok(plan) => Some(plan),
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            }
        } else {
            None
        };
        let mut scoping = semantic.semantic.into_scoping();
        let had_parameters_ast_syntax = if let Some(plan) = parameters_ast_plan {
            ast_traversal_count += 1;
            match super::parameters::run_ast(allocator, &mut program, plan) {
                Ok(changed) => changed,
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            }
        } else {
            false
        };
        let for_of_plan = if options.for_of == Some(true) {
            // Parameters can introduce `_len`, `_key`, and capture aliases.
            // Rebuild before planning ForOf so its reservation set includes
            // every binding now present in the program.
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let mut semantic = run(|| {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .with_enum_eval(true)
                    .build(&program)
            });
            if !semantic.diagnostics.is_empty() {
                return Ok(unsupported(
                    "pre-for-of-semantic-error",
                    semantic.diagnostics,
                ));
            }
            reserve_custom_helper_scope_names(
                semantic.semantic.scoping_mut(),
                classes_custom_helper_requests.scope_names(),
            );
            Some(super::for_of::prepare(&semantic.semantic))
        } else {
            None
        };
        let had_for_of_syntax = if let Some(plan) = for_of_plan {
            ast_traversal_count += 1;
            match super::for_of::run(allocator, &mut program, plan) {
                Ok(changed) => changed,
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            }
        } else {
            false
        };
        if options.for_of == Some(true) {
            let mut for_of_postcondition = PostconditionDetector {
                check_for_of: true,
                ..PostconditionDetector::default()
            };
            for_of_postcondition.visit_program(&program);
            ast_traversal_count += 1;
            if for_of_postcondition.for_of {
                return Ok(unsupported(
                    "for-of-postcondition-failed",
                    [] as [String; 0],
                ));
            }
        }
        let mut destructuring_ast_plan = if early_destructuring_ast_plan.is_some() {
            early_destructuring_ast_plan
        } else if options.destructuring == Some(true) || loose_object_rest {
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let mut semantic = run(|| {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .with_enum_eval(true)
                    .build(&program)
            });
            if !semantic.diagnostics.is_empty() {
                return Ok(unsupported(
                    "pre-destructuring-semantic-error",
                    semantic.diagnostics,
                ));
            }
            reserve_custom_helper_scope_names(
                semantic.semantic.scoping_mut(),
                classes_custom_helper_requests.scope_names(),
            );
            let plan = match super::destructuring::prepare_ast(
                source,
                &semantic.semantic,
                options.helpers_mode.as_deref() == Some("inline"),
                options.destructuring != Some(true),
                loose_object_rest,
                false,
                &[],
            ) {
                Ok(plan) => plan,
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            };
            Some(plan)
        } else {
            None
        };
        let mut had_destructuring_ast_syntax = false;
        let mut destructuring_custom_helper_requests =
            super::helpers::CustomHelperRequests::default();
        let mut destructuring_helper_names = classes_custom_helper_requests
            .scope_names()
            .map(str::to_owned)
            .collect::<Vec<_>>();
        for _ in 0..64 {
            let Some(plan) = destructuring_ast_plan.take() else {
                break;
            };
            let nested_remaining = plan.nested_remaining();
            destructuring_helper_names.extend_from_slice(plan.emitted_helper_names());
            let (changed, requests) = {
                ast_traversal_count += 1;
                match super::destructuring::run_ast(allocator, &mut program, plan) {
                    Ok(result) => result,
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                }
            };
            if !changed {
                break;
            }
            had_destructuring_ast_syntax = true;
            destructuring_custom_helper_requests.prepend(requests);
            if !nested_remaining {
                break;
            }
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let semantic = run(|| {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .with_enum_eval(true)
                    .build(&program)
            });
            if !semantic.diagnostics.is_empty() {
                return Ok(unsupported(
                    "pre-destructuring-semantic-error",
                    semantic.diagnostics,
                ));
            }
            destructuring_ast_plan = match super::destructuring::prepare_ast(
                source,
                &semantic.semantic,
                options.helpers_mode.as_deref() == Some("inline"),
                options.destructuring != Some(true),
                loose_object_rest,
                false,
                &destructuring_helper_names,
            ) {
                Ok(plan) => Some(plan),
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            };
        }
        if destructuring_ast_plan.is_some() {
            return Ok(unsupported(
                "destructuring-fixpoint-limit",
                [] as [String; 0],
            ));
        }
        if options.parameters == Some(true) {
            let mut parameters_postcondition = PostconditionDetector {
                check_parameters: true,
                ..PostconditionDetector::default()
            };
            parameters_postcondition.visit_program(&program);
            ast_traversal_count += 1;
            if parameters_postcondition.parameters {
                return Ok(unsupported(
                    "parameters-postcondition-failed",
                    [] as [String; 0],
                ));
            }
        }
        if had_block_scoping_syntax {
            // Plan block scoping from the AST after Parameters, ForOf, and
            // Destructuring have introduced bindings. The earlier semantic
            // snapshot cannot safely determine collisions or loop ownership.
            let plan = if let Some(plan) = early_block_scoping_plan {
                plan
            } else {
                semantic_build_count += 1;
                ast_traversal_count += 1;
                let semantic = run(|| {
                    SemanticBuilder::new()
                        .with_build_nodes(true)
                        .with_excess_capacity(2.0)
                        .with_enum_eval(true)
                        .build(&program)
                });
                if !semantic.diagnostics.is_empty() {
                    return Ok(unsupported(
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
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                }
            };
            block_scoping::run(allocator, &mut program, plan);
            ast_traversal_count += 1;
        }
        if had_classes_ast_syntax
            || had_for_of_syntax
            || had_parameters_ast_syntax
            || had_destructuring_ast_syntax
        {
            // ForOf introduces a try/catch scope and six bindings. Oxc 0.141
            // has no incremental semantic update, so refresh scoping after all
            // pre-transform mutations and before handing the program to Oxc.
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let rebuilt = run(|| {
                SemanticBuilder::new()
                    .with_excess_capacity(2.0)
                    .with_enum_eval(true)
                    .build(&program)
            });
            if !rebuilt.diagnostics.is_empty() {
                return Ok(unsupported(
                    "post-rewrite-semantic-error",
                    rebuilt.diagnostics,
                ));
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
        let mut transformed = Transformer::new(allocator, Path::new(&filename), &transform_options)
            .build_with_scoping(scoping, &mut program);
        if let Some(deferred) = deferred_async
            && transformed.diagnostics.is_empty()
        {
            ast_traversal_count += 1;
            let async_pass = Transformer::new(allocator, Path::new(&filename), &deferred)
                .build_with_scoping(transformed.scoping, &mut program);
            transformed.diagnostics = async_pass.diagnostics;
            transformed.scoping = async_pass.scoping;
            #[expect(deprecated)]
            transformed.helpers_used.extend(async_pass.helpers_used);
        }
        if !transformed.diagnostics.is_empty() {
            return Ok(unsupported("transform-error", transformed.diagnostics));
        }
        if options.logical_assignment_operators == Some(true) {
            let existing = transformed
                .scoping
                .symbol_names()
                .collect::<rustc_hash::FxHashSet<_>>();
            let mut suffix = 0;
            let logical_temp = loop {
                let candidate = if suffix == 0 {
                    "_private".to_owned()
                } else {
                    format!("_private{suffix}")
                };
                if !existing.contains(candidate.as_str()) {
                    break candidate;
                }
                suffix += 1;
            };
            if super::logical_assignment::run(allocator, &mut program, &logical_temp) {
                ast_traversal_count += 1;
            }
        }
        if options.private_methods == Some(true) || options.private_property_in_object == Some(true)
        {
            let mut detector = ClassFeaturesUnsupportedDetector(false);
            detector.visit_program(&program);
            ast_traversal_count += 1;
            if detector.0 {
                return Ok(unsupported(
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
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let semantic = run(|| {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .build(&program)
            });
            if !semantic.diagnostics.is_empty() {
                return Ok(unsupported(
                    "block-scoping-postcondition-semantic-error",
                    semantic.diagnostics,
                ));
            }
            match block_scoping::prepare(&semantic.semantic) {
                Ok(plan) => block_scoping::run(allocator, &mut program, plan),
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            }
            ast_traversal_count += 1;
            if block_scoping::has_remaining_syntax(&program) {
                return Ok(unsupported(
                    "block-scoping-postcondition-failed",
                    [] as [String; 0],
                ));
            }
        }
        optimize::run(
            allocator,
            &mut program,
            options.constant_folding == Some(true),
            options.dead_code_elimination == Some(true),
        );
        #[expect(deprecated)]
        let helper_requests: Vec<_> = transformed.helpers_used.into_iter().collect();
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
            || (options.object_rest_spread == Some(true)
                && !(options.object_rest_spread_loose == Some(true)
                    && options.object_rest_spread_use_built_ins == Some(true)))
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
            && !(options.comments == Some(false)
                && (source.contains("//") || source.contains("/*")))
        {
            return Ok(identity_result(source.to_owned()));
        }
        let helper_mode = options.helpers_mode.as_deref().unwrap_or("runtime");
        let helper_module = options
            .helpers_module_name
            .as_deref()
            .unwrap_or("@babel/runtime");
        let mut custom_helper_requests = custom_helpers_introduced(&before_helper_markers, source);
        let mut custom_helper_fragments = Vec::new();
        let compact = options.compact.unwrap_or(false);
        structural_custom_helper_requests.extend_into(
            &mut custom_helper_requests,
            &mut custom_helper_fragments,
            compact,
        );
        destructuring_custom_helper_requests.extend_into(
            &mut custom_helper_requests,
            &mut custom_helper_fragments,
            compact,
        );
        classes_custom_helper_requests.extend_into(
            &mut custom_helper_requests,
            &mut custom_helper_fragments,
            compact,
        );
        let inline = if helper_mode == "inline" {
            match inline_helpers(helper_requests.iter().map(|(helper, _)| *helper), source) {
                Ok(inline) => inline,
                Err(reason) => return Ok(unsupported(&reason, [] as [String; 0])),
            }
        } else {
            None
        };
        if helper_mode == "runtime"
            && let Err(reason) = validate_runtime_helpers(
                helper_requests.iter().map(|(helper, _)| *helper),
                helper_module,
                options.helpers_version.as_deref(),
            )
        {
            return Ok(unsupported(&reason, [] as [String; 0]));
        }
        if helper_mode == "runtime"
            && let Err(reason) = validate_custom_runtime_helpers(
                &custom_helper_requests,
                helper_module,
                options.helpers_version.as_deref(),
            )
        {
            return Ok(unsupported(&reason, [] as [String; 0]));
        }
        if helper_mode == "runtime" {
            for (helper, source) in &helper_requests {
                let expected = format!("{helper_module}/helpers/{}", helper.name());
                if source != &expected {
                    return Ok(unsupported(
                        &format!("helper-source-mismatch:{}", helper.name()),
                        [] as [String; 0],
                    ));
                }
            }
        }
        let mut helpers_used: Vec<String> = helper_requests
            .into_iter()
            .map(|(helper, _)| helper.name().to_string())
            .collect();
        helpers_used.extend(custom_helper_requests.into_iter().map(str::to_string));
        helpers_used.sort_unstable();
        helpers_used.dedup();
        let inline_prefix = inline.map(|inline| {
            let binding = allocator.alloc_str(&inline.binding);
            InlineHelperRenamer { binding }.visit_program(&mut program);
            ast_traversal_count += 1;
            format!("var {binding}={};\n", inline.prefix)
        });
        let generated_line_offset = u32::from(inline_prefix.is_some());
        let (mut generated_code, codegen_layer) = render_program(
            &program,
            &filename,
            options.compact.unwrap_or(false),
            options.comments.unwrap_or(true),
            generated_line_offset,
        )?;
        rewrite_layers.push(codegen_layer);
        if !custom_helper_fragments.is_empty() {
            let directive_end = directive_prologue_end(&generated_code, program.directives.len())?;
            let synthetic_prefix_statements = program
                .body
                .iter()
                .take_while(|statement| {
                    let span = statement.span();
                    span.start == 0 && span.end == 0
                })
                .count();
            let insertion = generated_statement_prefix_end(
                &generated_code,
                directive_end,
                synthetic_prefix_statements,
            )?;
            let mut helper = custom_helper_fragments.concat();
            if !compact {
                let remainder_starts_with_newline =
                    generated_code.as_bytes().get(insertion) == Some(&b'\n');
                if helper.ends_with('\n') && remainder_starts_with_newline {
                    helper.pop();
                } else if !helper.ends_with('\n') && !remainder_starts_with_newline {
                    helper.push('\n');
                }
            }
            if !compact
                && insertion > 0
                && generated_code.as_bytes().get(insertion - 1) != Some(&b'\n')
            {
                helper.insert(0, '\n');
            }
            let (line, column) = generated_position(&generated_code, insertion);
            let codegen_layer = rewrite_layers.last_mut().unwrap();
            codegen_layer.shift_generated_for_insertion(
                line + generated_line_offset,
                column,
                &helper,
            );
            generated_code.insert_str(insertion, &helper);
        }
        let layer = if rewrite_layers.len() == 1 {
            rewrite_layers.pop().unwrap().pack()
        } else {
            compose_decoded_layers(&rewrite_layers).ok_or_else(|| {
                Error::new(
                    Status::GenericFailure,
                    "native captured-loop map composition failed",
                )
            })?
        };
        Ok(NativePreflightResult {
            status: "complete".into(),
            reason: None,
            code: Some(match inline_prefix {
                Some(prefix) => prefix + &generated_code,
                None => generated_code,
            }),
            map: Some(layer.into()),
            diagnostics: Vec::new(),
            helpers_used,
        })
    })
}

fn generated_position(source: &str, byte_offset: usize) -> (u32, u32) {
    let prefix = &source[..byte_offset];
    let line = prefix.bytes().filter(|byte| *byte == b'\n').count() as u32;
    let column = prefix
        .rsplit_once('\n')
        .map_or(prefix, |(_, tail)| tail)
        .encode_utf16()
        .count() as u32;
    (line, column)
}

fn reserve_custom_helper_scope_names<'a>(
    scoping: &mut Scoping,
    names: impl IntoIterator<Item = &'a str>,
) {
    let helper_names = names
        .into_iter()
        .map(str::to_owned)
        .collect::<rustc_hash::FxHashSet<_>>();
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

fn directive_prologue_end(code: &str, count: usize) -> Result<usize> {
    let bytes = code.as_bytes();
    let mut cursor = 0;
    for _ in 0..count {
        loop {
            while bytes
                .get(cursor)
                .is_some_and(|byte| byte.is_ascii_whitespace())
            {
                cursor += 1;
            }
            if bytes.get(cursor..cursor + 2) == Some(b"//") {
                cursor += 2;
                while bytes.get(cursor).is_some_and(|byte| *byte != b'\n') {
                    cursor += 1;
                }
                continue;
            }
            if bytes.get(cursor..cursor + 2) == Some(b"/*") {
                cursor += 2;
                while bytes.get(cursor..cursor + 2) != Some(b"*/") {
                    if cursor + 2 > bytes.len() {
                        return Err(Error::new(
                            Status::GenericFailure,
                            "generated directive comment was not terminated",
                        ));
                    }
                    cursor += 1;
                }
                cursor += 2;
                continue;
            }
            break;
        }
        let Some(quote @ (b'\'' | b'"')) = bytes.get(cursor).copied() else {
            return Err(Error::new(
                Status::GenericFailure,
                "generated directive prologue did not start with a string",
            ));
        };
        cursor += 1;
        loop {
            match bytes.get(cursor).copied() {
                Some(b'\\') => cursor += 2,
                Some(byte) if byte == quote => {
                    cursor += 1;
                    break;
                }
                Some(_) => cursor += 1,
                None => {
                    return Err(Error::new(
                        Status::GenericFailure,
                        "generated directive string was not terminated",
                    ));
                }
            }
        }
        while bytes
            .get(cursor)
            .is_some_and(|byte| byte.is_ascii_whitespace() && *byte != b'\n')
        {
            cursor += 1;
        }
        if bytes.get(cursor) == Some(&b';') {
            cursor += 1;
        }
    }
    Ok(cursor)
}

fn generated_statement_prefix_end(
    code: &str,
    start: usize,
    statement_count: usize,
) -> Result<usize> {
    let bytes = code.as_bytes();
    let mut cursor = start;
    for _ in 0..statement_count {
        let mut parens = 0_u32;
        let mut brackets = 0_u32;
        let mut braces = 0_u32;
        loop {
            match bytes.get(cursor).copied() {
                Some(byte) if byte.is_ascii_whitespace() => cursor += 1,
                Some(b'/') if bytes.get(cursor + 1) == Some(&b'/') => {
                    cursor += 2;
                    while bytes.get(cursor).is_some_and(|byte| *byte != b'\n') {
                        cursor += 1;
                    }
                }
                Some(b'/') if bytes.get(cursor + 1) == Some(&b'*') => {
                    cursor += 2;
                    while bytes.get(cursor..cursor + 2) != Some(b"*/") {
                        if cursor + 2 > bytes.len() {
                            return Err(Error::new(
                                Status::GenericFailure,
                                "generated helper-prefix comment was not terminated",
                            ));
                        }
                        cursor += 1;
                    }
                    cursor += 2;
                }
                _ => break,
            }
        }
        let mut quote = None;
        let mut escaped = false;
        loop {
            let Some(byte) = bytes.get(cursor).copied() else {
                return Err(Error::new(
                    Status::GenericFailure,
                    "generated helper-prefix statement was not terminated",
                ));
            };
            cursor += 1;
            if let Some(active_quote) = quote {
                if escaped {
                    escaped = false;
                } else if byte == b'\\' {
                    escaped = true;
                } else if byte == active_quote {
                    quote = None;
                }
                continue;
            }
            match byte {
                b'\'' | b'"' | b'`' => quote = Some(byte),
                b'/' if bytes.get(cursor) == Some(&b'/') => {
                    cursor += 1;
                    while bytes.get(cursor).is_some_and(|byte| *byte != b'\n') {
                        cursor += 1;
                    }
                }
                b'/' if bytes.get(cursor) == Some(&b'*') => {
                    cursor += 1;
                    while bytes.get(cursor..cursor + 2) != Some(b"*/") {
                        if cursor + 2 > bytes.len() {
                            return Err(Error::new(
                                Status::GenericFailure,
                                "generated helper-prefix comment was not terminated",
                            ));
                        }
                        cursor += 1;
                    }
                    cursor += 2;
                }
                b'(' => parens += 1,
                b')' => parens = parens.saturating_sub(1),
                b'[' => brackets += 1,
                b']' => brackets = brackets.saturating_sub(1),
                b'{' => braces += 1,
                b'}' => braces = braces.saturating_sub(1),
                b';' if parens == 0 && brackets == 0 && braces == 0 => break,
                _ => {}
            }
        }
    }
    Ok(cursor)
}

/// Print a program and pack its map into a decoded layer.
///
/// `generated_line_offset` accounts for lines the caller prepends to the
/// printed code after the fact, which the map has to be shifted past.
fn render_program(
    program: &Program<'_>,
    filename: &str,
    minify: bool,
    comments: bool,
    generated_line_offset: u32,
) -> Result<(String, DecodedLayer)> {
    let generated = Codegen::new()
        .with_options(CodegenOptions {
            minify,
            comments: if comments {
                CommentOptions::default()
            } else {
                CommentOptions::disabled()
            },
            source_map_path: Some(PathBuf::from(filename)),
            ..CodegenOptions::default()
        })
        .build(program);
    let map = generated.map.ok_or_else(|| {
        Error::new(
            Status::GenericFailure,
            "native preflight map was not emitted",
        )
    })?;
    let names: Vec<Rc<str>> = map.get_names().map(Rc::from).collect();
    let tokens = map.get_tokens();
    let mut words = Vec::with_capacity(tokens.size_hint().0 * 5);
    let mut line_count = 1 + generated_line_offset;
    for token in tokens {
        // The decoded-layer format represents a single input source. Codegen may
        // produce sourceless tokens for generated punctuation; those must remain
        // unmapped rather than being falsely anchored to the original.
        if token.get_source_id().is_none() {
            continue;
        }
        line_count = line_count.max(token.get_dst_line() + generated_line_offset + 1);
        words.extend_from_slice(&[
            token.get_dst_line() + generated_line_offset,
            token.get_dst_col(),
            token.get_src_line(),
            token.get_src_col(),
            token.get_name_id().map_or(0, |id| id + 1),
        ]);
    }
    Ok((
        generated.code,
        DecodedLayer {
            words,
            names,
            line_count,
        },
    ))
}

fn compile_options(options: &NativePreflightOptions) -> Result<TransformOptions> {
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
        compiled.env.es2018.object_rest_spread = Some(Default::default());
        let object_rest_spread = compiled.env.es2018.object_rest_spread.as_mut().unwrap();
        let focused_loose_built_in = options.object_rest_spread_loose == Some(true)
            && options.object_rest_spread_use_built_ins == Some(true);
        // The focused pass consumes source-level loose+built-in syntax first.
        // Keep Oxc's spec mode enabled for object spreads introduced later by
        // JSX and other transforms, exactly as the legacy prepass did.
        object_rest_spread.loose =
            options.object_rest_spread_loose.unwrap_or(false) && !focused_loose_built_in;
        object_rest_spread.use_built_ins =
            options.object_rest_spread_use_built_ins.unwrap_or(false) && !focused_loose_built_in;
    }
    let mut selected_class_feature_loose = None;
    for (enabled, loose) in [
        (options.class_properties, options.class_properties_loose),
        (options.private_methods, options.private_methods_loose),
        (
            options.private_property_in_object,
            options.private_property_in_object_loose,
        ),
    ] {
        if enabled == Some(true) {
            let loose = loose.unwrap_or(false);
            if selected_class_feature_loose.is_some_and(|selected| selected != loose) {
                return Err(Error::new(
                    Status::InvalidArg,
                    "classProperties, privateMethods, and privatePropertyInObject must use the same loose value",
                ));
            }
            selected_class_feature_loose = Some(loose);
        }
    }
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
    compiled.env.regexp.named_capture_groups = options.regexp_named_capture_groups == Some(true);
    compiled.env.regexp.look_behind_assertions = options.regexp_look_behind == Some(true);
    compiled.env.regexp.match_indices = options.regexp_match_indices == Some(true);
    compiled.env.regexp.set_notation = options.regexp_unicode_sets == Some(true);
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
            compiled.jsx.import_source = if compiled.jsx.runtime == JsxRuntime::Automatic {
                Some(
                    options
                        .jsx_import_source
                        .clone()
                        .unwrap_or_else(|| "react".into()),
                )
            } else {
                None
            };
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
        "runtime" => compiled.helper_loader.mode = HelperLoaderMode::Runtime,
        // External mode is used only as the transform-side representation for
        // future collision-free inline materialization. It is never exposed as a
        // supported output ABI.
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
    check_decorators: bool,
    check_class_fusion: bool,
    check_regexp: bool,
    check_classes: bool,
    check_destructuring: bool,
    check_parameters: bool,
    check_for_of: bool,
    decorators: bool,
    private_method: bool,
    private_in: bool,
    unicode: bool,
    unicode_property: bool,
    dot_all: bool,
    named_capture_groups: bool,
    look_behind: bool,
    match_indices: bool,
    unicode_sets: bool,
    classes: bool,
    destructuring: bool,
    parameters: bool,
    for_of: bool,
}

impl PostconditionDetector {
    fn is_active(&self) -> bool {
        self.check_decorators
            || self.check_class_fusion
            || self.check_regexp
            || self.check_classes
            || self.check_destructuring
            || self.check_parameters
            || self.check_for_of
    }

    fn failure_reason(&self, options: &NativePreflightOptions) -> Option<&'static str> {
        if self.check_decorators && self.decorators {
            Some("decorators-not-supported")
        } else if self.check_class_fusion
            && options.private_methods != Some(true)
            && self.private_method
        {
            Some("oxc-class-properties-private-method-fusion")
        } else if self.check_class_fusion
            && options.private_property_in_object != Some(true)
            && self.private_in
        {
            Some("oxc-class-properties-private-in-fusion")
        } else if options.regexp_unicode == Some(true) && self.unicode {
            Some("regexp-unicode-semantic-mismatch")
        } else if options.regexp_unicode_property_escapes == Some(true) && self.unicode_property {
            Some("regexp-unicode-property-escapes-semantic-mismatch")
        } else if options.regexp_dot_all == Some(true) && self.dot_all {
            Some("regexp-dot-all-semantic-mismatch")
        } else if options.regexp_named_capture_groups == Some(true) && self.named_capture_groups {
            Some("regexp-named-capture-groups-semantic-mismatch")
        } else if options.regexp_look_behind == Some(true) && self.look_behind {
            Some("regexp-look-behind-semantic-mismatch")
        } else if options.regexp_match_indices == Some(true) && self.match_indices {
            Some("regexp-match-indices-semantic-mismatch")
        } else if options.regexp_unicode_sets == Some(true) && self.unicode_sets {
            Some("regexp-unicode-sets-semantic-mismatch")
        } else if self.check_classes && self.classes {
            Some("classes-not-implemented")
        } else if self.check_destructuring && self.destructuring {
            Some("destructuring-not-implemented")
        } else if self.check_parameters && self.parameters {
            Some("parameters-postcondition-failed")
        } else if self.check_for_of && self.for_of {
            Some("for-of-not-implemented")
        } else {
            None
        }
    }
}

impl<'a> Visit<'a> for PostconditionDetector {
    fn visit_decorator(&mut self, decorator: &Decorator<'a>) {
        self.decorators |= self.check_decorators;
        walk::walk_decorator(self, decorator);
    }

    fn visit_method_definition(&mut self, method: &MethodDefinition<'a>) {
        self.private_method |=
            self.check_class_fusion && matches!(method.key, PropertyKey::PrivateIdentifier(_));
        walk::walk_method_definition(self, method);
    }

    fn visit_private_in_expression(&mut self, expression: &PrivateInExpression<'a>) {
        self.private_in |= self.check_class_fusion;
        walk::walk_private_in_expression(self, expression);
    }

    fn visit_reg_exp_literal(&mut self, literal: &RegExpLiteral<'a>) {
        if !self.check_regexp {
            return;
        }
        self.unicode |= literal.regex.flags.contains(RegExpFlags::U);
        self.dot_all |= literal.regex.flags.contains(RegExpFlags::S);
        self.match_indices |= literal.regex.flags.contains(RegExpFlags::D);
        self.unicode_sets |= literal.regex.flags.contains(RegExpFlags::V);
        let mut remainder = literal.regex.pattern.text.as_str();
        self.unicode_property |= remainder.contains("\\p{") || remainder.contains("\\P{");
        self.look_behind |= remainder.contains("(?<=") || remainder.contains("(?<!");
        while let Some(index) = remainder.find("(?<") {
            let discriminator = remainder.as_bytes().get(index + 3).copied();
            if !matches!(discriminator, Some(b'=') | Some(b'!')) {
                self.named_capture_groups = true;
                break;
            }
            remainder = &remainder[index + 3..];
        }
        walk::walk_reg_exp_literal(self, literal);
    }

    fn visit_class(&mut self, class: &Class<'a>) {
        self.classes |= self.check_classes;
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
        self.parameters |= self.check_parameters
            && (parameters.rest.is_some()
                || parameters.items.iter().any(|parameter| {
                    parameter.initializer.is_some() || !parameter.pattern.is_binding_identifier()
                }));
        walk::walk_formal_parameters(self, parameters);
    }

    fn visit_for_of_statement(&mut self, statement: &ForOfStatement<'a>) {
        self.for_of |= self.check_for_of && !statement.r#await;
        walk::walk_for_of_statement(self, statement);
    }
}

struct ClassFeaturesUnsupportedDetector(bool);

impl<'a> Visit<'a> for ClassFeaturesUnsupportedDetector {
    fn visit_property_definition(&mut self, property: &PropertyDefinition<'a>) {
        self.0 |= matches!(property.key, PropertyKey::PrivateIdentifier(_));
        walk::walk_property_definition(self, property);
    }

    fn visit_method_definition(&mut self, method: &MethodDefinition<'a>) {
        if matches!(method.key, PropertyKey::PrivateIdentifier(_)) {
            self.0 = true;
        }
        walk::walk_method_definition(self, method);
    }

    fn visit_private_in_expression(&mut self, expression: &PrivateInExpression<'a>) {
        self.0 = true;
        walk::walk_private_in_expression(self, expression);
    }
}

struct InlineHelperRenamer<'a> {
    binding: &'a str,
}

impl<'a> VisitMut<'a> for InlineHelperRenamer<'a> {
    fn visit_identifier_reference(&mut self, identifier: &mut IdentifierReference<'a>) {
        if identifier.span.is_empty() && identifier.name == "babelHelpers" {
            identifier.name = self.binding.into();
        }
        walk_mut::walk_identifier_reference(self, identifier);
    }
}

#[inline]
fn run<T>(operation: impl FnOnce() -> T) -> T {
    operation()
}

fn unsupported(
    reason: &str,
    diagnostics: impl IntoIterator<Item = impl std::fmt::Debug>,
) -> NativePreflightResult {
    NativePreflightResult {
        status: "unsupported".into(),
        reason: Some(reason.into()),
        code: None,
        map: None,
        diagnostics: diagnostics
            .into_iter()
            .map(|diagnostic| format!("{diagnostic:?}"))
            .collect(),
        helpers_used: Vec::new(),
    }
}

fn identity_result(source: String) -> NativePreflightResult {
    let line_count = source.bytes().filter(|byte| *byte == b'\n').count() as u32 + 1;
    let mut words = Vec::with_capacity(line_count as usize * 5);
    for line in 0..line_count {
        words.extend_from_slice(&[line, 0, line, 0, 0]);
    }
    NativePreflightResult {
        status: "complete".into(),
        reason: None,
        code: Some(source),
        map: Some(pack_decoded_layer(&words, &[] as &[String], line_count).into()),
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
    fn native_layer_composed_with_visitor_layer_matches_vlq_reference() {
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

        assert_eq!(
            composed,
            compose(
                &visitor_mappings,
                &native_mappings,
                visitor_names.len() as u32
            )
        );
        let mut expected_names = visitor_names;
        expected_names.extend(native_names);
        assert_eq!(names, expected_names);
    }

    #[test]
    fn nested_destructuring_completes_below_the_fixpoint_limit() {
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
    fn destructuring_fixpoint_limit_is_user_visible() {
        let result = transform(
            nested_destructuring(65),
            "fixture.js".into(),
            NativePreflightOptions {
                destructuring: Some(true),
                helpers_mode: Some("inline".into()),
                ..NativePreflightOptions::default()
            },
        )
        .unwrap();
        assert_eq!(result.status, "unsupported");
        assert_eq!(
            result.reason.as_deref(),
            Some("destructuring-fixpoint-limit")
        );
    }
}
