use oxc_ast::{
    AstKind,
    ast::{BindingPattern, ObjectPattern, PropertyKey, VariableDeclarator},
};
use oxc_semantic::Semantic;
use oxc_span::{GetSpan, Span};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::edit::{EditCommand, EditKind, MappingPolicy};

const ITER_HELPER: &str = r#"function _noxIter(value,count,all){if(Array.isArray(value))return all?value.slice():value;var method=value!=null&&(typeof Symbol!="undefined"&&value[Symbol.iterator]||value["@@iterator"]);if(method==null)throw new TypeError("Invalid attempt to destructure non-iterable instance.");var iterator=method.call(value),result=[],step,error;try{while((all||result.length<count)&&!(step=iterator.next()).done)result.push(step.value)}catch(e){error=e}finally{try{if(step&&!step.done&&iterator.return!=null)iterator.return()}finally{if(error)throw error}}return result}"#;
const OBJECT_HELPER: &str = r#"function _noxObj(value){if(value==null)throw new TypeError("Cannot destructure "+value);return value}"#;
const REST_HELPER: &str = r#"function _noxRest(source,excluded){source=_noxObj(source);var target={};for(var key in source)if(Object.prototype.hasOwnProperty.call(source,key)&&excluded.indexOf(key)<0)target[key]=source[key];if(Object.getOwnPropertySymbols)for(var symbols=Object.getOwnPropertySymbols(source),i=0;i<symbols.length;i++){key=symbols[i];if(excluded.indexOf(key)<0&&Object.prototype.propertyIsEnumerable.call(source,key))target[key]=source[key]}return target}"#;
const LOOSE_REST_HELPER: &str = r#"function _noxRest(source,excluded){source=_noxObj(source);var target={};for(var key in source)if(Object.prototype.hasOwnProperty.call(source,key)&&excluded.indexOf(key)<0)target[key]=source[key];return target}"#;

pub(super) fn edits(
    source: &str,
    semantic: &Semantic<'_>,
    object_rest_loose: bool,
    only_object_rest: bool,
) -> Result<Option<Vec<EditCommand>>, &'static str> {
    let mut reserved: FxHashSet<String> = semantic
        .scoping()
        .symbol_names()
        .map(str::to_owned)
        .collect();
    let mut edits = Vec::new();
    let mut temporary_declarations: FxHashMap<u32, Vec<String>> = FxHashMap::default();
    let mut used_helpers = false;
    for (node_id, node) in semantic.nodes().iter_enumerated() {
        match node.kind() {
            AstKind::VariableDeclarator(declarator)
                if !declarator.id.is_binding_identifier()
                    && (!only_object_rest || binding_has_object_rest(&declarator.id)) =>
            {
                lower_declarator(
                    source,
                    declarator,
                    &mut reserved,
                    &mut edits,
                    &mut used_helpers,
                )?;
            }
            AstKind::CatchClause(clause)
                if clause.param.as_ref().is_some_and(|param| {
                    !param.pattern.is_binding_identifier()
                        && (!only_object_rest || binding_has_object_rest(&param.pattern))
                }) =>
            {
                let param = clause.param.as_ref().unwrap();
                let caught = reserve("_caught", &mut reserved);
                let mut declarations = Vec::new();
                emit_binding(
                    source,
                    &param.pattern,
                    caught.clone(),
                    &mut declarations,
                    &mut reserved,
                    &mut used_helpers,
                )?;
                edits.push(replace(param.pattern.span(), caught));
                edits.push(insert(
                    clause.body.span.start + 1,
                    format!("let {};", declarations.join(",")),
                ));
            }
            AstKind::AssignmentExpression(assignment)
                if assignment.left.is_assignment_target_pattern()
                    && (!only_object_rest || assignment_has_object_rest(&assignment.left)) =>
            {
                let before = reserved.clone();
                let root = reserve("_ref", &mut reserved);
                let mut assignments =
                    vec![format!("{root}={}", slice(source, assignment.right.span()))];
                emit_assignment(
                    source,
                    &assignment.left,
                    root.clone(),
                    &mut assignments,
                    &mut reserved,
                    &mut used_helpers,
                )?;
                assignments.push(root);
                edits.push(replace(
                    assignment.span,
                    format!("({})", assignments.join(",")),
                ));
                let insertion = semantic
                    .nodes()
                    .ancestor_ids(node_id)
                    .find_map(|ancestor| match semantic.nodes().kind(ancestor) {
                        AstKind::FunctionBody(body) => Some(
                            body.directives
                                .last()
                                .map_or(body.span.start + 1, |directive| directive.span.end),
                        ),
                        AstKind::Program(program) => Some(
                            program
                                .directives
                                .last()
                                .map_or(program.span.start, |directive| directive.span.end),
                        ),
                        _ => None,
                    })
                    .unwrap_or(0);
                temporary_declarations.entry(insertion).or_default().extend(
                    reserved
                        .iter()
                        .filter(|name| !before.contains(*name))
                        .cloned(),
                );
            }
            _ => {}
        }
    }
    if edits.is_empty() {
        return Ok(None);
    }
    for (position, names) in temporary_declarations {
        edits.push(insert(position, format!("var {};", names.join(","))));
    }
    if used_helpers {
        let helper_position = semantic
            .nodes()
            .iter()
            .find_map(|node| match node.kind() {
                AstKind::Program(program) => Some(
                    program
                        .directives
                        .last()
                        .map_or(program.span.start, |directive| directive.span.end),
                ),
                _ => None,
            })
            .unwrap_or(0);
        let generated = edits
            .iter()
            .filter_map(|edit| edit.content.as_deref())
            .collect::<String>();
        let mut helpers = String::new();
        if generated.contains("_noxIter(") {
            helpers.push_str(ITER_HELPER);
        }
        if generated.contains("_noxObj(") {
            helpers.push_str(OBJECT_HELPER);
        }
        if generated.contains("_noxRest(") {
            helpers.push_str(if object_rest_loose {
                LOOSE_REST_HELPER
            } else {
                REST_HELPER
            });
        }
        edits.push(insert(helper_position, helpers));
    }
    Ok(Some(edits))
}

fn binding_has_object_rest(pattern: &BindingPattern<'_>) -> bool {
    match pattern {
        BindingPattern::ObjectPattern(pattern) => {
            pattern.rest.is_some()
                || pattern
                    .properties
                    .iter()
                    .any(|property| binding_has_object_rest(&property.value))
        }
        BindingPattern::ArrayPattern(pattern) => {
            pattern
                .elements
                .iter()
                .flatten()
                .any(binding_has_object_rest)
                || pattern
                    .rest
                    .as_ref()
                    .is_some_and(|rest| binding_has_object_rest(&rest.argument))
        }
        BindingPattern::AssignmentPattern(pattern) => binding_has_object_rest(&pattern.left),
        BindingPattern::BindingIdentifier(_) => false,
    }
}

fn assignment_has_object_rest(target: &oxc_ast::ast::AssignmentTarget<'_>) -> bool {
    use oxc_ast::ast::{AssignmentTarget, AssignmentTargetProperty};
    match target {
        AssignmentTarget::ObjectAssignmentTarget(pattern) => {
            pattern.rest.is_some()
                || pattern.properties.iter().any(|property| match property {
                    AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(_) => false,
                    AssignmentTargetProperty::AssignmentTargetPropertyProperty(property) => {
                        assignment_maybe_has_object_rest(&property.binding)
                    }
                })
        }
        AssignmentTarget::ArrayAssignmentTarget(pattern) => {
            pattern
                .elements
                .iter()
                .flatten()
                .any(assignment_maybe_has_object_rest)
                || pattern
                    .rest
                    .as_ref()
                    .is_some_and(|rest| assignment_has_object_rest(&rest.target))
        }
        _ => false,
    }
}

fn assignment_maybe_has_object_rest(
    target: &oxc_ast::ast::AssignmentTargetMaybeDefault<'_>,
) -> bool {
    use oxc_ast::ast::AssignmentTargetMaybeDefault;
    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(default) => {
            assignment_has_object_rest(&default.binding)
        }
        _ => assignment_has_object_rest(target.to_assignment_target()),
    }
}

fn emit_assignment(
    source: &str,
    target: &oxc_ast::ast::AssignmentTarget<'_>,
    value: String,
    out: &mut Vec<String>,
    reserved: &mut FxHashSet<String>,
    used_helpers: &mut bool,
) -> Result<(), &'static str> {
    use oxc_ast::ast::AssignmentTarget;
    match target {
        AssignmentTarget::ArrayAssignmentTarget(pattern) => {
            *used_helpers = true;
            let array = reserve("_arr", reserved);
            out.push(format!(
                "{array}=_noxIter({value},{},{})",
                pattern.elements.len(),
                pattern.rest.is_some()
            ));
            for (index, element) in pattern.elements.iter().enumerate() {
                if let Some(element) = element {
                    emit_assignment_maybe(
                        source,
                        element,
                        format!("{array}[{index}]"),
                        out,
                        reserved,
                        used_helpers,
                    )?;
                }
            }
            if let Some(rest) = &pattern.rest {
                emit_assignment(
                    source,
                    &rest.target,
                    format!("{array}.slice({})", pattern.elements.len()),
                    out,
                    reserved,
                    used_helpers,
                )?;
            }
        }
        AssignmentTarget::ObjectAssignmentTarget(pattern) => {
            use oxc_ast::ast::AssignmentTargetProperty;
            *used_helpers = true;
            let object = reserve("_obj", reserved);
            out.push(format!("{object}=_noxObj({value})"));
            let mut excluded = Vec::new();
            for property in &pattern.properties {
                match property {
                    AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(property) => {
                        let name = property.binding.name.as_str();
                        excluded.push(format!("{name:?}"));
                        let access = format!("{object}.{name}");
                        if let Some(init) = &property.init {
                            let temp = reserve("_value", reserved);
                            out.push(format!("{temp}={access}"));
                            out.push(format!(
                                "{name}={temp}===void 0?{}:{temp}",
                                slice(source, init.span())
                            ));
                        } else {
                            out.push(format!("{name}={access}"));
                        }
                    }
                    AssignmentTargetProperty::AssignmentTargetPropertyProperty(property) => {
                        let (access, exclusion) = if property.computed {
                            let key = reserve("_key", reserved);
                            out.push(format!("{key}={}", slice(source, property.name.span())));
                            (format!("{object}[{key}]"), key)
                        } else {
                            static_access(source, &object, &property.name)
                        };
                        excluded.push(exclusion);
                        emit_assignment_maybe(
                            source,
                            &property.binding,
                            access,
                            out,
                            reserved,
                            used_helpers,
                        )?;
                    }
                }
            }
            if let Some(rest) = &pattern.rest {
                emit_assignment(
                    source,
                    &rest.target,
                    format!("_noxRest({object},[{}])", excluded.join(",")),
                    out,
                    reserved,
                    used_helpers,
                )?;
            }
        }
        _ => out.push(format!("{}={value}", slice(source, target.span()))),
    }
    Ok(())
}

fn emit_assignment_maybe(
    source: &str,
    target: &oxc_ast::ast::AssignmentTargetMaybeDefault<'_>,
    value: String,
    out: &mut Vec<String>,
    reserved: &mut FxHashSet<String>,
    used_helpers: &mut bool,
) -> Result<(), &'static str> {
    use oxc_ast::ast::AssignmentTargetMaybeDefault;
    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(default) => {
            let temp = reserve("_value", reserved);
            out.push(format!("{temp}={value}"));
            emit_assignment(
                source,
                &default.binding,
                format!(
                    "{temp}===void 0?{}:{temp}",
                    slice(source, default.init.span())
                ),
                out,
                reserved,
                used_helpers,
            )
        }
        _ => emit_assignment(
            source,
            target.to_assignment_target(),
            value,
            out,
            reserved,
            used_helpers,
        ),
    }
}

fn lower_declarator(
    source: &str,
    declarator: &VariableDeclarator<'_>,
    reserved: &mut FxHashSet<String>,
    edits: &mut Vec<EditCommand>,
    used_helpers: &mut bool,
) -> Result<(), &'static str> {
    let Some(init) = &declarator.init else {
        return Err("destructuring-missing-initializer");
    };
    let root = reserve("_ref", reserved);
    let mut declarations = vec![format!("{root}={}", slice(source, init.span()))];
    emit_binding(
        source,
        &declarator.id,
        root,
        &mut declarations,
        reserved,
        used_helpers,
    )?;
    edits.push(replace(declarator.span, declarations.join(",")));
    Ok(())
}

fn emit_binding(
    source: &str,
    pattern: &BindingPattern<'_>,
    value: String,
    out: &mut Vec<String>,
    reserved: &mut FxHashSet<String>,
    used_helpers: &mut bool,
) -> Result<(), &'static str> {
    match pattern {
        BindingPattern::BindingIdentifier(identifier) => {
            out.push(format!("{}={value}", identifier.name));
        }
        BindingPattern::AssignmentPattern(pattern) => {
            let temp = reserve("_value", reserved);
            out.push(format!("{temp}={value}"));
            emit_binding(
                source,
                &pattern.left,
                format!(
                    "{temp}===void 0?{}:{temp}",
                    slice(source, pattern.right.span())
                ),
                out,
                reserved,
                used_helpers,
            )?;
        }
        BindingPattern::ArrayPattern(pattern) => {
            *used_helpers = true;
            let array = reserve("_arr", reserved);
            let all = pattern.rest.is_some();
            out.push(format!(
                "{array}=_noxIter({value},{},{all})",
                pattern.elements.len()
            ));
            for (index, element) in pattern.elements.iter().enumerate() {
                if let Some(element) = element {
                    emit_binding(
                        source,
                        element,
                        format!("{array}[{index}]"),
                        out,
                        reserved,
                        used_helpers,
                    )?;
                }
            }
            if let Some(rest) = &pattern.rest {
                emit_binding(
                    source,
                    &rest.argument,
                    format!("{array}.slice({})", pattern.elements.len()),
                    out,
                    reserved,
                    used_helpers,
                )?;
            }
        }
        BindingPattern::ObjectPattern(pattern) => {
            emit_object(source, pattern, value, out, reserved, used_helpers)?;
        }
    }
    Ok(())
}

fn emit_object(
    source: &str,
    pattern: &ObjectPattern<'_>,
    value: String,
    out: &mut Vec<String>,
    reserved: &mut FxHashSet<String>,
    used_helpers: &mut bool,
) -> Result<(), &'static str> {
    *used_helpers = true;
    let object = reserve("_obj", reserved);
    out.push(format!("{object}=_noxObj({value})"));
    let mut excluded = Vec::new();
    for property in &pattern.properties {
        let (access, exclusion) = if property.computed {
            let key = reserve("_key", reserved);
            out.push(format!("{key}={}", slice(source, property.key.span())));
            (format!("{object}[{key}]"), key)
        } else {
            static_access(source, &object, &property.key)
        };
        excluded.push(exclusion);
        emit_binding(source, &property.value, access, out, reserved, used_helpers)?;
    }
    if let Some(rest) = &pattern.rest {
        emit_binding(
            source,
            &rest.argument,
            format!("_noxRest({object},[{}])", excluded.join(",")),
            out,
            reserved,
            used_helpers,
        )?;
    }
    Ok(())
}

fn static_access(source: &str, object: &str, key: &PropertyKey<'_>) -> (String, String) {
    match key {
        PropertyKey::StaticIdentifier(identifier) => (
            format!("{object}.{}", identifier.name),
            format!("{:?}", identifier.name.as_str()),
        ),
        _ => {
            let key = slice(source, key.span()).to_owned();
            (format!("{object}[{key}]"), key)
        }
    }
}

fn reserve(base: &str, reserved: &mut FxHashSet<String>) -> String {
    if reserved.insert(base.to_owned()) {
        return base.to_owned();
    }
    for suffix in reserved.len().max(2).. {
        let candidate = format!("{base}{suffix}");
        if reserved.insert(candidate.clone()) {
            return candidate;
        }
    }
    unreachable!()
}

fn slice(source: &str, span: Span) -> &str {
    &source[span.start as usize..span.end as usize]
}

fn replace(span: Span, content: String) -> EditCommand {
    EditCommand {
        kind: EditKind::Replace,
        start: span.start,
        end: span.end,
        content: Some(content),
        parts: Vec::new(),
        destination: None,
        mapping: Some(MappingPolicy::AnchorBoundaries),
        order: None,
        names: None,
    }
}

fn insert(position: u32, content: String) -> EditCommand {
    EditCommand {
        kind: EditKind::AppendRight,
        start: position,
        end: position,
        content: Some(content),
        parts: Vec::new(),
        destination: None,
        mapping: Some(MappingPolicy::AnchorBoundaries),
        order: None,
        names: None,
    }
}
