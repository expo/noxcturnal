use std::path::{Path, PathBuf};
use std::time::Instant;

use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use oxc_allocator::Allocator;
use oxc_ast::{
    AstKind,
    ast::{
        AssignmentTargetPattern, CatchClause, Class, Decorator, ForOfStatement, FormalParameters,
        IdentifierReference, MethodDefinition, PrivateInExpression, PropertyDefinition,
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
    HelperLoaderMode, JsxOptions, JsxRuntime, ReactRefreshOptions, TransformOptions, Transformer,
};

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
    let transform_options = compile_options(&options)?;
    let custom_rewrite_started = debug_performance.then(Instant::now);
    let mut rewrite_layers = Vec::new();
    let loose_object_rest = options.object_rest_spread == Some(true)
        && options.object_rest_spread_loose == Some(true)
        && options.object_rest_spread_use_built_ins == Some(true);
    // The structural prepass exists only for block-scoped bindings captured
    // across an iteration boundary. Every JavaScript iteration statement
    // contains either the `for` or `while` keyword, so files containing neither
    // can proceed directly to the ordinary block-scoping transform without an
    // otherwise redundant parse and semantic build. Raw substring checks are a
    // deliberate lossless prerequisite: comments and identifiers may cause
    // false positives, but valid captured loops cannot cause false negatives.
    let may_have_captured_loop = source.contains("for") || source.contains("while");
    if options.block_scoping == Some(true) && may_have_captured_loop {
        for _ in 0..64 {
            let rewrite_allocator = Allocator::default();
            let rewrite_source_type = source_type(&filename, &source)?;
            parse_count += 1;
            let rewritten = timed(debug_performance, &mut parse_ms, || {
                Parser::new(&rewrite_allocator, &source, rewrite_source_type).parse()
            });
            if !rewritten.diagnostics.is_empty() {
                break;
            }
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let semantic = timed(debug_performance, &mut semantic_build_ms, || {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .build(&rewritten.program)
            });
            if !semantic.diagnostics.is_empty() {
                break;
            }
            let Some(edits) = block_scoping::captured_loop_edits(&source, &semantic.semantic)
            else {
                break;
            };
            let pieces = match build_preflight_edits(&source, edits) {
                Ok(pieces) => pieces,
                Err(_) => {
                    return Ok(unsupported(
                        "captured-loop-edit-conflict",
                        [] as [String; 0],
                    ));
                }
            };
            let (rewritten_source, layer) = render_decoded(&source, &pieces, "character");
            render_count += 1;
            if rewritten_source == source {
                break;
            }
            source = rewritten_source;
            rewrite_layers.push(layer);
        }
    }
    // Lower classes before parameters so arrows in class-field initializers are
    // first relocated into the constructor that owns their lexical `this`.
    let focused_private_features =
        options.private_methods == Some(true) || options.private_property_in_object == Some(true);
    if options.classes == Some(true) || focused_private_features {
        for _ in 0..64 {
            let rewrite_allocator = Allocator::default();
            let rewrite_source_type = source_type(&filename, &source)?;
            parse_count += 1;
            let parsed = timed(debug_performance, &mut parse_ms, || {
                Parser::new(&rewrite_allocator, &source, rewrite_source_type).parse()
            });
            if !parsed.diagnostics.is_empty() {
                break;
            }
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let semantic = timed(debug_performance, &mut semantic_build_ms, || {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .build(&parsed.program)
            });
            if !semantic.diagnostics.is_empty() {
                break;
            }
            let edits = match super::classes::edits(
                &source,
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
            ) {
                Ok(edits) => edits,
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            };
            let Some(edits) = edits else {
                break;
            };
            let pieces = match build_preflight_edits(&source, edits) {
                Ok(pieces) => pieces,
                Err(_) => return Ok(unsupported("classes-edit-conflict", [] as [String; 0])),
            };
            let (rewritten_source, layer) = render_decoded(&source, &pieces, "boundary");
            render_count += 1;
            source = rewritten_source;
            rewrite_layers.push(layer);
        }
    }
    if options.parameters == Some(true) {
        for _ in 0..64 {
            let rewrite_allocator = Allocator::default();
            let rewrite_source_type = source_type(&filename, &source)?;
            parse_count += 1;
            let parsed = timed(debug_performance, &mut parse_ms, || {
                Parser::new(&rewrite_allocator, &source, rewrite_source_type).parse()
            });
            if !parsed.diagnostics.is_empty() {
                break;
            }
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let semantic = timed(debug_performance, &mut semantic_build_ms, || {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .build(&parsed.program)
            });
            if !semantic.diagnostics.is_empty() {
                break;
            }
            let edits = match super::parameters::edits(&source, &semantic.semantic) {
                Ok(edits) => edits,
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            };
            let Some(edits) = edits else {
                break;
            };
            let pieces = match build_preflight_edits(&source, edits) {
                Ok(pieces) => pieces,
                Err(_) => {
                    return Ok(unsupported("parameters-edit-conflict", [] as [String; 0]));
                }
            };
            let (rewritten_source, layer) = render_decoded(&source, &pieces, "boundary");
            render_count += 1;
            source = rewritten_source;
            rewrite_layers.push(layer);
        }
    }
    let mut destructuring_done = false;
    if options.for_of == Some(true) {
        for _ in 0..64 {
            let rewrite_allocator = Allocator::default();
            let rewrite_source_type = source_type(&filename, &source)?;
            parse_count += 1;
            let parsed = timed(debug_performance, &mut parse_ms, || {
                Parser::new(&rewrite_allocator, &source, rewrite_source_type).parse()
            });
            if !parsed.diagnostics.is_empty() {
                break;
            }
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let semantic = timed(debug_performance, &mut semantic_build_ms, || {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .build(&parsed.program)
            });
            if !semantic.diagnostics.is_empty() {
                break;
            }
            let edits = match super::for_of::edits(&source, &semantic.semantic) {
                Ok(edits) => edits,
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            };
            let Some(edits) = edits else {
                if options.destructuring == Some(true) {
                    let destructuring_edits = match super::destructuring::edits(
                        &source,
                        &semantic.semantic,
                        loose_object_rest,
                        false,
                        options.helpers_mode.as_deref() == Some("inline"),
                    ) {
                        Ok(edits) => edits,
                        Err(reason) => {
                            return Ok(unsupported(reason, [] as [String; 0]));
                        }
                    };
                    if let Some(destructuring_edits) = destructuring_edits {
                        // Leave the standalone pass below to finish a nesting;
                        // it re-parses, which is only worth it when there is
                        // something left to lower.
                        destructuring_done = !destructuring_edits.nested_remaining;
                        let pieces = match build_preflight_edits(&source, destructuring_edits.edits)
                        {
                            Ok(pieces) => pieces,
                            // The message names the two conflicting ranges, and
                            // a conflict is a defect in the lowering rather than
                            // unsupported input, so it is worth carrying.
                            Err(error) => {
                                return Ok(unsupported(
                                    "destructuring-edit-conflict",
                                    [error.reason],
                                ));
                            }
                        };
                        let (rewritten_source, layer) =
                            render_decoded(&source, &pieces, "boundary");
                        render_count += 1;
                        source = rewritten_source;
                        rewrite_layers.push(layer);
                    } else {
                        destructuring_done = true;
                    }
                }
                break;
            };
            let pieces = match build_preflight_edits(&source, edits) {
                Ok(pieces) => pieces,
                Err(_) => return Ok(unsupported("for-of-edit-conflict", [] as [String; 0])),
            };
            let (rewritten_source, layer) = render_decoded(&source, &pieces, "boundary");
            render_count += 1;
            source = rewritten_source;
            rewrite_layers.push(layer);
        }
    }
    // Bounded like the other rewrite loops: each round lowers one more level of
    // patterns nested inside a default value, and a file cannot nest deeper
    // than it is long.
    let mut destructuring_rounds = if destructuring_done { 0 } else { 64 };
    while options.destructuring == Some(true) && destructuring_rounds > 0 {
        destructuring_rounds -= 1;
        let rewrite_allocator = Allocator::default();
        let rewrite_source_type = source_type(&filename, &source)?;
        parse_count += 1;
        let parsed = timed(debug_performance, &mut parse_ms, || {
            Parser::new(&rewrite_allocator, &source, rewrite_source_type).parse()
        });
        if parsed.diagnostics.is_empty() {
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let semantic = timed(debug_performance, &mut semantic_build_ms, || {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .build(&parsed.program)
            });
            if !semantic.diagnostics.is_empty() {
                break;
            }
            let edits = match super::destructuring::edits(
                &source,
                &semantic.semantic,
                loose_object_rest,
                false,
                options.helpers_mode.as_deref() == Some("inline"),
            ) {
                Ok(edits) => edits,
                Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
            };
            let Some(edits) = edits else { break };
            let nested_remaining = edits.nested_remaining;
            let pieces = match build_preflight_edits(&source, edits.edits) {
                Ok(pieces) => pieces,
                Err(error) => {
                    return Ok(unsupported("destructuring-edit-conflict", [error.reason]));
                }
            };
            let (rewritten_source, layer) = render_decoded(&source, &pieces, "boundary");
            render_count += 1;
            source = rewritten_source;
            rewrite_layers.push(layer);
            if !nested_remaining {
                break;
            }
        } else {
            break;
        }
    }
    if options.object_rest_spread == Some(true)
        && options.object_rest_spread_loose == Some(true)
        && options.object_rest_spread_use_built_ins == Some(true)
    {
        for _ in 0..64 {
            let rewrite_allocator = Allocator::default();
            let rewrite_source_type = source_type(&filename, &source)?;
            parse_count += 1;
            let parsed = timed(debug_performance, &mut parse_ms, || {
                Parser::new(&rewrite_allocator, &source, rewrite_source_type).parse()
            });
            if !parsed.diagnostics.is_empty() {
                break;
            }
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let semantic = timed(debug_performance, &mut semantic_build_ms, || {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .build(&parsed.program)
            });
            if !semantic.diagnostics.is_empty() {
                break;
            }
            let Some(edits) = super::object_spread::edits(&source, &semantic.semantic) else {
                let rest_edits = match super::destructuring::edits(
                    &source,
                    &semantic.semantic,
                    true,
                    true,
                    options.helpers_mode.as_deref() == Some("inline"),
                ) {
                    Ok(edits) => edits,
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                };
                if let Some(rest_edits) = rest_edits {
                    let pieces = match build_preflight_edits(&source, rest_edits.edits) {
                        Ok(pieces) => pieces,
                        Err(_) => {
                            return Ok(unsupported("object-rest-edit-conflict", [] as [String; 0]));
                        }
                    };
                    let (rewritten_source, layer) = render_decoded(&source, &pieces, "boundary");
                    render_count += 1;
                    source = rewritten_source;
                    rewrite_layers.push(layer);
                }
                break;
            };
            let pieces = match build_preflight_edits(&source, edits) {
                Ok(pieces) => pieces,
                Err(_) => {
                    return Ok(unsupported(
                        "object-spread-edit-conflict",
                        [] as [String; 0],
                    ));
                }
            };
            let (rewritten_source, layer) = render_decoded(&source, &pieces, "boundary");
            render_count += 1;
            source = rewritten_source;
            rewrite_layers.push(layer);
        }
    }
    if options.regexp_unicode == Some(true)
        || options.regexp_unicode_property_escapes == Some(true)
        || options.regexp_dot_all == Some(true)
        || options.regexp_named_capture_groups == Some(true)
    {
        let rewrite_allocator = Allocator::default();
        let rewrite_source_type = source_type(&filename, &source)?;
        parse_count += 1;
        let parsed = timed(debug_performance, &mut parse_ms, || {
            Parser::new(&rewrite_allocator, &source, rewrite_source_type).parse()
        });
        if parsed.diagnostics.is_empty() {
            semantic_build_count += 1;
            ast_traversal_count += 1;
            let semantic = timed(debug_performance, &mut semantic_build_ms, || {
                SemanticBuilder::new()
                    .with_build_nodes(true)
                    .with_excess_capacity(2.0)
                    .build(&parsed.program)
            });
            if semantic.diagnostics.is_empty() {
                let edits = match super::regexp::edits(
                    &source,
                    &semantic.semantic,
                    options.regexp_unicode == Some(true),
                    options.regexp_unicode_property_escapes == Some(true),
                    options.regexp_dot_all == Some(true),
                    options.regexp_named_capture_groups == Some(true),
                    options.helpers_mode.as_deref() == Some("inline"),
                ) {
                    Ok(edits) => edits,
                    Err(reason) => return Ok(unsupported(reason, [] as [String; 0])),
                };
                if let Some(edits) = edits {
                    let pieces = match build_preflight_edits(&source, edits) {
                        Ok(pieces) => pieces,
                        Err(_) => {
                            return Ok(unsupported("regexp-edit-conflict", [] as [String; 0]));
                        }
                    };
                    let (rewritten_source, layer) = render_decoded(&source, &pieces, "boundary");
                    render_count += 1;
                    source = rewritten_source;
                    rewrite_layers.push(layer);
                }
            }
        }
    }
    let allocator = Allocator::default();
    let custom_rewrite_ms =
        custom_rewrite_started.map(|started| started.elapsed().as_secs_f64() * 1_000.0);
    let source_type = source_type(&filename, &source)?;
    parse_count += 1;
    let parsed = timed(debug_performance, &mut parse_ms, || {
        Parser::new(&allocator, &source, source_type).parse()
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
    let oxc_transform_started = debug_performance.then(Instant::now);
    let transformed = Transformer::new(&allocator, Path::new(&filename), &transform_options)
        .build_with_scoping(scoping, &mut program);
    let oxc_transform_ms =
        oxc_transform_started.map(|started| started.elapsed().as_secs_f64() * 1_000.0);
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
        return Ok(unsupported(
            "block-scoping-postcondition-failed",
            [] as [String; 0],
        ));
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

    let codegen_options = CodegenOptions {
        minify: options.compact.unwrap_or(false),
        comments: if options.comments.unwrap_or(true) {
            CommentOptions::default()
        } else {
            CommentOptions::disabled()
        },
        source_map_path: Some(PathBuf::from(&filename)),
        ..CodegenOptions::default()
    };
    let codegen_and_map_started = debug_performance.then(Instant::now);
    let generated = Codegen::new().with_options(codegen_options).build(&program);
    let map = generated.map.ok_or_else(|| {
        Error::new(
            Status::GenericFailure,
            "native preflight map was not emitted",
        )
    })?;
    let names: Vec<String> = map.get_names().map(str::to_owned).collect();
    let generated_line_offset = u32::from(inline_prefix.is_some());
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
    let codegen_layer = pack_decoded_layer(&words, &names, line_count);
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
    let codegen_and_map_ms =
        codegen_and_map_started.map(|started| started.elapsed().as_secs_f64() * 1_000.0);
    Ok(NativePreflightResult {
        status: "complete".into(),
        reason: None,
        code: Some(match inline_prefix {
            Some(prefix) => prefix + &generated.code,
            None => generated.code,
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
    compiled.env.es2022.class_static_block = options.class_static_block == Some(true);
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
    if options.class_properties == Some(true) {
        let loose = options.class_properties_loose.unwrap_or(false);
        compiled.env.es2022.class_properties =
            Some(oxc_transformer::ClassPropertiesOptions { loose });
        compiled.assumptions.set_public_class_fields = loose;
        compiled.assumptions.private_fields_as_properties = loose;
    }
    let mut nullish_loose = None;
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
    if let Some(loose) = nullish_loose {
        compiled.assumptions.no_document_all = loose;
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
        // An ambient class is a type declaration, and the TypeScript strip pass
        // deletes it. `classes::edits` deliberately leaves it alone for that
        // reason, so seeing one here is not an unlowered class.
        if class.declare {
            return;
        }
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
