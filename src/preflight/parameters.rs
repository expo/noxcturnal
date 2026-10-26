use oxc_ast::builder::GetAstBuilder;

use oxc_allocator::{Allocator, Box as ArenaBox, CloneIn, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstKind,
    ast::{
        Argument, ArrowFunctionExpression, BindingIdentifier, BindingPattern, Class, Directive,
        Expression, FormalParameter, FormalParameterKind, FormalParameterRest, FormalParameters,
        Function, FunctionBody, FunctionType, NumberBase, Program, Statement, TSThisParameter,
        TSTypeAnnotation, TSTypeParameterDeclaration, TSTypeParameterInstantiation,
        VariableDeclarationKind,
    },
    builder::AstBuilder,
};
use oxc_ast_visit::{Visit, VisitMut, walk_mut};
#[cfg(test)]
use oxc_parser::Parser;
use oxc_semantic::{NodeId, Semantic};
#[cfg(test)]
use oxc_span::SourceType;
use oxc_span::{GetSpan, Span};
use oxc_syntax::operator::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator, UpdateOperator,
};
use rustc_hash::{FxHashMap, FxHashSet};

pub(super) struct AstPlan {
    functions: FxHashMap<NodeId, AstFunctionPlan>,
    arrows: FxHashMap<NodeId, AstArrowPlan>,
    hoists: FxHashMap<NodeId, Vec<CaptureAliases>>,
}

impl AstPlan {
    pub(super) fn is_empty(&self) -> bool {
        self.functions.is_empty() && self.arrows.is_empty() && self.hoists.is_empty()
    }
}

struct AstFunctionPlan {
    length_placeholders: Vec<String>,
    anchor: Span,
    wrapper: bool,
    wrapper_arguments: Vec<String>,
    captures: CaptureAliases,
    rest_names: Option<RestNames>,
}

struct AstArrowPlan {
    anchor: Span,
    boundary: usize,
    wrapper: bool,
    wrapper_arguments: Vec<String>,
    rest_names: Option<RestNames>,
    captures: CaptureAliases,
    capture_in_place: bool,
    retain_arrow: bool,
}

struct RestNames {
    length: String,
    key: String,
    array: Option<String>,
}

#[derive(Clone, Default)]
struct CaptureAliases {
    this_name: Option<String>,
    deferred_this: bool,
    arguments_name: Option<String>,
    new_target_name: Option<String>,
    this_nodes: FxHashSet<NodeId>,
    arguments_nodes: FxHashSet<NodeId>,
    new_target_nodes: FxHashSet<NodeId>,
}

impl CaptureAliases {
    fn is_empty(&self) -> bool {
        self.this_name.is_none() && self.arguments_name.is_none() && self.new_target_name.is_none()
    }
}

pub(super) fn prepare_ast(source: &str, semantic: &Semantic<'_>) -> Result<AstPlan, &'static str> {
    prepare_selected(source, semantic, false, false)
}

pub(super) fn prepare_object_rest(
    source: &str,
    semantic: &Semantic<'_>,
    object_rest_loose: bool,
) -> Result<AstPlan, &'static str> {
    prepare_selected(source, semantic, true, object_rest_loose)
}

fn prepare_selected(
    source: &str,
    semantic: &Semantic<'_>,
    only_object_rest: bool,
    object_rest_loose: bool,
) -> Result<AstPlan, &'static str> {
    if !semantic.nodes().iter().any(|node| match node.kind() {
        AstKind::Function(function) => {
            function.body.is_some()
                && non_simple(&function.params).is_some()
                && (!only_object_rest || parameters_have_object_rest(&function.params))
        }
        AstKind::ArrowFunctionExpression(arrow) => {
            non_simple(&arrow.params).is_some()
                && (!only_object_rest || parameters_have_object_rest(&arrow.params))
        }
        _ => false,
    }) {
        return Ok(AstPlan {
            functions: FxHashMap::default(),
            arrows: FxHashMap::default(),
            hoists: FxHashMap::default(),
        });
    }
    let scoping = semantic.scoping();
    let mut functions: FxHashMap<NodeId, AstFunctionPlan> = FxHashMap::default();
    let mut arrows: FxHashMap<NodeId, AstArrowPlan> = FxHashMap::default();
    let mut hoists: FxHashMap<NodeId, Vec<CaptureAliases>> = FxHashMap::default();
    let mut reserved: FxHashSet<String> = scoping
        .symbol_names()
        .chain(
            scoping
                .root_unresolved_references()
                .keys()
                .map(|name| name.as_str()),
        )
        .map(str::to_owned)
        .collect();
    let mut planning_nodes = Vec::new();
    let mut needs_lexical_facts = false;
    for (node_id, node) in semantic.nodes().iter_enumerated() {
        match node.kind() {
            AstKind::Function(function)
                if function.body.is_some()
                    && non_simple(&function.params).is_some()
                    && (!only_object_rest || parameters_have_object_rest(&function.params)) =>
            {
                planning_nodes.push(node_id);
                needs_lexical_facts |= function.generator;
            }
            AstKind::ArrowFunctionExpression(arrow)
                if non_simple(&arrow.params).is_some()
                    && (!only_object_rest || parameters_have_object_rest(&arrow.params)) =>
            {
                needs_lexical_facts = true;
            }
            _ => {}
        }
        if needs_lexical_facts {
            break;
        }
    }
    // Only lowered arrows and generator wrappers consume capture facts. Ordinary
    // functions need their parameter/body binding analysis, but no capture walk.
    let (arrow_facts, function_facts, planning_nodes) = if needs_lexical_facts {
        collect_lexical_facts_selected(semantic, only_object_rest)
    } else {
        (FxHashMap::default(), FxHashMap::default(), planning_nodes)
    };
    // Plan functions and arrows in one traversal, sharing one collision set for
    // every generated capture and rest binding.
    for node_id in planning_nodes {
        match semantic.nodes().kind(node_id) {
            AstKind::Function(function) => {
                let Some(body) = &function.body else {
                    continue;
                };
                if !ast_eligible(source, function, body)
                    || (only_object_rest && !parameters_have_object_rest(&function.params))
                {
                    continue;
                }
                let boundary =
                    non_simple(&function.params).expect("eligible function is non-simple");
                let is_accessor = function
                    .scope_id
                    .get()
                    .is_some_and(|scope_id| scoping.scope_flags(scope_id).is_set_accessor());
                let param_bindings = parameter_binding_names(&function.params);
                let (wrapper, wrapper_arguments) =
                    body_scope_wrapper_plan(source, &function.params, body, &param_bindings);
                // Oxc can lower a single flat rest parameter without moving
                // initializers across parameter/body environments. Keep scope
                // collisions, eval, generators, and ordered parameter lists here.
                if only_object_rest
                    && !object_rest_loose
                    && !wrapper
                    && !function.generator
                    && function.params.rest.is_none()
                    && function.params.items.len() == 1
                    && !param_bindings.contains("arguments")
                    && !reserved.contains("eval")
                    && super::destructuring::is_simple_object_rest(
                        &function.params.items[0].pattern,
                    )
                {
                    continue;
                }
                let wrapper = wrapper || function.generator;
                let captures = if wrapper && function.generator {
                    plan_function_capture(&function_facts[&node_id], &mut reserved)
                } else {
                    CaptureAliases::default()
                };
                let rest_names = function.params.rest.as_ref().map(|rest| {
                    let array =
                        (!matches!(&rest.rest.argument, BindingPattern::BindingIdentifier(_)))
                            .then(|| reserve_name("_args", &mut reserved));
                    RestNames {
                        length: reserve_name("_len", &mut reserved),
                        key: reserve_name("_key", &mut reserved),
                        array,
                    }
                });
                // Setters must retain exactly one formal parameter after lowering.
                // Babel chooses the same unavoidable length change for a default or
                // destructured setter parameter instead of patching the descriptor.
                let placeholder_count = if is_accessor { 1 } else { boundary };
                let length_placeholders = (0..placeholder_count)
                    .map(|_| reserve_name("_arg", &mut reserved))
                    .collect();
                functions.insert(
                    node_id,
                    AstFunctionPlan {
                        length_placeholders,
                        anchor: body.span,
                        wrapper,
                        wrapper_arguments,
                        captures,
                        rest_names,
                    },
                );
            }
            AstKind::ArrowFunctionExpression(arrow) => {
                if non_simple(&arrow.params).is_none()
                    || (only_object_rest && !parameters_have_object_rest(&arrow.params))
                {
                    continue;
                }
                let facts = &arrow_facts[&node_id];
                // An arrow containing lexical `super` cannot become an ordinary
                // function. Retain the arrow while moving its parameter work into
                // the body; this also preserves lexical `this` and `new.target`.
                let retain_arrow = facts.has_super;
                let capture = if retain_arrow {
                    ArrowCapturePlan {
                        aliases: CaptureAliases::default(),
                        hoist: None,
                        in_place: false,
                    }
                } else {
                    plan_arrow_capture(facts, &mut reserved)
                };
                let boundary = non_simple(&arrow.params).expect("non-simple arrow");
                let (wrapper, wrapper_arguments) = arrow.body.as_function_body().map_or_else(
                    || (false, Vec::new()),
                    |body| {
                        body_scope_wrapper_plan(
                            source,
                            &arrow.params,
                            body,
                            &parameter_binding_names(&arrow.params),
                        )
                    },
                );
                let rest_names = arrow.params.rest.as_ref().map(|rest| {
                    let array =
                        (!matches!(&rest.rest.argument, BindingPattern::BindingIdentifier(_)))
                            .then(|| reserve_name("_args", &mut reserved));
                    RestNames {
                        length: reserve_name("_len", &mut reserved),
                        key: reserve_name("_key", &mut reserved),
                        array,
                    }
                });
                if let Some(insertion) = capture.hoist {
                    hoists
                        .entry(insertion)
                        .or_default()
                        .push(capture.aliases.clone());
                }
                arrows.insert(
                    node_id,
                    AstArrowPlan {
                        anchor: arrow.span,
                        boundary,
                        wrapper,
                        wrapper_arguments,
                        rest_names,
                        captures: capture.aliases,
                        capture_in_place: capture.in_place,
                        retain_arrow,
                    },
                );
            }
            _ => {}
        }
    }
    Ok(AstPlan {
        functions,
        arrows,
        hoists,
    })
}

pub(super) fn run_ast<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    plan: AstPlan,
) -> Result<bool, &'static str> {
    let mut pass = OrdinaryParameterLowerer {
        allocator,
        functions: plan.functions,
        arrows: plan.arrows,
        hoists: plan.hoists,
        changed: false,
        error: None,
    };
    pass.visit_program(program);
    match pass.error {
        Some(error) => Err(error),
        None => Ok(pass.changed),
    }
}

struct OrdinaryParameterLowerer<'a> {
    allocator: &'a Allocator,
    functions: FxHashMap<NodeId, AstFunctionPlan>,
    arrows: FxHashMap<NodeId, AstArrowPlan>,
    hoists: FxHashMap<NodeId, Vec<CaptureAliases>>,
    changed: bool,
    error: Option<&'static str>,
}

impl<'a> OrdinaryParameterLowerer<'a> {
    fn ast(&self) -> AstBuilder<'a> {
        AstBuilder::new(self.allocator)
    }

    fn id(&self, span: Span, name: &str) -> Expression<'a> {
        oxc_ast::ast::Expression::new_identifier(
            span,
            self.allocator.alloc_str(name),
            self.ast().builder(),
        )
    }

    fn number(&self, span: Span, value: usize) -> Expression<'a> {
        oxc_ast::ast::Expression::new_numeric_literal(
            span,
            value as f64,
            None,
            NumberBase::Decimal,
            self.ast().builder(),
        )
    }

    fn arguments_at(&self, span: Span, index: Expression<'a>) -> Expression<'a> {
        Expression::from(
            oxc_ast::ast::MemberExpression::new_computed_member_expression(
                span,
                self.id(span, "arguments"),
                index,
                false,
                self.ast().builder(),
            ),
        )
    }

    fn arguments_length(&self, span: Span) -> Expression<'a> {
        let ast = self.ast();
        Expression::from(
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                span,
                self.id(span, "arguments"),
                oxc_ast::ast::IdentifierName::new(span, "length", ast.builder()),
                false,
                ast.builder(),
            ),
        )
    }

    fn undefined(&self, span: Span) -> Expression<'a> {
        super::void_zero(&self.ast(), span)
    }

    fn parameter_statement(
        &self,
        parameter: FormalParameter<'a>,
        index: usize,
        anchor: Span,
    ) -> Statement<'a> {
        let ast = self.ast();
        let index_expression = self.number(anchor, index);
        let present = oxc_ast::ast::Expression::new_binary_expression(
            anchor,
            self.arguments_length(anchor),
            BinaryOperator::GreaterThan,
            self.number(anchor, index),
            ast.builder(),
        );
        let argument = self.arguments_at(anchor, index_expression);
        let value = if let Some(initializer) = parameter.initializer.map(ArenaBox::unbox) {
            let defined = oxc_ast::ast::Expression::new_binary_expression(
                anchor,
                argument.clone_in(self.allocator),
                BinaryOperator::StrictInequality,
                self.undefined(anchor),
                ast.builder(),
            );
            let test = oxc_ast::ast::Expression::new_logical_expression(
                anchor,
                present,
                LogicalOperator::And,
                defined,
                ast.builder(),
            );
            oxc_ast::ast::Expression::new_conditional_expression(
                anchor,
                test,
                argument,
                initializer,
                ast.builder(),
            )
        } else {
            oxc_ast::ast::Expression::new_conditional_expression(
                anchor,
                present,
                argument,
                self.undefined(anchor),
                ast.builder(),
            )
        };
        let declarator = oxc_ast::ast::VariableDeclarator::new(
            anchor,
            parameter.pattern,
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(value),
            false,
            ast.builder(),
        );
        let mut declarations = ArenaVec::new_in(&ast);
        declarations.push(declarator);
        Statement::VariableDeclaration(oxc_ast::ast::VariableDeclaration::boxed(
            anchor,
            VariableDeclarationKind::Let,
            declarations,
            false,
            ast.builder(),
        ))
    }

    fn rest_statement(
        &self,
        rest: FormalParameterRest<'a>,
        index: usize,
        names: RestNames,
        anchor: Span,
    ) -> ArenaVec<'a, Statement<'a>> {
        let ast = self.ast();
        let RestNames {
            length: length_name,
            key: key_name,
            array: array_name,
        } = names;
        let rest_pattern = rest.rest.argument;

        let target_name = match (&rest_pattern, array_name.as_ref()) {
            (BindingPattern::BindingIdentifier(identifier), None) => identifier.name.to_string(),
            (_, Some(name)) => name.clone(),
            _ => unreachable!("rest planning reserves a temporary for binding patterns"),
        };
        let length = self.id(anchor, &length_name);
        let key = self.id(anchor, &key_name);
        // Rest arrays are created from the current realm's intrinsic Array,
        // independent of any lexical or global binding named `Array`. An array
        // literal preserves that behavior; `new Array(...)` does not.
        let array = oxc_ast::ast::Expression::new_array_expression(
            anchor,
            ArenaVec::new_in(&ast),
            ast.builder(),
        );
        let mut declarations = ArenaVec::new_in(&ast);
        declarations.push(oxc_ast::ast::VariableDeclarator::new(
            anchor,
            oxc_ast::ast::BindingPattern::new_binding_identifier(
                anchor,
                self.allocator.alloc_str(&length_name),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(self.arguments_length(anchor)),
            false,
            ast.builder(),
        ));
        declarations.push(oxc_ast::ast::VariableDeclarator::new(
            anchor,
            oxc_ast::ast::BindingPattern::new_binding_identifier(
                anchor,
                self.allocator.alloc_str(&target_name),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(array),
            false,
            ast.builder(),
        ));
        declarations.push(oxc_ast::ast::VariableDeclarator::new(
            anchor,
            oxc_ast::ast::BindingPattern::new_binding_identifier(
                anchor,
                self.allocator.alloc_str(&key_name),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(self.number(anchor, index)),
            false,
            ast.builder(),
        ));
        let init = oxc_ast::ast::ForStatementInit::new_variable_declaration(
            anchor,
            VariableDeclarationKind::Var,
            declarations,
            false,
            ast.builder(),
        );
        let test = oxc_ast::ast::Expression::new_binary_expression(
            anchor,
            key.clone_in(self.allocator),
            BinaryOperator::LessThan,
            length,
            ast.builder(),
        );
        let update_target = oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
            anchor,
            self.allocator.alloc_str(&key_name),
            ast.builder(),
        );
        let update = oxc_ast::ast::Expression::new_update_expression(
            anchor,
            UpdateOperator::Increment,
            false,
            update_target,
            ast.builder(),
        );
        let target_object = self.id(anchor, &target_name);
        let target_index = oxc_ast::ast::Expression::new_binary_expression(
            anchor,
            key.clone_in(self.allocator),
            BinaryOperator::Subtraction,
            self.number(anchor, index),
            ast.builder(),
        );
        let target = oxc_ast::ast::MemberExpression::new_computed_member_expression(
            anchor,
            target_object,
            target_index,
            false,
            ast.builder(),
        );
        let value = self.arguments_at(anchor, key);
        let assignment = oxc_ast::ast::Expression::new_assignment_expression(
            anchor,
            AssignmentOperator::Assign,
            target.into(),
            value,
            ast.builder(),
        );
        let body = oxc_ast::ast::Statement::new_block_statement(
            anchor,
            {
                let mut body = ArenaVec::new_in(&ast);
                body.push(oxc_ast::ast::Statement::new_expression_statement(
                    anchor,
                    assignment,
                    ast.builder(),
                ));
                body
            },
            ast.builder(),
        );
        let mut statements = ArenaVec::new_in(&ast);
        statements.push(oxc_ast::ast::Statement::new_for_statement(
            anchor,
            Some(init),
            Some(test),
            Some(update),
            body,
            ast.builder(),
        ));
        if !matches!(&rest_pattern, BindingPattern::BindingIdentifier(_)) {
            let mut declarations = ArenaVec::new_in(&ast);
            declarations.push(oxc_ast::ast::VariableDeclarator::new(
                anchor,
                rest_pattern,
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                Some(self.id(anchor, &target_name)),
                false,
                ast.builder(),
            ));
            statements.push(Statement::VariableDeclaration(
                oxc_ast::ast::VariableDeclaration::boxed(
                    anchor,
                    VariableDeclarationKind::Let,
                    declarations,
                    false,
                    ast.builder(),
                ),
            ));
        }
        statements
    }

    fn parameter_prologue(
        &self,
        parameters: ArenaVec<'a, FormalParameter<'a>>,
        rest: Option<FormalParameterRest<'a>>,
        boundary: usize,
        rest_names: Option<RestNames>,
        anchor: Span,
    ) -> Result<ArenaVec<'a, Statement<'a>>, &'static str> {
        let ast = self.ast();
        let total = boundary + parameters.len();
        let mut statements = ArenaVec::new_in(&ast);
        for (offset, parameter) in parameters.into_iter().enumerate() {
            statements.push(self.parameter_statement(parameter, boundary + offset, anchor));
        }
        if let Some(rest) = rest {
            let names = rest_names.ok_or("parameters-rest-names-missing")?;
            statements.extend(self.rest_statement(rest, total, names, anchor));
        }
        Ok(statements)
    }

    fn lower_arrow_direct(
        &self,
        mut arrow: ArrowFunctionExpression<'a>,
        plan: AstArrowPlan,
    ) -> Result<Expression<'a>, &'static str> {
        let ast = self.ast();
        let mut capture_rewriter = CaptureRewriter {
            allocator: self.allocator,
            aliases: &plan.captures,
        };
        capture_rewriter.visit_formal_parameters(&mut arrow.params);
        capture_rewriter.visit_arrow_function_body(&mut arrow.body);
        let expression_body = arrow.is_expression();
        let mut params = arrow.params.unbox();
        let mut removed = ArenaVec::new_in(&ast);
        removed.extend(params.items.drain(plan.boundary..));
        let rest = params.rest.take().map(ArenaBox::unbox);
        params.kind = FormalParameterKind::FormalParameter;
        let mut prologue =
            self.parameter_prologue(removed, rest, plan.boundary, plan.rest_names, plan.anchor)?;
        let mut body = match arrow.body {
            oxc_ast::ast::ArrowFunctionBody::FunctionBody(body) => body.unbox(),
            body => oxc_ast::ast::FunctionBody::new(
                body.span(),
                [],
                [oxc_ast::ast::Statement::new_expression_statement(
                    body.span(),
                    body.into_expression(),
                    &ast,
                )],
                &ast,
            ),
        };
        if expression_body {
            let Statement::ExpressionStatement(statement) = body.statements.remove(0) else {
                unreachable!()
            };
            let mut expression = statement.unbox().expression;
            super::clear_leading_pure_annotation(&mut expression);
            prologue.push(oxc_ast::ast::Statement::new_return_statement(
                plan.anchor,
                Some(expression),
                ast.builder(),
            ));
            body.statements = prologue;
        } else if plan.wrapper {
            let directives =
                std::mem::replace(&mut body.directives, ArenaVec::new_in(&self.allocator));
            let statements =
                std::mem::replace(&mut body.statements, ArenaVec::new_in(&self.allocator));
            prologue.push(parse_wrapper_statement(
                self.allocator,
                arrow.r#async,
                false,
                statements,
                directives,
                &plan.wrapper_arguments,
                plan.anchor,
            )?);
            body.statements = prologue;
        } else {
            body.statements.splice(0..0, prologue);
        }
        if plan.retain_arrow {
            params.kind = FormalParameterKind::ArrowFormalParameters;
            return Ok(oxc_ast::ast::Expression::new_arrow_function_expression(
                plan.anchor,
                arrow.r#async,
                arrow.type_parameters,
                oxc_ast::ast::FormalParameters::boxed(
                    params.span,
                    params.kind,
                    params.items,
                    params.rest,
                    ast.builder(),
                ),
                arrow.return_type,
                oxc_ast::ast::ArrowFunctionBody::FunctionBody(oxc_ast::ast::FunctionBody::boxed(
                    body.span,
                    body.directives,
                    body.statements,
                    ast.builder(),
                )),
                ast.builder(),
            ));
        }
        let function = oxc_ast::ast::Expression::new_function_expression(
            plan.anchor,
            FunctionType::FunctionExpression,
            None,
            false,
            arrow.r#async,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            None::<ArenaBox<'a, TSThisParameter<'a>>>,
            oxc_ast::ast::FormalParameters::boxed(
                params.span,
                params.kind,
                params.items,
                params.rest,
                ast.builder(),
            ),
            arrow.return_type,
            Some(oxc_ast::ast::FunctionBody::boxed(
                body.span,
                body.directives,
                body.statements,
                ast.builder(),
            )),
            ast.builder(),
        );
        if !plan.capture_in_place {
            return Ok(function);
        }
        let declaration = self.capture_declaration(&plan.captures, plan.anchor)?;
        let mut statements = ArenaVec::new_in(&ast);
        statements.push(declaration);
        statements.push(oxc_ast::ast::Statement::new_return_statement(
            plan.anchor,
            Some(function),
            ast.builder(),
        ));
        let body = oxc_ast::ast::FunctionBody::boxed(
            plan.anchor,
            ArenaVec::new_in(&ast),
            statements,
            ast.builder(),
        );
        let params = oxc_ast::ast::FormalParameters::boxed(
            plan.anchor,
            FormalParameterKind::ArrowFormalParameters,
            ArenaVec::new_in(&ast),
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ast.builder(),
        );
        let wrapper = oxc_ast::ast::Expression::new_arrow_function_expression(
            plan.anchor,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            params,
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            oxc_ast::ast::ArrowFunctionBody::FunctionBody(body),
            ast.builder(),
        );
        Ok(oxc_ast::ast::Expression::new_call_expression(
            plan.anchor,
            wrapper,
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            ArenaVec::new_in(&ast),
            false,
            ast.builder(),
        ))
    }

    fn capture_declaration(
        &self,
        aliases: &CaptureAliases,
        anchor: Span,
    ) -> Result<Statement<'a>, &'static str> {
        let ast = self.ast();
        let mut declarations = ArenaVec::new_in(&ast);
        if let Some(name) = &aliases.this_name {
            declarations.push(oxc_ast::ast::VariableDeclarator::new(
                anchor,
                oxc_ast::ast::BindingPattern::new_binding_identifier(
                    anchor,
                    self.allocator.alloc_str(name),
                    ast.builder(),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                Some(if aliases.deferred_this {
                    oxc_ast::ast::Expression::new_arrow_function_expression(
                        anchor,
                        false,
                        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
                        oxc_ast::ast::FormalParameters::boxed(
                            anchor,
                            FormalParameterKind::ArrowFormalParameters,
                            ArenaVec::new_in(&ast),
                            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
                            ast.builder(),
                        ),
                        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                        {
                            let mut body = oxc_ast::ast::FunctionBody::boxed(
                                anchor,
                                ArenaVec::new_in(&ast),
                                oxc_allocator::Vec::from_array_in(
                                    [oxc_ast::ast::Statement::new_expression_statement(
                                        anchor,
                                        oxc_ast::ast::Expression::new_this_expression(
                                            anchor,
                                            ast.builder(),
                                        ),
                                        ast.builder(),
                                    )],
                                    ast.builder(),
                                ),
                                ast.builder(),
                            )
                            .unbox();
                            let Statement::ExpressionStatement(statement) =
                                body.statements.remove(0)
                            else {
                                unreachable!("generated concise arrow has one expression")
                            };
                            oxc_ast::ast::ArrowFunctionBody::from(statement.unbox().expression)
                        },
                        ast.builder(),
                    )
                } else {
                    oxc_ast::ast::Expression::new_this_expression(anchor, ast.builder())
                }),
                false,
                ast.builder(),
            ));
        }
        if let Some(name) = &aliases.arguments_name {
            let argument = self.id(anchor, "arguments");
            let test = oxc_ast::ast::Expression::new_binary_expression(
                anchor,
                oxc_ast::ast::Expression::new_unary_expression(
                    anchor,
                    UnaryOperator::Typeof,
                    argument.clone_in(self.allocator),
                    ast.builder(),
                ),
                BinaryOperator::StrictEquality,
                oxc_ast::ast::Expression::new_string_literal(
                    anchor,
                    "undefined",
                    None,
                    ast.builder(),
                ),
                ast.builder(),
            );
            let value = oxc_ast::ast::Expression::new_conditional_expression(
                anchor,
                test,
                self.undefined(anchor),
                argument,
                ast.builder(),
            );
            declarations.push(oxc_ast::ast::VariableDeclarator::new(
                anchor,
                oxc_ast::ast::BindingPattern::new_binding_identifier(
                    anchor,
                    self.allocator.alloc_str(name),
                    ast.builder(),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                Some(value),
                false,
                ast.builder(),
            ));
        }
        if let Some(name) = &aliases.new_target_name {
            declarations.push(oxc_ast::ast::VariableDeclarator::new(
                anchor,
                oxc_ast::ast::BindingPattern::new_binding_identifier(
                    anchor,
                    self.allocator.alloc_str(name),
                    ast.builder(),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                Some(oxc_ast::ast::Expression::new_new_target(
                    anchor,
                    ast.builder(),
                )),
                false,
                ast.builder(),
            ));
        }
        if declarations.is_empty() {
            return Err("parameters-empty-capture-declaration");
        }
        Ok(Statement::VariableDeclaration(
            oxc_ast::ast::VariableDeclaration::boxed(
                anchor,
                VariableDeclarationKind::Var,
                declarations,
                false,
                ast.builder(),
            ),
        ))
    }
}

struct CaptureRewriter<'a, 'p> {
    allocator: &'a Allocator,
    aliases: &'p CaptureAliases,
}

impl<'a> VisitMut<'a> for CaptureRewriter<'a, '_> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let span = expression.span();
        let key = expression.node_id();
        let name = match expression {
            Expression::ThisExpression(_) if self.aliases.this_nodes.contains(&key) => {
                self.aliases.this_name.as_deref()
            }
            Expression::Identifier(identifier)
                if identifier.name == "arguments"
                    && self.aliases.arguments_nodes.contains(&key) =>
            {
                self.aliases.arguments_name.as_deref()
            }
            Expression::NewTarget(_) if self.aliases.new_target_nodes.contains(&key) => {
                self.aliases.new_target_name.as_deref()
            }
            _ => None,
        };
        if let Some(name) = name {
            {
                let ast = AstBuilder::new(self.allocator);
                let reference = oxc_ast::ast::Expression::new_identifier(
                    span,
                    self.allocator.alloc_str(name),
                    ast.builder(),
                );
                *expression =
                    if self.aliases.deferred_this && self.aliases.this_nodes.contains(&key) {
                        oxc_ast::ast::Expression::new_call_expression(
                            span,
                            reference,
                            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                            ArenaVec::new_in(&ast),
                            false,
                            ast.builder(),
                        )
                    } else {
                        reference
                    };
            }
            return;
        }
        walk_mut::walk_expression(self, expression);
    }
}

impl<'a> VisitMut<'a> for OrdinaryParameterLowerer<'a> {
    fn visit_statements(&mut self, statements: &mut ArenaVec<'a, Statement<'a>>) {
        let mut index = 0;
        while index < statements.len() {
            let node_id = statements[index].node_id();
            if let Some(declarations) = self.hoists.remove(&node_id) {
                let anchor = statements[index].span();
                let ast = self.ast();
                let mut hoisted = ArenaVec::new_in(&ast);
                for aliases in declarations {
                    match self.capture_declaration(&aliases, anchor) {
                        Ok(declaration) => hoisted.push(declaration),
                        Err(error) => {
                            self.error = Some(error);
                            return;
                        }
                    }
                }
                let count = hoisted.len();
                statements.splice(index..index, hoisted);
                index += count;
            }
            self.visit_statement(&mut statements[index]);
            index += 1;
        }
    }

    fn visit_expression(&mut self, expression: &mut oxc_ast::ast::Expression<'a>) {
        if let oxc_ast::ast::Expression::ArrowFunctionExpression(arrow) = expression
            && non_simple(&arrow.params).is_some()
            && let Some(plan) = self.arrows.remove(&arrow.node_id.get())
        {
            let ast = self.ast();
            let old = expression.take_in(&ast);
            let oxc_ast::ast::Expression::ArrowFunctionExpression(arrow) = old else {
                unreachable!();
            };
            let replacement = self.lower_arrow_direct(arrow.unbox(), plan);
            match replacement {
                Ok(replacement) => {
                    *expression = replacement;
                    self.changed = true;
                    walk_mut::walk_expression(self, expression);
                }
                Err(error) => self.error = Some(error),
            }
            return;
        }
        walk_mut::walk_expression(self, expression);
    }

    fn visit_function(
        &mut self,
        function: &mut Function<'a>,
        flags: oxc_syntax::scope::ScopeFlags,
    ) {
        if non_simple(&function.params).is_some()
            && let Some(plan) = self.functions.remove(&function.node_id.get())
        {
            let Some(body) = &mut function.body else {
                self.error = Some("parameters-body-missing");
                return;
            };
            let mut parameters = ArenaVec::new_in(&self.allocator);
            parameters.extend(function.params.items.drain(..));
            for placeholder in &plan.length_placeholders {
                function
                    .params
                    .items
                    .push(oxc_ast::ast::FormalParameter::new(
                        plan.anchor,
                        ArenaVec::new_in(&self.allocator),
                        oxc_ast::ast::BindingPattern::new_binding_identifier(
                            plan.anchor,
                            self.allocator.alloc_str(placeholder),
                            self.ast().builder(),
                        ),
                        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                        None::<ArenaBox<'a, Expression<'a>>>,
                        false,
                        None,
                        false,
                        false,
                        self.ast().builder(),
                    ));
            }
            let rest = function.params.rest.take().map(ArenaBox::unbox);
            let mut prologue =
                match self.parameter_prologue(parameters, rest, 0, plan.rest_names, plan.anchor) {
                    Ok(statements) => statements,
                    Err(error) => {
                        self.error = Some(error);
                        return;
                    }
                };
            if plan.wrapper {
                if !plan.captures.is_empty() {
                    let mut capture_rewriter = CaptureRewriter {
                        allocator: self.allocator,
                        aliases: &plan.captures,
                    };
                    capture_rewriter.visit_function_body(body);
                    match self.capture_declaration(&plan.captures, plan.anchor) {
                        Ok(declaration) => prologue.insert(0, declaration),
                        Err(error) => {
                            self.error = Some(error);
                            return;
                        }
                    }
                }
                let directives =
                    std::mem::replace(&mut body.directives, ArenaVec::new_in(&self.allocator));
                let original =
                    std::mem::replace(&mut body.statements, ArenaVec::new_in(&self.allocator));
                match parse_wrapper_statement(
                    self.allocator,
                    function.r#async,
                    function.generator,
                    original,
                    directives,
                    &plan.wrapper_arguments,
                    plan.anchor,
                ) {
                    Ok(wrapper) => {
                        prologue.push(wrapper);
                        body.statements = prologue;
                        if function.generator {
                            function.generator = false;
                            function.r#async = false;
                        }
                    }
                    Err(error) => {
                        self.error = Some(error);
                        return;
                    }
                }
            } else {
                body.statements.splice(0..0, prologue);
            }
            self.changed = true;
        }
        walk_mut::walk_function(self, function, flags);
    }
}

fn parse_wrapper_statement<'a>(
    allocator: &'a Allocator,
    r#async: bool,
    generator: bool,
    statements: ArenaVec<'a, Statement<'a>>,
    directives: ArenaVec<'a, Directive<'a>>,
    wrapper_arguments: &[String],
    enclosing: Span,
) -> Result<Statement<'a>, &'static str> {
    let anchor = Span::new(
        enclosing.start,
        enclosing.start.saturating_add(1).min(enclosing.end),
    );
    let ast = AstBuilder::new(allocator);
    let mut items = ArenaVec::new_in(&ast);
    for name in wrapper_arguments {
        items.push(oxc_ast::ast::FormalParameter::new(
            anchor,
            ArenaVec::new_in(&ast),
            oxc_ast::ast::BindingPattern::new_binding_identifier(
                anchor,
                allocator.alloc_str(name),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            None::<ArenaBox<'a, Expression<'a>>>,
            false,
            None,
            false,
            false,
            ast.builder(),
        ));
    }
    let params = oxc_ast::ast::FormalParameters::boxed(
        anchor,
        FormalParameterKind::FormalParameter,
        items,
        None::<ArenaBox<'a, FormalParameterRest<'a>>>,
        ast.builder(),
    );
    let body = oxc_ast::ast::FunctionBody::boxed(anchor, directives, statements, ast.builder());
    let function = if generator {
        oxc_ast::ast::Expression::new_function_expression(
            anchor,
            FunctionType::FunctionExpression,
            None,
            generator,
            r#async,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            None::<ArenaBox<'a, TSThisParameter<'a>>>,
            params,
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(body),
            ast.builder(),
        )
    } else {
        oxc_ast::ast::Expression::new_arrow_function_expression(
            anchor,
            r#async,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            params,
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            oxc_ast::ast::ArrowFunctionBody::FunctionBody(body),
            ast.builder(),
        )
    };
    let call_member = if generator {
        Expression::from(
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                anchor,
                function,
                oxc_ast::ast::IdentifierName::new(anchor, "call", ast.builder()),
                false,
                ast.builder(),
            ),
        )
    } else {
        function
    };
    let mut arguments = ArenaVec::new_in(&ast);
    {
        if generator {
            arguments.push(Argument::from(
                oxc_ast::ast::Expression::new_this_expression(anchor, ast.builder()),
            ));
        }
        for name in wrapper_arguments {
            arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
                anchor,
                allocator.alloc_str(name),
                ast.builder(),
            )));
        }
    }
    let call = oxc_ast::ast::Expression::new_call_expression(
        anchor,
        call_member,
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
        false,
        ast.builder(),
    );
    let result = call;
    Ok(oxc_ast::ast::Statement::new_return_statement(
        anchor,
        Some(result),
        ast.builder(),
    ))
}

fn ast_eligible(source: &str, function: &Function<'_>, _body: &FunctionBody<'_>) -> bool {
    let Some(_) = non_simple(&function.params) else {
        return false;
    };
    let _ = source;
    true
}

#[derive(Default)]
struct ArrowFacts {
    has_super: bool,
    derived_constructor: bool,
    this_nodes: Vec<NodeId>,
    arguments_nodes: Vec<NodeId>,
    new_target_nodes: Vec<NodeId>,
    statement_insertion: Option<NodeId>,
}

#[cfg(test)]
fn collect_lexical_facts(
    semantic: &Semantic<'_>,
) -> (
    FxHashMap<NodeId, ArrowFacts>,
    FxHashMap<NodeId, ArrowFacts>,
    Vec<NodeId>,
) {
    collect_lexical_facts_selected(semantic, false)
}

fn collect_lexical_facts_selected(
    semantic: &Semantic<'_>,
    only_object_rest: bool,
) -> (
    FxHashMap<NodeId, ArrowFacts>,
    FxHashMap<NodeId, ArrowFacts>,
    Vec<NodeId>,
) {
    let mut direct_arrow_facts = FxHashMap::default();
    let mut function_facts = FxHashMap::default();
    let mut planning_nodes = Vec::new();
    let mut active_functions = Vec::<(NodeId, usize)>::new();
    let mut active_arrows = Vec::<NodeId>::new();
    let mut arrow_parents = FxHashMap::<NodeId, Option<NodeId>>::default();
    let mut arrow_order = Vec::new();
    let mut argument_shadows = Vec::<NodeId>::new();
    let mut ancestors = Vec::<NodeId>::new();
    let node_count = semantic.nodes().len();
    let mut statement_insertions = vec![None; node_count];
    let mut class_boundaries = vec![None; node_count];
    let mut derived_contexts = vec![false; node_count];
    for (node_id, node) in semantic.nodes().iter_enumerated() {
        let parent_id = semantic.nodes().parent_id(node_id);
        let parent = semantic.nodes().kind(parent_id);
        // Earlier rewrites can move source-later nodes ahead of source-earlier
        // siblings. Parent IDs, not source offsets, determine when scopes end.
        while ancestors.last().is_some_and(|id| *id != parent_id) {
            let exited = ancestors.pop().unwrap();
            if active_arrows.last() == Some(&exited) {
                active_arrows.pop();
            }
            if active_functions.last().is_some_and(|(id, _)| *id == exited) {
                active_functions.pop();
            }
            if argument_shadows.last() == Some(&exited) {
                argument_shadows.pop();
            }
        }
        ancestors.push(node_id);
        let initializer_boundary = matches!(node.kind(), AstKind::StaticBlock(_))
            || match parent {
                AstKind::PropertyDefinition(property) => property
                    .value
                    .as_ref()
                    .is_some_and(|value| value.node_id() == node_id),
                AstKind::AccessorProperty(property) => property
                    .value
                    .as_ref()
                    .is_some_and(|value| value.node_id() == node_id),
                _ => false,
            };
        let boundary = if initializer_boundary {
            Some(node_id)
        } else {
            class_boundaries[parent_id.index()]
        };
        class_boundaries[node_id.index()] = boundary;
        let derived = if matches!(node.kind(), AstKind::Function(_)) {
            matches!(parent, AstKind::MethodDefinition(method) if method.kind == oxc_ast::ast::MethodDefinitionKind::Constructor)
                && matches!(semantic.nodes().parent_kind(semantic.nodes().parent_id(parent_id)), AstKind::Class(class) if class.heritage.is_some())
        } else if initializer_boundary {
            false
        } else {
            derived_contexts[parent_id.index()]
        };
        derived_contexts[node_id.index()] = derived;
        let statement_insertion = if matches!(node.kind(), AstKind::Program(_)) {
            None
        } else {
            let parent_id = semantic.nodes().parent_id(node_id);
            match semantic.nodes().kind(parent_id) {
                AstKind::ArrowFunctionExpression(arrow) if arrow.is_expression() => None,
                AstKind::FunctionBody(_) => Some(node_id),
                AstKind::Program(_) | AstKind::BlockStatement(_) | AstKind::StaticBlock(_) => {
                    Some(node_id)
                }
                AstKind::SwitchCase(_) => node.kind().is_statement().then_some(node_id),
                AstKind::FormalParameters(_) => None,
                AstKind::PropertyDefinition(_) | AstKind::AccessorProperty(_) => None,
                _ => statement_insertions[parent_id.index()],
            }
        };
        statement_insertions[node_id.index()] = statement_insertion;
        match node.kind() {
            AstKind::Function(function) => {
                if function.body.is_some()
                    && non_simple(&function.params).is_some()
                    && (!only_object_rest || parameters_have_object_rest(&function.params))
                {
                    planning_nodes.push(node_id);
                    function_facts.insert(node_id, ArrowFacts::default());
                }
                active_functions.push((node_id, active_arrows.len()));
                continue;
            }
            AstKind::ArrowFunctionExpression(arrow) => {
                let selected = non_simple(&arrow.params).is_some()
                    && (!only_object_rest || parameters_have_object_rest(&arrow.params));
                if parameter_binding_names(&arrow.params).contains("arguments") {
                    argument_shadows.push(node_id);
                }
                if selected {
                    direct_arrow_facts.insert(
                        node_id,
                        ArrowFacts {
                            statement_insertion,
                            derived_constructor: derived,
                            ..ArrowFacts::default()
                        },
                    );
                    let arrow_base = active_functions
                        .last()
                        .map_or(0, |(_, arrow_base)| *arrow_base);
                    arrow_parents.insert(
                        node_id,
                        (active_arrows.len() > arrow_base).then(|| *active_arrows.last().unwrap()),
                    );
                    arrow_order.push(node_id);
                    planning_nodes.push(node_id);
                    active_arrows.push(node_id);
                }
                continue;
            }
            _ => {}
        }
        let lexical_kind = match node.kind() {
            AstKind::Super(_) => 0,
            AstKind::ThisExpression(_) => 1,
            AstKind::IdentifierReference(identifier) if identifier.name == "arguments" => 2,
            AstKind::NewTarget(_) => 3,
            _ => continue,
        };
        // Class initializer bodies introduce their own receiver/new.target. Computed
        // keys and heritage stay in the enclosing evaluation environment.
        if let Some(arrow_id) = active_arrows.last() {
            if class_boundaries[arrow_id.index()] != boundary {
                continue;
            }
            if lexical_kind == 2
                && let AstKind::IdentifierReference(reference) = node.kind()
                && let Some(symbol) = reference
                    .reference_id
                    .get()
                    .and_then(|id| semantic.scoping().get_reference(id).symbol_id())
                && matches!(semantic.nodes().kind(*arrow_id), AstKind::ArrowFunctionExpression(arrow)
                    if semantic.scoping().scope_ancestors(semantic.scoping().symbol_scope_id(symbol))
                        .any(|scope| Some(scope) == arrow.scope_id.get()))
            {
                continue;
            }
        }
        if lexical_kind == 2 && !argument_shadows.is_empty() {
            continue;
        }
        let arrow_base = active_functions
            .last()
            .map_or(0, |(_, arrow_base)| *arrow_base);
        if active_arrows.len() > arrow_base
            && let Some(arrow_id) = active_arrows.last()
        {
            let arrow_facts = direct_arrow_facts.get_mut(arrow_id).unwrap();
            match lexical_kind {
                0 => arrow_facts.has_super = true,
                1 => arrow_facts.this_nodes.push(node_id),
                2 => arrow_facts.arguments_nodes.push(node_id),
                _ => arrow_facts.new_target_nodes.push(node_id),
            }
        }
        if let Some((function_id, _)) = active_functions.last()
            && class_boundaries[function_id.index()] == boundary
            && let Some(function_facts) = function_facts.get_mut(function_id)
        {
            match lexical_kind {
                2 => function_facts.arguments_nodes.push(node_id),
                3 => function_facts.new_target_nodes.push(node_id),
                _ => {}
            }
        }
    }

    // `super` keeps an arrow lexical. Propagate that requirement outward, then
    // assign every reference list once to the outermost arrow that actually
    // becomes an ordinary function. Nested arrows share that capture.
    for arrow_id in arrow_order.iter().rev() {
        if direct_arrow_facts[arrow_id].has_super
            && let Some(parent) = arrow_parents[arrow_id]
        {
            direct_arrow_facts.get_mut(&parent).unwrap().has_super = true;
        }
    }
    let mut capture_owners = FxHashMap::<NodeId, Option<NodeId>>::default();
    let mut facts = FxHashMap::<NodeId, ArrowFacts>::default();
    for arrow_id in arrow_order.iter().copied() {
        let direct = direct_arrow_facts.remove(&arrow_id).unwrap();
        let owner = if direct.has_super {
            None
        } else {
            arrow_parents[&arrow_id]
                .and_then(|parent| capture_owners[&parent])
                .or(Some(arrow_id))
        };
        capture_owners.insert(arrow_id, owner);
        facts.insert(
            arrow_id,
            ArrowFacts {
                has_super: direct.has_super,
                derived_constructor: direct.derived_constructor,
                statement_insertion: direct.statement_insertion,
                ..ArrowFacts::default()
            },
        );
        if let Some(owner) = owner {
            let aggregate = facts.get_mut(&owner).unwrap();
            aggregate.this_nodes.extend(direct.this_nodes);
            aggregate.arguments_nodes.extend(direct.arguments_nodes);
            aggregate.new_target_nodes.extend(direct.new_target_nodes);
        }
    }
    (facts, function_facts, planning_nodes)
}

fn plan_function_capture(facts: &ArrowFacts, reserved: &mut FxHashSet<String>) -> CaptureAliases {
    let mut aliases = CaptureAliases::default();
    if !facts.arguments_nodes.is_empty() {
        aliases.arguments_name = Some(reserve_name("_arguments", reserved));
        aliases
            .arguments_nodes
            .extend(facts.arguments_nodes.iter().copied());
    }
    if !facts.new_target_nodes.is_empty() {
        aliases.new_target_name = Some(reserve_name("_newtarget", reserved));
        aliases
            .new_target_nodes
            .extend(facts.new_target_nodes.iter().copied());
    }
    aliases
}

struct ArrowCapturePlan {
    aliases: CaptureAliases,
    hoist: Option<NodeId>,
    in_place: bool,
}

fn plan_arrow_capture(facts: &ArrowFacts, reserved: &mut FxHashSet<String>) -> ArrowCapturePlan {
    let mut aliases = CaptureAliases {
        deferred_this: facts.derived_constructor,
        ..CaptureAliases::default()
    };
    if !facts.this_nodes.is_empty() {
        aliases.this_name = Some(reserve_name("_this", reserved));
        aliases.this_nodes.extend(facts.this_nodes.iter().copied());
    }
    if !facts.arguments_nodes.is_empty() {
        aliases.arguments_name = Some(reserve_name("_arguments", reserved));
        aliases
            .arguments_nodes
            .extend(facts.arguments_nodes.iter().copied());
    }
    if !facts.new_target_nodes.is_empty() {
        aliases.new_target_name = Some(reserve_name("_newtarget", reserved));
        aliases
            .new_target_nodes
            .extend(facts.new_target_nodes.iter().copied());
    }
    if aliases.is_empty() {
        return ArrowCapturePlan {
            aliases,
            hoist: None,
            in_place: false,
        };
    }
    match facts.statement_insertion {
        Some(insertion) => ArrowCapturePlan {
            aliases,
            hoist: Some(insertion),
            in_place: false,
        },
        None => ArrowCapturePlan {
            aliases,
            hoist: None,
            in_place: true,
        },
    }
}

fn reserve_name(base: &str, used: &mut FxHashSet<String>) -> String {
    super::reserve_generated_name(base, used)
}

fn non_simple(params: &FormalParameters<'_>) -> Option<usize> {
    params
        .items
        .iter()
        .position(|parameter| {
            parameter.initializer.is_some()
                || !matches!(parameter.pattern, BindingPattern::BindingIdentifier(_))
        })
        .or_else(|| params.rest.as_ref().map(|_| params.items.len()))
}

fn parameter_binding_names(params: &FormalParameters<'_>) -> FxHashSet<String> {
    let mut names = FxHashSet::default();
    let mut collect = |identifier: &BindingIdentifier<'_>| {
        names.insert(identifier.name.to_string());
        true
    };
    for parameter in &params.items {
        parameter.pattern.all_binding_identifiers(&mut collect);
    }
    if let Some(rest) = &params.rest {
        rest.rest.argument.all_binding_identifiers(&mut collect);
    }
    names
}

fn body_scope_wrapper_plan(
    source: &str,
    params: &FormalParameters<'_>,
    body: &FunctionBody<'_>,
    param_bindings: &FxHashSet<String>,
) -> (bool, Vec<String>) {
    let mut body_names: FxHashSet<&str> = FxHashSet::default();
    // Semantic analysis merges `var` and function declarations with a
    // same-named non-simple parameter and retains only the parameter's symbol
    // span. Collect body bindings from the AST as well so those declarations
    // still trigger the separate parameter/body environments required by the
    // specification.
    let mut collector = BodyBindingCollector::default();
    collector.visit_function_body(body);
    body_names.extend(collector.names);
    let mut wrapper_arguments = param_bindings
        .iter()
        .filter(|name| body_names.contains(name.as_str()))
        .cloned()
        .collect::<Vec<_>>();
    wrapper_arguments.sort_unstable();
    let _ = source;
    let mut references = ParameterReferenceCollector::default();
    references.visit_formal_parameters(params);
    let initializer_uses_body_name = references.has_eval
        || references
            .names
            .iter()
            .any(|name| body_names.contains(name));
    (
        !wrapper_arguments.is_empty()
            || initializer_uses_body_name
            || body_names.contains("arguments"),
        wrapper_arguments,
    )
}

#[derive(Default)]
struct ParameterReferenceCollector<'a> {
    names: FxHashSet<&'a str>,
    has_eval: bool,
}
impl<'a> Visit<'a> for ParameterReferenceCollector<'a> {
    fn visit_identifier_reference(&mut self, reference: &oxc_ast::ast::IdentifierReference<'a>) {
        self.names.insert(reference.name.as_str());
        self.has_eval |= reference.name == "eval";
    }
}
fn parameters_have_object_rest(params: &FormalParameters<'_>) -> bool {
    fn has_rest(pattern: &BindingPattern<'_>) -> bool {
        match pattern {
            BindingPattern::ObjectPattern(pattern) => {
                pattern.rest.is_some()
                    || pattern
                        .properties
                        .iter()
                        .any(|property| has_rest(&property.value))
            }
            BindingPattern::ArrayPattern(pattern) => {
                pattern.elements.iter().flatten().any(has_rest)
                    || pattern
                        .rest
                        .as_ref()
                        .is_some_and(|rest| has_rest(&rest.argument))
            }
            BindingPattern::AssignmentPattern(pattern) => has_rest(&pattern.left),
            BindingPattern::BindingIdentifier(_) => false,
        }
    }
    params
        .items
        .iter()
        .any(|parameter| has_rest(&parameter.pattern))
        || params
            .rest
            .as_ref()
            .is_some_and(|rest| has_rest(&rest.rest.argument))
}

#[derive(Default)]
struct BodyBindingCollector<'a> {
    names: FxHashSet<&'a str>,
}

impl<'a> Visit<'a> for BodyBindingCollector<'a> {
    fn visit_binding_identifier(&mut self, identifier: &BindingIdentifier<'a>) {
        self.names.insert(identifier.name.as_str());
    }

    fn visit_function(&mut self, function: &Function<'a>, _flags: oxc_syntax::scope::ScopeFlags) {
        if function.r#type == FunctionType::FunctionDeclaration
            && let Some(identifier) = &function.id
        {
            self.names.insert(identifier.name.as_str());
        }
    }

    fn visit_arrow_function_expression(&mut self, _arrow: &ArrowFunctionExpression<'a>) {}

    fn visit_class(&mut self, class: &Class<'a>) {
        if let Some(identifier) = &class.id {
            self.names.insert(identifier.name.as_str());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_codegen::Codegen;

    #[test]
    fn ordinary_default_parameter_mutates_in_place() {
        let source = "function read(value = 1) { return value; }";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(source, &semantic.semantic).unwrap();
        assert_eq!(plan.functions.len(), 1);
        assert!(run_ast(&allocator, &mut program, plan).unwrap());
        assert_eq!(
            Codegen::new().build(&program).code,
            "function read() {\n\tlet value = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;\n\treturn value;\n}\n"
        );
    }

    #[test]
    fn ordinary_rest_parameter_mutates_in_place() {
        let source = "function collect(head, ...tail) { return [head, tail]; }";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(source, &semantic.semantic).unwrap();
        assert_eq!(plan.functions.len(), 1);
        assert!(run_ast(&allocator, &mut program, plan).unwrap());
        let code = Codegen::new().build(&program).code;
        assert!(code.starts_with("function collect(_arg)"), "{code}");
        assert!(code.contains("let head = arguments.length"), "{code}");
        assert!(code.contains("tail = []"), "{code}");
        assert!(code.contains("tail[_key - 1] = arguments[_key]"), "{code}");
    }

    #[test]
    fn ordinary_parameter_scope_wrapper_mutates_in_place() {
        let source = "let body = 2; function read(value = body) { let body = 1; return value; }";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(source, &semantic.semantic).unwrap();
        assert_eq!(plan.functions.len(), 1);
        assert!(run_ast(&allocator, &mut program, plan).unwrap());
        let code = Codegen::new().build(&program).code;
        assert!(code.contains("let value = arguments.length"));
        assert!(code.contains("return (() =>"));
        assert!(code.contains("})()"));
    }

    #[test]
    fn no_capture_arrow_parameter_mutates_in_place() {
        let source = "const read = (value = 1, ...rest) => value + rest.length;";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(source, &semantic.semantic).unwrap();
        assert_eq!(plan.arrows.len(), 1);
        assert!(run_ast(&allocator, &mut program, plan).unwrap());
        let code = Codegen::new().build(&program).code;
        assert!(code.contains("const read = function()"));
        assert!(code.contains("let value = arguments.length"));
        assert!(code.contains("rest = []"), "{code}");
        assert!(code.contains("return value + rest.length"));
    }

    #[test]
    fn parameter_plans_distinguish_shared_source_anchors() {
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = Span::default();
            }
        }
        let source = "function a(x,y=1){return y;} function b(z=2){return z;} const c=(w,q=3)=>q; const d=(r=4)=>r;";
        let allocator = Allocator::default();
        let mut parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        SharedAnchors.visit_program(&mut parsed.program);
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let plan = prepare_ast(source, &semantic.semantic).unwrap();
        drop(semantic);
        // Moving nodes must not associate them with a sibling's plan.
        parsed.program.body.swap(0, 1);
        parsed.program.body.swap(2, 3);
        assert!(run_ast(&allocator, &mut parsed.program, plan).unwrap());
        let code = Codegen::new().build(&parsed.program).code;
        assert!(code.contains("function b()"), "{code}");
        assert!(!code.contains("function a()"), "{code}");
        for fallback in [" : 1", " : 2", " : 3", " : 4"] {
            assert!(code.contains(fallback), "{code}");
        }
    }

    #[test]
    fn lexical_captures_distinguish_expressions_with_shared_source_anchors() {
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_this_expression(&mut self, expression: &mut oxc_ast::ast::ThisExpression) {
                expression.span = Span::default();
            }
        }

        let source = "function outer(){return (value=1)=>[this.x,function(){return this.x;}];}";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        SharedAnchors.visit_program(&mut program);
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        assert!(semantic.diagnostics.is_empty());
        let plan = prepare_ast(source, &semantic.semantic).unwrap();
        assert!(run_ast(&allocator, &mut program, plan).unwrap());
        let code = Codegen::new().build(&program).code;
        assert_eq!(code.matches("_this.x").count(), 1, "{code}");
        assert!(code.contains("return this.x;"), "{code}");
    }

    #[test]
    fn lexical_arrow_captures_mutate_in_place() {
        let source =
            "function outer(){return (value=1)=>this.x+value+arguments.length+new.target;}";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(source, &semantic.semantic).unwrap();
        assert_eq!(plan.arrows.len(), 1);
        assert_eq!(plan.hoists.len(), 1);
        assert!(run_ast(&allocator, &mut program, plan).unwrap());
        let code = Codegen::new().build(&program).code;
        assert!(code.contains("var _this = this"));
        assert!(code.contains("_arguments = typeof arguments"));
        assert!(code.contains("_newtarget = new.target"));
        assert!(code.contains("function()"));
        assert!(code.contains("_this.x + value + _arguments.length + _newtarget"));
    }

    #[test]
    fn nested_arrows_share_one_lexical_capture() {
        let source = "function outer(){return (a=1)=>(b=2)=>this.x+a+b;}";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(source, &semantic.semantic).unwrap();
        assert_eq!(plan.arrows.len(), 2);
        assert_eq!(plan.hoists.values().map(Vec::len).sum::<usize>(), 1);
        assert!(run_ast(&allocator, &mut program, plan).unwrap());
        let code = Codegen::new().build(&program).code;
        assert_eq!(code.matches(" = this").count(), 1, "{code}");
        assert!(code.contains("_this.x"), "{code}");
    }

    #[test]
    fn lexical_arrow_captures_include_parameter_initializers() {
        let source = "function outer(){return (value=this.x)=>value;}";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(source, &semantic.semantic).unwrap();
        assert_eq!(plan.arrows.len(), 1);
        assert_eq!(plan.hoists.len(), 1);
        assert!(run_ast(&allocator, &mut program, plan).unwrap());
        let code = Codegen::new().build(&program).code;
        assert!(code.contains("var _this = this"));
        assert!(code.contains("_this.x"));
    }

    #[test]
    fn sibling_arrow_facts_preserve_all_arrows() {
        let source = (0..128)
            .map(|index| format!("const a{index} = (value = 1) => this.x + value;"))
            .collect::<String>();
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, &source, SourceType::default()).parse();
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let (facts, _, _) = collect_lexical_facts(&semantic.semantic);
        assert_eq!(facts.len(), 128);
        assert!(facts.values().all(|facts| facts.this_nodes.len() == 1));
    }

    #[test]
    fn wrapper_planning_uses_parameter_references() {
        let wrapper = |source: &str| {
            let allocator = Allocator::default();
            let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
            let semantic = oxc_semantic::SemanticBuilder::new()
                .with_build_nodes(true)
                .build(&parsed.program);
            let plan = prepare_ast(source, &semantic.semantic).unwrap();
            plan.functions.values().next().unwrap().wrapper
        };
        assert!(!wrapper(
            "function read(value = object.body) { let body = 1; return value; }"
        ));
        assert!(!wrapper(
            "function read(value = 'body') { let body = 1; return value; }"
        ));
        assert!(!wrapper(
            "function read(value = /* body */ 1) { let body = 1; return value; }"
        ));
        assert!(wrapper(
            "function read(value = café) { let café = 1; return value; }"
        ));
        assert!(!wrapper(
            "function read(value = somebody) { let body = 1; return value; }"
        ));
        assert!(wrapper(
            "function read(value = $body) { let $body = 1; return value; }"
        ));
    }

    #[test]
    fn nested_arrow_facts_share_the_outer_capture_without_crossing_functions() {
        let collect = |source: &str| {
            let allocator = Allocator::default();
            let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
            let semantic = oxc_semantic::SemanticBuilder::new()
                .with_build_nodes(true)
                .build(&parsed.program);
            let (facts, _, _) = collect_lexical_facts(&semantic.semantic);
            facts
                .values()
                .map(|facts| {
                    (
                        facts.this_nodes.len(),
                        facts.arguments_nodes.len(),
                        facts.new_target_nodes.len(),
                    )
                })
                .collect::<Vec<_>>()
        };
        let mut nested = collect("const read = (a = 1) => (b = 2) => this;");
        nested.sort_unstable();
        assert_eq!(nested, [(0, 0, 0), (1, 0, 0)]);
        assert_eq!(
            collect("const read = (a = 1) => function () { return this; };"),
            [(0, 0, 0)]
        );
        assert_eq!(
            collect("const read = (arguments = 1) => arguments;"),
            [(0, 0, 0)]
        );
        assert_eq!(
            collect("const read = (value = 1) => (arguments) => arguments;"),
            [(0, 0, 0)]
        );
    }

    #[test]
    fn wrapper_collision_handles_many_bindings_and_initializer_names() {
        let initializer = (0..1_024)
            .map(|index| format!("outside{index}"))
            .collect::<Vec<_>>()
            .join("+");
        let bindings = (0..1_024)
            .map(|index| format!("let body{index}={index};"))
            .collect::<String>();
        let source = format!("function read(value={initializer}){{{bindings}return value;}}");
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, &source, SourceType::default()).parse();
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let plan = prepare_ast(&source, &semantic.semantic).unwrap();
        assert_eq!(plan.functions.len(), 1);
    }
}
