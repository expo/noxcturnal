use std::path::{Path, PathBuf};
use std::time::Instant;

use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use oxc_allocator::Allocator;
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
use oxc_semantic::SemanticBuilder;
use oxc_transformer::{
    CompilerAssumptions, HelperLoaderMode, JsxOptions, JsxRuntime, ReactRefreshOptions,
    TransformOptions, Transformer,
};

use crate::edit::EditCommand;
use crate::edit::build as build_edits;
use crate::sourcemap::{compose_packed_layer_chain, pack_decoded_layer, render_decoded};
use crate::syntax::classification::source_type;

use super::block_scoping;
use super::helpers::{
    custom_helpers_introduced, inline_helpers, validate_custom_runtime_helpers,
    validate_runtime_helpers,
};
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
    pub parse_count: Option<u32>,
    pub semantic_build_count: Option<u32>,
    pub ast_traversal_count: Option<u32>,
    pub render_count: Option<u32>,
    pub parse_ms: Option<f64>,
    pub semantic_build_ms: Option<f64>,
    pub custom_rewrite_ms: Option<f64>,
    pub oxc_transform_ms: Option<f64>,
    pub optimization_ms: Option<f64>,
    pub codegen_and_map_ms: Option<f64>,
    pub helper_discovery_ms: Option<f64>,
    pub helper_materialization_ms: Option<f64>,
}

pub fn transform(
    mut source: String,
    filename: String,
    mut options: NativePreflightOptions,
) -> Result<NativePreflightResult> {
    let original_source = source.clone();
    let mut parse_count = 0;
    let mut semantic_build_count = 0;
    let mut ast_traversal_count = 0;
    let mut render_count = 0;
    let debug_performance = options.debug_performance.unwrap_or(false);
    let mut parse_ms = 0.0;
    let mut semantic_build_ms = 0.0;
    if options.react_compiler == Some(true) && !cfg!(feature = "react_compiler") {
        return Ok(unsupported("react-compiler-not-built", [] as [String; 0]));
    }
    let conditional_jsx = options.jsx.as_deref() == Some("automatic-if-present");
    if conditional_jsx {
        options.jsx = Some("automatic".into());
    }
    let mut transform_options = compile_options(&options)?;
    let custom_rewrite_started = debug_performance.then(Instant::now);
    let mut rewrite_layers = Vec::new();
    let loose_object_rest = options.object_rest_spread == Some(true)
        && options.object_rest_spread_loose == Some(true)
        && options.object_rest_spread_use_built_ins == Some(true);
    let focused_private_features =
        options.private_methods == Some(true) || options.private_property_in_object == Some(true);
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
    let mut language_oxc_ms = 0.0;
    let mut language_codegen_ms = 0.0;
    if language_prepass {
        let language_allocator = Allocator::default();
        parse_count += 1;
        let parsed = timed(debug_performance, &mut parse_ms, || {
            Parser::new(&language_allocator, &source, active_source_type).parse()
        });
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
            let built = timed(debug_performance, &mut semantic_build_ms, || {
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
                let language_started = debug_performance.then(Instant::now);
                ast_traversal_count += 1;
                let transformed =
                    Transformer::new(&language_allocator, Path::new(&filename), &language_options)
                        .build_with_scoping(built.semantic.into_scoping(), &mut program);
                if let Some(started) = language_started {
                    language_oxc_ms += started.elapsed().as_secs_f64() * 1_000.0;
                }
                if transformed.diagnostics.is_empty() {
                    let render_started = debug_performance.then(Instant::now);
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
                    render_count += 1;
                    if let Some(started) = render_started {
                        language_codegen_ms += started.elapsed().as_secs_f64() * 1_000.0;
                    }
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
    // The captured-loop rewrite exists only for block-scoped bindings captured
    // across an iteration boundary. Every JavaScript iteration statement
    // contains either the `for` or `while` keyword, so a source containing
    // neither can proceed directly to the ordinary block-scoping transform.
    // Raw substring checks are a deliberate lossless prerequisite: comments and
    // identifiers may cause false positives, but valid captured loops cannot
    // cause false negatives. Read after the prepass, because the source the
    // rewrites see is the one the prepass printed.
    let may_have_captured_loop = source.contains("for") || source.contains("while");
    let mut rewrites: Vec<RewriteStep> = Vec::with_capacity(8);
    // The rewrites read plain JavaScript, now that the prepass owns TypeScript
    // and they no longer carry a branch for any of it. A source type that is
    // still TypeScript here means the prepass declined — a file that does not
    // parse, or one Oxc could not analyse — and there is nothing safe for them
    // to do with it. Leaving the list empty hands the file to Oxc alone, whose
    // postconditions below route it to Babel.
    if !active_source_type.is_typescript() {
        if options.block_scoping == Some(true) && may_have_captured_loop {
            rewrites.push(RewriteStep::CapturedLoop);
        }
        // Lower classes before parameters so arrows in class-field initializers are
        // first relocated into the constructor that owns their lexical `this`.
        if options.classes == Some(true) || focused_private_features {
            rewrites.push(RewriteStep::Classes);
        }
        if options.parameters == Some(true) {
            rewrites.push(RewriteStep::Parameters);
        }
        if options.for_of == Some(true) {
            rewrites.push(RewriteStep::ForOf);
        }
        if options.destructuring == Some(true) {
            rewrites.push(RewriteStep::Destructuring);
        }
        if loose_object_rest {
            rewrites.push(RewriteStep::ObjectSpread);
            rewrites.push(RewriteStep::ObjectRest);
        }
        if regexp_rewrite_selected {
            rewrites.push(RewriteStep::Regexp);
        }
    }
    // One parse serves every rewrite until one of them renders.
    //
    // Each rewrite used to open with a parse and a semantic build of its own,
    // and most of them have nothing to do: across a 5.4k-module graph 71% of
    // parses produced no edit at all, and 61% of files rewrote nothing while
    // still paying four of them. Only a render can invalidate a parse, so a
    // rewrite that declines to act now hands its parse to the next one.
    //
    // `budget` is a runaway guard held per rewrite rather than for the section:
    // each round of a rewrite lowers one more level of nesting, and a file
    // cannot nest deeper than it is long.
    const REWRITE_ROUNDS: u32 = 64;
    let mut cursor = 0;
    let mut budget = REWRITE_ROUNDS;
    while cursor < rewrites.len() {
        let rewrite_allocator = Allocator::default();
        parse_count += 1;
        let parsed = timed(debug_performance, &mut parse_ms, || {
            Parser::new(&rewrite_allocator, &source, active_source_type).parse()
        });
        if !parsed.diagnostics.is_empty() {
            // Nothing further can be rewritten, and the parse below reports the
            // diagnostics rather than this loop swallowing them.
            break;
        }
        semantic_build_count += 1;
        ast_traversal_count += 1;
        let built = timed(debug_performance, &mut semantic_build_ms, || {
            SemanticBuilder::new()
                .with_build_nodes(true)
                .with_excess_capacity(2.0)
                .build(&parsed.program)
        });
        if !built.diagnostics.is_empty() {
            break;
        }
        let semantic = &built.semantic;
        let mut rendered = None;
        while let Some(step) = rewrites.get(cursor).copied() {
            // `revisit` is whether the rewrite has to look at its own output
            // before the next one runs.
            let planned: Option<(Vec<EditCommand>, bool)> = match step {
                RewriteStep::CapturedLoop => {
                    block_scoping::captured_loop_edits(&source, semantic).map(|edits| (edits, true))
                }
                RewriteStep::Classes => match super::classes::edits(
                    &source,
                    semantic,
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
                ) {
                    Ok(edits) => edits.map(|edits| (edits, true)),
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                },
                RewriteStep::Parameters => match super::parameters::edits(&source, semantic) {
                    Ok(edits) => edits.map(|edits| (edits, true)),
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                },
                RewriteStep::ForOf => match super::for_of::edits(&source, semantic) {
                    Ok(edits) => edits.map(|edits| (edits, true)),
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                },
                RewriteStep::Destructuring => match super::destructuring::edits(
                    &source,
                    semantic,
                    loose_object_rest,
                    false,
                    options.helpers_mode.as_deref() == Some("inline"),
                ) {
                    // A nesting is lowered one level per round, so the rewrite
                    // only has to run again when one is left.
                    Ok(edits) => edits.map(|edits| (edits.edits, edits.nested_remaining)),
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                },
                RewriteStep::ObjectSpread => {
                    super::object_spread::edits(&source, semantic).map(|edits| (edits, true))
                }
                // Object rest is what remains once every spread is lowered, so
                // it runs once, after `ObjectSpread` has settled.
                RewriteStep::ObjectRest => match super::destructuring::edits(
                    &source,
                    semantic,
                    true,
                    true,
                    options.helpers_mode.as_deref() == Some("inline"),
                ) {
                    Ok(edits) => edits.map(|edits| (edits.edits, false)),
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                },
                RewriteStep::Regexp => match super::regexp::edits(
                    &source,
                    semantic,
                    options.regexp_unicode == Some(true),
                    options.regexp_unicode_property_escapes == Some(true),
                    options.regexp_dot_all == Some(true),
                    options.regexp_named_capture_groups == Some(true),
                    options.helpers_mode.as_deref() == Some("inline"),
                ) {
                    Ok(edits) => edits.map(|edits| (edits, false)),
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                },
            };
            let Some((edits, revisit)) = planned else {
                cursor += 1;
                budget = REWRITE_ROUNDS;
                continue;
            };
            let pieces = match build_preflight_edits(&source, edits) {
                Ok(pieces) => pieces,
                // A conflict is a defect in the lowering rather than
                // unsupported input, so where the message names the two
                // conflicting ranges it is worth carrying.
                Err(error) => {
                    return Ok(if step.reports_conflicting_ranges() {
                        unsupported(step.conflict_reason(), [error.reason])
                    } else {
                        unsupported(step.conflict_reason(), [] as [String; 0])
                    });
                }
            };
            let (next, layer) = render_decoded(&source, &pieces, step.mapping());
            if next == source {
                // A rewrite that reproduces its input has converged. Keeping the
                // identity layer would also make an untouched file look rewritten
                // to the shortcut further down.
                cursor += 1;
                budget = REWRITE_ROUNDS;
                continue;
            }
            render_count += 1;
            budget -= 1;
            if !revisit || budget == 0 {
                cursor += 1;
                budget = REWRITE_ROUNDS;
            }
            rendered = Some((next, layer));
            break;
        }
        let Some((next, layer)) = rendered else { break };
        source = next;
        rewrite_layers.push(layer);
    }
    let allocator = Allocator::default();
    let custom_rewrite_ms =
        custom_rewrite_started.map(|started| started.elapsed().as_secs_f64() * 1_000.0);
    parse_count += 1;
    let parsed = timed(debug_performance, &mut parse_ms, || {
        Parser::new(&allocator, &source, active_source_type).parse()
    });
    if !parsed.diagnostics.is_empty() {
        return Ok(unsupported("parse-error", parsed.diagnostics));
    }
    let mut program = parsed.program;
    if conditional_jsx {
        let mut detector = JsxDetector(false);
        detector.visit_program(&program);
        ast_traversal_count += 1;
        if !detector.0 {
            return Ok(identity_result(
                source,
                parse_count,
                semantic_build_count,
                ast_traversal_count,
                render_count,
                debug_performance.then_some(parse_ms),
                debug_performance.then_some(semantic_build_ms),
            ));
        }
    }
    // Decorator syntax necessarily contains both `@` and the `class` keyword,
    // because every decorator attaches to a class or a class element. Avoid a
    // whole-program walk unless both prerequisites hold; the parsed AST stays
    // authoritative whenever they do.
    if source.contains('@') && source.contains("class") {
        let mut decorator_detector = DecoratorDetector(false);
        decorator_detector.visit_program(&program);
        ast_traversal_count += 1;
        if decorator_detector.0 {
            return Ok(unsupported("decorators-not-supported", [] as [String; 0]));
        }
    }
    if options.class_properties == Some(true) {
        let mut detector = PinnedOxcClassFusionDetector::default();
        detector.visit_program(&program);
        ast_traversal_count += 1;
        if options.private_methods != Some(true) && detector.private_method {
            return Ok(unsupported(
                "oxc-class-properties-private-method-fusion",
                [] as [String; 0],
            ));
        }
        if options.private_property_in_object != Some(true) && detector.private_in {
            return Ok(unsupported(
                "oxc-class-properties-private-in-fusion",
                [] as [String; 0],
            ));
        }
    }
    if options.regexp_unicode == Some(true)
        || options.regexp_unicode_property_escapes == Some(true)
        || options.regexp_dot_all == Some(true)
        || options.regexp_named_capture_groups == Some(true)
        || options.regexp_look_behind == Some(true)
        || options.regexp_match_indices == Some(true)
        || options.regexp_unicode_sets == Some(true)
    {
        let mut detector = RegExpSemanticMismatchDetector::default();
        detector.visit_program(&program);
        ast_traversal_count += 1;
        if options.regexp_unicode == Some(true) && detector.unicode {
            return Ok(unsupported(
                "regexp-unicode-semantic-mismatch",
                [] as [String; 0],
            ));
        }
        if options.regexp_unicode_property_escapes == Some(true) && detector.unicode_property {
            return Ok(unsupported(
                "regexp-unicode-property-escapes-semantic-mismatch",
                [] as [String; 0],
            ));
        }
        if options.regexp_dot_all == Some(true) && detector.dot_all {
            return Ok(unsupported(
                "regexp-dot-all-semantic-mismatch",
                [] as [String; 0],
            ));
        }
        if options.regexp_named_capture_groups == Some(true) && detector.named_capture_groups {
            return Ok(unsupported(
                "regexp-named-capture-groups-semantic-mismatch",
                [] as [String; 0],
            ));
        }
        if options.regexp_look_behind == Some(true) && detector.look_behind {
            return Ok(unsupported(
                "regexp-look-behind-semantic-mismatch",
                [] as [String; 0],
            ));
        }
        if options.regexp_match_indices == Some(true) && detector.match_indices {
            return Ok(unsupported(
                "regexp-match-indices-semantic-mismatch",
                [] as [String; 0],
            ));
        }
        if options.regexp_unicode_sets == Some(true) && detector.unicode_sets {
            return Ok(unsupported(
                "regexp-unicode-sets-semantic-mismatch",
                [] as [String; 0],
            ));
        }
    }
    if options.classes == Some(true) {
        let mut detector = ClassesDetector(false);
        detector.visit_program(&program);
        ast_traversal_count += 1;
        if detector.0 {
            return Ok(unsupported("classes-not-implemented", [] as [String; 0]));
        }
    }
    if options.destructuring == Some(true) {
        let mut detector = DestructuringDetector(false);
        detector.visit_program(&program);
        ast_traversal_count += 1;
        if detector.0 {
            return Ok(unsupported(
                "destructuring-not-implemented",
                [] as [String; 0],
            ));
        }
    }
    if options.parameters == Some(true) {
        let mut detector = ParametersDetector(false);
        detector.visit_program(&program);
        ast_traversal_count += 1;
        if detector.0 {
            return Ok(unsupported(
                "parameters-postcondition-failed",
                [] as [String; 0],
            ));
        }
    }
    if options.for_of == Some(true) {
        let mut detector = ForOfDetector(false);
        detector.visit_program(&program);
        ast_traversal_count += 1;
        if detector.0 {
            return Ok(unsupported("for-of-not-implemented", [] as [String; 0]));
        }
    }
    semantic_build_count += 1;
    ast_traversal_count += 1;
    let semantic = timed(debug_performance, &mut semantic_build_ms, || {
        SemanticBuilder::new()
            .with_build_nodes(options.block_scoping == Some(true))
            .with_excess_capacity(2.0)
            .with_enum_eval(true)
            .build(&program)
    });
    if !semantic.diagnostics.is_empty() {
        return Ok(unsupported("semantic-error", semantic.diagnostics));
    }
    let had_block_scoping_syntax =
        options.block_scoping == Some(true) && block_scoping::has_remaining_syntax(&program);
    let block_scoping_plan = if options.block_scoping == Some(true) {
        match block_scoping::prepare(&semantic.semantic) {
            Ok(plan) => Some(plan),
            Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
        }
    } else {
        None
    };
    let scoping = semantic.semantic.into_scoping();
    if let Some(plan) = block_scoping_plan {
        block_scoping::run(&allocator, &mut program, plan);
    }
    ast_traversal_count += 1;
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
    let oxc_transform_started = debug_performance.then(Instant::now);
    let mut transformed = Transformer::new(&allocator, Path::new(&filename), &transform_options)
        .build_with_scoping(scoping, &mut program);
    if let Some(deferred) = deferred_async
        && transformed.diagnostics.is_empty()
    {
        ast_traversal_count += 1;
        let async_pass = Transformer::new(&allocator, Path::new(&filename), &deferred)
            .build_with_scoping(transformed.scoping, &mut program);
        transformed.diagnostics = async_pass.diagnostics;
        transformed.scoping = async_pass.scoping;
        #[expect(deprecated)]
        transformed.helpers_used.extend(async_pass.helpers_used);
    }
    let oxc_transform_ms = oxc_transform_started
        .map(|started| started.elapsed().as_secs_f64() * 1_000.0 + language_oxc_ms);
    if !transformed.diagnostics.is_empty() {
        return Ok(unsupported("transform-error", transformed.diagnostics));
    }
    if options.private_methods == Some(true) || options.private_property_in_object == Some(true) {
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
        let semantic = timed(debug_performance, &mut semantic_build_ms, || {
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
            Ok(plan) => block_scoping::run(&allocator, &mut program, plan),
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
    let optimization_started = debug_performance.then(Instant::now);
    let (optimization_traversals, optimization_semantic_builds, optimization_semantic_ms) =
        optimize::run(
            &allocator,
            &mut program,
            options.constant_folding == Some(true),
            options.dead_code_elimination == Some(true),
            debug_performance,
        );
    let optimization_ms =
        optimization_started.map(|started| started.elapsed().as_secs_f64() * 1_000.0);
    ast_traversal_count += optimization_traversals;
    semantic_build_count += optimization_semantic_builds;
    semantic_build_ms += optimization_semantic_ms;
    let helper_discovery_started = debug_performance.then(Instant::now);
    #[expect(deprecated)]
    let helper_requests: Vec<_> = transformed.helpers_used.into_iter().collect();
    let oxc_codegen_only_transform_selected = options.explicit_resource_management == Some(true)
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
        && !oxc_codegen_only_transform_selected
        && options.typescript.is_none()
        && options.jsx.is_none()
        && options.react_compiler != Some(true)
        && options.react_refresh != Some(true)
        && options.constant_folding != Some(true)
        && options.dead_code_elimination != Some(true)
        && options.compact != Some(true)
        && !(options.comments == Some(false) && (source.contains("//") || source.contains("/*")))
    {
        return Ok(identity_result(
            source,
            parse_count,
            semantic_build_count,
            ast_traversal_count,
            render_count,
            debug_performance.then_some(parse_ms),
            debug_performance.then_some(semantic_build_ms),
        ));
    }
    let helper_mode = options.helpers_mode.as_deref().unwrap_or("runtime");
    let helper_module = options
        .helpers_module_name
        .as_deref()
        .unwrap_or("@babel/runtime");
    let custom_helper_requests = custom_helpers_introduced(&original_source, &source);
    let helper_discovery_ms =
        helper_discovery_started.map(|started| started.elapsed().as_secs_f64() * 1_000.0);
    let helper_materialization_started = debug_performance.then(Instant::now);
    let inline = if helper_mode == "inline" {
        match inline_helpers(helper_requests.iter().map(|(helper, _)| *helper), &source) {
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
    let helper_materialization_ms =
        helper_materialization_started.map(|started| started.elapsed().as_secs_f64() * 1_000.0);

    let codegen_and_map_started = debug_performance.then(Instant::now);
    let generated_line_offset = u32::from(inline_prefix.is_some());
    let (generated_code, codegen_layer) = render_program(
        &program,
        &filename,
        options.compact.unwrap_or(false),
        options.comments.unwrap_or(true),
        generated_line_offset,
    )?;
    let layer = if rewrite_layers.is_empty() {
        codegen_layer
    } else {
        let mut layers: Vec<&[u8]> = rewrite_layers.iter().map(Vec::as_slice).collect();
        layers.push(codegen_layer.as_slice());
        compose_packed_layer_chain(&layers).ok_or_else(|| {
            Error::new(
                Status::GenericFailure,
                "native captured-loop map composition failed",
            )
        })?
    };
    let codegen_and_map_ms = codegen_and_map_started
        .map(|started| started.elapsed().as_secs_f64() * 1_000.0 + language_codegen_ms);
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
        parse_count: Some(parse_count),
        semantic_build_count: Some(semantic_build_count),
        ast_traversal_count: Some(ast_traversal_count),
        render_count: Some(render_count + 1),
        parse_ms: debug_performance.then_some(parse_ms),
        semantic_build_ms: debug_performance.then_some(semantic_build_ms),
        custom_rewrite_ms,
        oxc_transform_ms,
        optimization_ms,
        codegen_and_map_ms,
        helper_discovery_ms,
        helper_materialization_ms,
    })
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
) -> Result<(String, Vec<u8>)> {
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
    let names: Vec<String> = map.get_names().map(str::to_owned).collect();
    let mut words = Vec::with_capacity(map.get_tokens().count() * 5);
    let mut line_count = 1 + generated_line_offset;
    for token in map.get_tokens() {
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
        pack_decoded_layer(&words, &names, line_count),
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
        // Loose+built-in object spread is lowered by the focused mapped prepass.
        // Oxc 0.141 reports these two Babel-compatible options as unimplemented
        // even after no spread syntax remains, so do not forward them.
        let focused_loose_built_in = options.object_rest_spread_loose == Some(true)
            && options.object_rest_spread_use_built_ins == Some(true);
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
            compiled.jsx.pure = !matches!(mode, "classic-development" | "automatic-development");
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
struct RegExpSemanticMismatchDetector {
    unicode: bool,
    unicode_property: bool,
    dot_all: bool,
    named_capture_groups: bool,
    look_behind: bool,
    match_indices: bool,
    unicode_sets: bool,
}

impl<'a> Visit<'a> for RegExpSemanticMismatchDetector {
    fn visit_reg_exp_literal(&mut self, literal: &RegExpLiteral<'a>) {
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
}

struct ClassFeaturesUnsupportedDetector(bool);

#[derive(Default)]
struct PinnedOxcClassFusionDetector {
    private_method: bool,
    private_in: bool,
}

impl<'a> Visit<'a> for PinnedOxcClassFusionDetector {
    fn visit_method_definition(&mut self, method: &MethodDefinition<'a>) {
        self.private_method |= matches!(method.key, PropertyKey::PrivateIdentifier(_));
        walk::walk_method_definition(self, method);
    }

    fn visit_private_in_expression(&mut self, expression: &PrivateInExpression<'a>) {
        self.private_in = true;
        walk::walk_private_in_expression(self, expression);
    }
}

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

/// A source-level rewrite, in the order the rewrites have to run.
///
/// They are steps of one loop rather than loops of their own so that a parse
/// outlives every rewrite that declines to act on it.
#[derive(Clone, Copy)]
enum RewriteStep {
    CapturedLoop,
    Classes,
    Parameters,
    ForOf,
    Destructuring,
    ObjectSpread,
    ObjectRest,
    Regexp,
}

impl RewriteStep {
    /// Granularity the render maps at.
    fn mapping(self) -> &'static str {
        match self {
            // Relocating a loop body moves original text into a helper, so its
            // mappings only survive if every character carries one.
            Self::CapturedLoop => "character",
            _ => "boundary",
        }
    }

    fn conflict_reason(self) -> &'static str {
        match self {
            Self::CapturedLoop => "captured-loop-edit-conflict",
            Self::Classes => "classes-edit-conflict",
            Self::Parameters => "parameters-edit-conflict",
            Self::ForOf => "for-of-edit-conflict",
            Self::Destructuring => "destructuring-edit-conflict",
            Self::ObjectSpread => "object-spread-edit-conflict",
            Self::ObjectRest => "object-rest-edit-conflict",
            Self::Regexp => "regexp-edit-conflict",
        }
    }

    /// Whether a conflict here is worth reporting with the two ranges named.
    fn reports_conflicting_ranges(self) -> bool {
        matches!(self, Self::Destructuring)
    }
}

struct ClassesDetector(bool);
struct DestructuringDetector(bool);
struct ParametersDetector(bool);
struct ForOfDetector(bool);

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

impl<'a> Visit<'a> for ClassesDetector {
    fn visit_class(&mut self, class: &Class<'a>) {
        self.0 = true;
        walk::walk_class(self, class);
    }
}

impl<'a> Visit<'a> for DestructuringDetector {
    fn visit_variable_declarator(&mut self, declarator: &VariableDeclarator<'a>) {
        self.0 |= !declarator.id.is_binding_identifier();
        walk::walk_variable_declarator(self, declarator);
    }

    fn visit_catch_clause(&mut self, clause: &CatchClause<'a>) {
        self.0 |= clause
            .param
            .as_ref()
            .is_some_and(|param| !param.pattern.is_binding_identifier());
        walk::walk_catch_clause(self, clause);
    }

    fn visit_assignment_target_pattern(&mut self, pattern: &AssignmentTargetPattern<'a>) {
        self.0 = true;
        walk::walk_assignment_target_pattern(self, pattern);
    }
}

impl<'a> Visit<'a> for ParametersDetector {
    fn visit_formal_parameters(&mut self, parameters: &FormalParameters<'a>) {
        self.0 |= parameters.rest.is_some()
            || parameters.items.iter().any(|parameter| {
                parameter.initializer.is_some() || !parameter.pattern.is_binding_identifier()
            });
        walk::walk_formal_parameters(self, parameters);
    }
}

impl<'a> Visit<'a> for ForOfDetector {
    fn visit_for_of_statement(&mut self, statement: &ForOfStatement<'a>) {
        self.0 |= !statement.r#await;
        walk::walk_for_of_statement(self, statement);
    }
}

#[inline]
fn timed<T>(enabled: bool, total_ms: &mut f64, operation: impl FnOnce() -> T) -> T {
    if !enabled {
        return operation();
    }
    let started = Instant::now();
    let result = operation();
    *total_ms += started.elapsed().as_secs_f64() * 1_000.0;
    result
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
        parse_count: None,
        semantic_build_count: None,
        ast_traversal_count: None,
        render_count: None,
        parse_ms: None,
        semantic_build_ms: None,
        custom_rewrite_ms: None,
        oxc_transform_ms: None,
        optimization_ms: None,
        codegen_and_map_ms: None,
        helper_discovery_ms: None,
        helper_materialization_ms: None,
    }
}

fn identity_result(
    source: String,
    parse_count: u32,
    semantic_build_count: u32,
    ast_traversal_count: u32,
    render_count: u32,
    parse_ms: Option<f64>,
    semantic_build_ms: Option<f64>,
) -> NativePreflightResult {
    let line_count = source.bytes().filter(|byte| *byte == b'\n').count() as u32 + 1;
    let mut words = Vec::with_capacity(line_count as usize * 5);
    for line in 0..line_count {
        words.extend_from_slice(&[line, 0, line, 0, 0]);
    }
    NativePreflightResult {
        status: "complete".into(),
        reason: None,
        code: Some(source),
        map: Some(pack_decoded_layer(&words, &[], line_count).into()),
        diagnostics: Vec::new(),
        helpers_used: Vec::new(),
        parse_count: Some(parse_count),
        semantic_build_count: Some(semantic_build_count),
        ast_traversal_count: Some(ast_traversal_count),
        render_count: Some(render_count),
        parse_ms,
        semantic_build_ms,
        custom_rewrite_ms: None,
        oxc_transform_ms: None,
        optimization_ms: None,
        codegen_and_map_ms: None,
        helper_discovery_ms: None,
        helper_materialization_ms: None,
    }
}

/// Oxc spans are UTF-8 byte offsets while the shared edit protocol deliberately
/// uses JavaScript UTF-16 coordinates. Native preflight passes operate directly
/// on Oxc nodes, so normalize their commands once at this boundary.
fn build_preflight_edits(
    source: &str,
    mut edits: Vec<crate::edit::EditCommand>,
) -> Result<Vec<crate::edit::Piece>> {
    if source.is_ascii() {
        return build_edits(source, edits);
    }
    let mut utf16 = vec![u32::MAX; source.len() + 1];
    let mut units = 0u32;
    for (byte, character) in source.char_indices() {
        utf16[byte] = units;
        units += character.len_utf16() as u32;
    }
    utf16[source.len()] = units;
    let convert = |offset: u32| -> Result<u32> {
        utf16
            .get(offset as usize)
            .copied()
            .filter(|offset| *offset != u32::MAX)
            .ok_or_else(|| {
                Error::new(
                    Status::GenericFailure,
                    format!("native edit byte offset {offset} is not a character boundary"),
                )
            })
    };
    for edit in &mut edits {
        edit.start = convert(edit.start)?;
        edit.end = convert(edit.end)?;
        if let Some(destination) = edit.destination.as_mut() {
            *destination = convert(*destination)?;
        }
        for part in &mut edit.parts {
            let crate::edit::RawContentPart::Copy { start, end } = part else {
                continue;
            };
            *start = convert(*start)?;
            *end = convert(*end)?;
        }
    }
    build_edits(source, edits)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        edit::{EditCommand, EditKind, MappingPolicy, build},
        sourcemap::{compose, compose_layer_chain, render, render_decoded},
    };

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
        let (_, visitor_layer) = render_decoded(&code, &pieces, "boundary");
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
}
