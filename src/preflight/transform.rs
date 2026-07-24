use std::path::{Path, PathBuf};

use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use oxc_allocator::Allocator;
use oxc_ast::ast::{
    AssignmentTargetPattern, CatchClause, Class, Decorator, ForOfStatement, FormalParameters,
    IdentifierReference, MethodDefinition, PropertyDefinition, PropertyKey, RegExpFlags,
    RegExpLiteral, VariableDeclaration, VariableDeclarationKind, VariableDeclarator,
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions};
use oxc_parser::Parser;
#[cfg(feature = "react_compiler")]
use oxc_react_compiler::{
    CompilationMode, CompilerTarget, PanicThreshold, PluginOptions as ReactCompilerOptions,
};
use oxc_semantic::SemanticBuilder;
use oxc_transformer::{HelperLoaderMode, JsxOptions, JsxRuntime, TransformOptions, Transformer};

use crate::sourcemap::pack_decoded_layer;
use crate::syntax::classification::source_type;

use super::helpers::{inline_helpers, validate_runtime_helpers};
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

pub fn transform(
    source: String,
    filename: String,
    options: NativePreflightOptions,
) -> Result<NativePreflightResult> {
    if options.react_compiler == Some(true) && !cfg!(feature = "react_compiler") {
        return Ok(unsupported("react-compiler-not-built", [] as [String; 0]));
    }
    let transform_options = compile_options(&options)?;
    let allocator = Allocator::default();
    let source_type = source_type(&filename, &source)?;
    let parsed = Parser::new(&allocator, &source, source_type).parse();
    if !parsed.diagnostics.is_empty() {
        return Ok(unsupported("parse-error", parsed.diagnostics));
    }
    let mut program = parsed.program;
    let mut decorator_detector = DecoratorDetector(false);
    decorator_detector.visit_program(&program);
    if decorator_detector.0 {
        return Ok(unsupported("decorators-not-supported", [] as [String; 0]));
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
    if options.private_methods == Some(true) || options.private_property_in_object == Some(true) {
        let mut detector = ClassFeaturesUnsupportedDetector(false);
        detector.visit_program(&program);
        if detector.0 {
            return Ok(unsupported(
                "class-features-semantic-mismatch",
                [] as [String; 0],
            ));
        }
    }
    if options.block_scoping == Some(true) {
        let mut detector = BlockScopingDetector::default();
        detector.visit_program(&program);
        if detector.block_scoping {
            return Ok(unsupported(
                "block-scoping-not-implemented",
                [] as [String; 0],
            ));
        }
    }
    if options.classes == Some(true) {
        let mut detector = ClassesDetector(false);
        detector.visit_program(&program);
        if detector.0 {
            return Ok(unsupported("classes-not-implemented", [] as [String; 0]));
        }
    }
    if options.destructuring == Some(true) {
        let mut detector = DestructuringDetector(false);
        detector.visit_program(&program);
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
        if detector.0 {
            return Ok(unsupported("parameters-not-implemented", [] as [String; 0]));
        }
    }
    if options.for_of == Some(true) {
        let mut detector = ForOfDetector(false);
        detector.visit_program(&program);
        if detector.0 {
            return Ok(unsupported("for-of-not-implemented", [] as [String; 0]));
        }
    }
    let semantic = SemanticBuilder::new()
        .with_excess_capacity(2.0)
        .with_enum_eval(true)
        .build(&program);
    if !semantic.diagnostics.is_empty() {
        return Ok(unsupported("semantic-error", semantic.diagnostics));
    }
    let transformed = Transformer::new(&allocator, Path::new(&filename), &transform_options)
        .build_with_scoping(semantic.semantic.into_scoping(), &mut program);
    if !transformed.diagnostics.is_empty() {
        return Ok(unsupported("transform-error", transformed.diagnostics));
    }
    #[expect(deprecated)]
    let helper_requests: Vec<_> = transformed.helpers_used.into_iter().collect();
    let helper_mode = options.helpers_mode.as_deref().unwrap_or("runtime");
    let helper_module = options
        .helpers_module_name
        .as_deref()
        .unwrap_or("@babel/runtime");
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
    helpers_used.sort_unstable();
    let inline_prefix = inline.map(|inline| {
        let binding = allocator.alloc_str(&inline.binding);
        InlineHelperRenamer { binding }.visit_program(&mut program);
        format!("var {binding}={};\n", inline.prefix)
    });

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
    let layer = pack_decoded_layer(&words, &names, line_count);
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
    })
}

fn compile_options(options: &NativePreflightOptions) -> Result<TransformOptions> {
    let mut compiled = TransformOptions {
        jsx: JsxOptions::disable(),
        ..TransformOptions::default()
    };
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
        object_rest_spread.loose = options.object_rest_spread_loose.unwrap_or(false);
        object_rest_spread.use_built_ins =
            options.object_rest_spread_use_built_ins.unwrap_or(false);
    }
    let mut class_feature_loose = None;
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
            if class_feature_loose.is_some_and(|selected| selected != loose) {
                return Err(Error::new(
                    Status::InvalidArg,
                    "classProperties, privateMethods, and privatePropertyInObject must use the same loose value",
                ));
            }
            class_feature_loose = Some(loose);
        }
    }
    if let Some(loose) = class_feature_loose {
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
            mode @ ("classic" | "classic-development" | "automatic" | "automatic-development"),
        ) => {
            compiled.jsx = JsxOptions::enable();
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

impl<'a> Visit<'a> for ClassFeaturesUnsupportedDetector {
    fn visit_property_definition(&mut self, property: &PropertyDefinition<'a>) {
        // Enabling Oxc's combined class-properties pass is necessary for private
        // syntax but also lowers public fields that some consumer recipes preserve.
        // Oxc 0.141 additionally mixes spec private-method initialization with loose
        // access and lowers private-in through WeakMap `.has`, which is invalid for
        // its loose string keys. Keep those cases on the explicit fallback.
        self.0 = true;
        walk::walk_property_definition(self, property);
    }

    fn visit_method_definition(&mut self, method: &MethodDefinition<'a>) {
        if matches!(method.key, PropertyKey::PrivateIdentifier(_)) {
            self.0 = true;
        }
        walk::walk_method_definition(self, method);
    }
}

#[derive(Default)]
struct BlockScopingDetector {
    block_scoping: bool,
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

impl<'a> Visit<'a> for BlockScopingDetector {
    fn visit_variable_declaration(&mut self, declaration: &VariableDeclaration<'a>) {
        if matches!(
            declaration.kind,
            VariableDeclarationKind::Let | VariableDeclarationKind::Const
        ) {
            self.block_scoping = true;
        }
        walk::walk_variable_declaration(self, declaration);
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        edit::{EditCommand, EditKind, MappingPolicy, build},
        sourcemap::{compose, compose_layer_chain, render, render_decoded},
    };

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
