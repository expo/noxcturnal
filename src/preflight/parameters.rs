use oxc_allocator::{Allocator, Box as ArenaBox, CloneIn, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstBuilder, AstKind,
    ast::{
        Argument, ArrayExpressionElement, ArrowFunctionExpression, BindingIdentifier,
        BindingPattern, Class, Directive, Expression, FormalParameter, FormalParameterKind,
        FormalParameterRest, FormalParameters, Function, FunctionBody, FunctionType, NumberBase,
        Program, Statement, TSThisParameter, TSTypeAnnotation, TSTypeParameterDeclaration,
        TSTypeParameterInstantiation, VariableDeclarationKind,
    },
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
use oxc_syntax::symbol::SymbolFlags;
use rustc_hash::{FxHashMap, FxHashSet};

struct SymbolFact<'a> {
    span: Span,
    name: &'a str,
    flags: SymbolFlags,
}

pub(super) struct AstPlan {
    functions: FxHashMap<u32, Vec<AstFunctionPlan>>,
    arrows: FxHashMap<u32, Vec<AstArrowPlan>>,
    hoists: FxHashMap<NodeId, Vec<CaptureAliases>>,
}

struct AstFunctionPlan {
    length_placeholders: Vec<String>,
    anchor: Span,
    wrapper: bool,
    wrapper_arguments: Vec<String>,
    captures: CaptureAliases,
    setter: bool,
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
}

struct RestNames {
    length: String,
    key: String,
    array: Option<String>,
}

fn direct_rest_array_names(pattern: &BindingPattern<'_>) -> Option<Vec<Option<String>>> {
    let BindingPattern::ArrayPattern(array) = pattern else {
        return None;
    };
    if array.rest.is_some() {
        return None;
    }
    array
        .elements
        .iter()
        .map(|element| match element {
            None => Some(None),
            Some(BindingPattern::BindingIdentifier(identifier)) => {
                Some(Some(identifier.name.to_string()))
            }
            _ => None,
        })
        .collect()
}

#[derive(Clone, Default)]
struct CaptureAliases {
    this_name: Option<String>,
    arguments_name: Option<String>,
    new_target_name: Option<String>,
    this_spans: FxHashSet<(u32, u32)>,
    arguments_spans: FxHashSet<(u32, u32)>,
    new_target_spans: FxHashSet<(u32, u32)>,
}

impl CaptureAliases {
    fn is_empty(&self) -> bool {
        self.this_name.is_none() && self.arguments_name.is_none() && self.new_target_name.is_none()
    }
}

pub(super) fn prepare_ast(source: &str, semantic: &Semantic<'_>) -> Result<AstPlan, &'static str> {
    let scoping = semantic.scoping();
    let mut symbols = scoping
        .symbol_ids()
        .map(|symbol_id| SymbolFact {
            span: scoping.symbol_span(symbol_id),
            name: scoping.symbol_name(symbol_id),
            flags: scoping.symbol_flags(symbol_id),
        })
        .collect::<Vec<_>>();
    symbols.sort_unstable_by_key(|symbol| symbol.span.start);
    let mut functions: FxHashMap<u32, Vec<AstFunctionPlan>> = FxHashMap::default();
    let mut arrows: FxHashMap<u32, Vec<AstArrowPlan>> = FxHashMap::default();
    let mut hoists: FxHashMap<NodeId, Vec<CaptureAliases>> = FxHashMap::default();
    let mut reserved: FxHashSet<String> = scoping.symbol_names().map(str::to_owned).collect();
    let (arrow_facts, function_facts, planning_nodes) = collect_lexical_facts(semantic, &symbols);
    // Plan functions and arrows in one traversal, sharing one collision set for
    // every generated capture and rest binding.
    for node_id in planning_nodes {
        match semantic.nodes().kind(node_id) {
            AstKind::Function(function) => {
                let Some(body) = &function.body else {
                    continue;
                };
                if !ast_eligible(source, function, body, &symbols) {
                    continue;
                }
                let boundary =
                    non_simple(&function.params).expect("eligible function is non-simple");
                let param_bindings = parameter_binding_names(&symbols, &function.params);
                let (wrapper, wrapper_arguments) = body_scope_wrapper_plan(
                    source,
                    &symbols,
                    &function.params,
                    body,
                    &param_bindings,
                );
                let captures = if wrapper {
                    plan_function_capture(&function_facts[&node_id], &mut reserved)
                } else {
                    CaptureAliases::default()
                };
                let rest_names = function.params.rest.as_ref().map(|rest| {
                    let array =
                        (!matches!(&rest.rest.argument, BindingPattern::BindingIdentifier(_))
                            && direct_rest_array_names(&rest.rest.argument).is_none())
                        .then(|| reserve_name("_args", &mut reserved));
                    RestNames {
                        length: reserve_name("_len", &mut reserved),
                        key: reserve_name("_key", &mut reserved),
                        array,
                    }
                });
                let length_placeholders = (0..boundary)
                    .map(|_| reserve_name("_arg", &mut reserved))
                    .collect();
                functions
                    .entry(function.span.start)
                    .or_default()
                    .push(AstFunctionPlan {
                        length_placeholders,
                        anchor: body.span,
                        wrapper,
                        wrapper_arguments,
                        captures,
                        setter: function.scope_id.get().is_some_and(|scope_id| {
                            scoping.scope_flags(scope_id).is_set_accessor()
                        }),
                        rest_names,
                    });
            }
            AstKind::ArrowFunctionExpression(arrow) => {
                if non_simple(&arrow.params).is_none() {
                    continue;
                }
                let facts = &arrow_facts[&node_id];
                if facts.has_super {
                    return Err("arrow-parameters-lexical-super-not-implemented");
                }
                let capture = plan_arrow_capture(source, semantic, node_id, facts, &mut reserved);
                let boundary = non_simple(&arrow.params).expect("non-simple arrow");
                let (wrapper, wrapper_arguments) = body_scope_wrapper_plan(
                    source,
                    &symbols,
                    &arrow.params,
                    &arrow.body,
                    &parameter_binding_names(&symbols, &arrow.params),
                );
                let rest_names = arrow.params.rest.as_ref().map(|rest| {
                    let array =
                        (!matches!(&rest.rest.argument, BindingPattern::BindingIdentifier(_))
                            && direct_rest_array_names(&rest.rest.argument).is_none())
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
                arrows
                    .entry(arrow.span.start)
                    .or_default()
                    .push(AstArrowPlan {
                        anchor: arrow.span,
                        boundary,
                        wrapper,
                        wrapper_arguments,
                        rest_names,
                        captures: capture.aliases,
                        capture_in_place: capture.in_place,
                    });
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
    functions: FxHashMap<u32, Vec<AstFunctionPlan>>,
    arrows: FxHashMap<u32, Vec<AstArrowPlan>>,
    hoists: FxHashMap<NodeId, Vec<CaptureAliases>>,
    changed: bool,
    error: Option<&'static str>,
}

#[expect(deprecated)]
impl<'a> OrdinaryParameterLowerer<'a> {
    fn ast(&self) -> AstBuilder<'a> {
        AstBuilder::new(self.allocator)
    }

    fn id(&self, span: Span, name: &str) -> Expression<'a> {
        self.ast()
            .expression_identifier(span, self.allocator.alloc_str(name))
    }

    fn number(&self, span: Span, value: usize) -> Expression<'a> {
        self.ast()
            .expression_numeric_literal(span, value as f64, None, NumberBase::Decimal)
    }

    fn arguments_at(&self, span: Span, index: Expression<'a>) -> Expression<'a> {
        Expression::from(self.ast().member_expression_computed(
            span,
            self.id(span, "arguments"),
            index,
            false,
        ))
    }

    fn arguments_length(&self, span: Span) -> Expression<'a> {
        let ast = self.ast();
        Expression::from(ast.member_expression_static(
            span,
            self.id(span, "arguments"),
            ast.identifier_name(span, "length"),
            false,
        ))
    }

    fn undefined(&self, span: Span) -> Expression<'a> {
        self.ast()
            .expression_unary(span, UnaryOperator::Void, self.number(span, 0))
    }

    fn parameter_statement(
        &self,
        parameter: FormalParameter<'a>,
        index: usize,
        anchor: Span,
    ) -> Statement<'a> {
        let ast = self.ast();
        let index_expression = self.number(anchor, index);
        let present = ast.expression_binary(
            anchor,
            self.arguments_length(anchor),
            BinaryOperator::GreaterThan,
            self.number(anchor, index),
        );
        let argument = self.arguments_at(anchor, index_expression);
        let value = if let Some(initializer) = parameter.initializer.map(ArenaBox::unbox) {
            let defined = ast.expression_binary(
                anchor,
                argument.clone_in(self.allocator),
                BinaryOperator::StrictInequality,
                self.undefined(anchor),
            );
            let test = ast.expression_logical(anchor, present, LogicalOperator::And, defined);
            ast.expression_conditional(anchor, test, argument, initializer)
        } else {
            ast.expression_conditional(anchor, present, argument, self.undefined(anchor))
        };
        let declarator = ast.variable_declarator(
            anchor,
            VariableDeclarationKind::Let,
            parameter.pattern,
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(value),
            false,
        );
        let mut declarations = ArenaVec::new_in(&ast);
        declarations.push(declarator);
        Statement::VariableDeclaration(ast.alloc_variable_declaration(
            anchor,
            VariableDeclarationKind::Let,
            declarations,
            false,
        ))
    }

    fn setter_default_statement(
        &self,
        name: &str,
        initializer: Expression<'a>,
        anchor: Span,
    ) -> Statement<'a> {
        let ast = self.ast();
        let test = ast.expression_binary(
            anchor,
            self.id(anchor, name),
            BinaryOperator::StrictEquality,
            self.undefined(anchor),
        );
        let assignment = ast.expression_assignment(
            anchor,
            AssignmentOperator::Assign,
            ast.simple_assignment_target_assignment_target_identifier(
                anchor,
                self.allocator.alloc_str(name),
            )
            .into(),
            initializer,
        );
        ast.statement_if(
            anchor,
            test,
            ast.statement_expression(anchor, assignment),
            None,
        )
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
        let direct_array_names = direct_rest_array_names(&rest_pattern);
        let target_name = match (&rest_pattern, array_name.as_ref()) {
            (BindingPattern::BindingIdentifier(identifier), None) => {
                Some(identifier.name.to_string())
            }
            (_, Some(name)) => Some(name.clone()),
            _ if direct_array_names.is_some() => None,
            _ => unreachable!("rest planning reserves a temporary for binding patterns"),
        };
        let length = self.id(anchor, &length_name);
        let key = self.id(anchor, &key_name);
        // Rest arrays are created from the current realm's intrinsic Array,
        // independent of any lexical or global binding named `Array`. An array
        // literal preserves that behavior; `new Array(...)` does not.
        let array = ast.expression_array(anchor, ArenaVec::new_in(&ast));
        let mut declarations = ArenaVec::new_in(&ast);
        declarations.push(ast.variable_declarator(
            anchor,
            VariableDeclarationKind::Var,
            ast.binding_pattern_binding_identifier(anchor, self.allocator.alloc_str(&length_name)),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(self.arguments_length(anchor)),
            false,
        ));
        declarations.push(ast.variable_declarator(
            anchor,
            VariableDeclarationKind::Var,
            if target_name.is_some() {
                ast.binding_pattern_binding_identifier(
                    anchor,
                    self.allocator.alloc_str(target_name.as_deref().unwrap()),
                )
            } else {
                rest_pattern.clone_in(self.allocator)
            },
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(array),
            false,
        ));
        declarations.push(ast.variable_declarator(
            anchor,
            VariableDeclarationKind::Var,
            ast.binding_pattern_binding_identifier(anchor, self.allocator.alloc_str(&key_name)),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(self.number(anchor, index)),
            false,
        ));
        let init = ast.for_statement_init_variable_declaration(
            anchor,
            VariableDeclarationKind::Var,
            declarations,
            false,
        );
        let test = ast.expression_binary(
            anchor,
            key.clone_in(self.allocator),
            BinaryOperator::LessThan,
            length,
        );
        let update_target = ast.simple_assignment_target_assignment_target_identifier(
            anchor,
            self.allocator.alloc_str(&key_name),
        );
        let update = ast.expression_update(anchor, UpdateOperator::Increment, false, update_target);
        let target_object = if let Some(target_name) = target_name.as_deref() {
            self.id(anchor, target_name)
        } else {
            ast.expression_array(
                anchor,
                ArenaVec::from_iter_in(
                    direct_array_names
                        .as_ref()
                        .expect("direct array names were planned")
                        .iter()
                        .map(|name| {
                            name.as_ref().map_or(
                                ArrayExpressionElement::Elision(ast.alloc_elision(anchor)),
                                |name| {
                                    ArrayExpressionElement::from(
                                        self.id(anchor, self.allocator.alloc_str(name)),
                                    )
                                },
                            )
                        }),
                    &ast,
                ),
            )
        };
        let target_index = ast.expression_binary(
            anchor,
            key.clone_in(self.allocator),
            BinaryOperator::Subtraction,
            self.number(anchor, index),
        );
        let target = ast.member_expression_computed(anchor, target_object, target_index, false);
        let value = self.arguments_at(anchor, key);
        let assignment =
            ast.expression_assignment(anchor, AssignmentOperator::Assign, target.into(), value);
        let body = ast.statement_block(anchor, {
            let mut body = ArenaVec::new_in(&ast);
            body.push(ast.statement_expression(anchor, assignment));
            body
        });
        let mut statements = ArenaVec::new_in(&ast);
        statements.push(ast.statement_for(anchor, Some(init), Some(test), Some(update), body));
        if !matches!(&rest_pattern, BindingPattern::BindingIdentifier(_)) && target_name.is_some() {
            let mut declarations = ArenaVec::new_in(&ast);
            declarations.push(ast.variable_declarator(
                anchor,
                VariableDeclarationKind::Let,
                rest_pattern,
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                Some(self.id(anchor, target_name.as_deref().unwrap())),
                false,
            ));
            statements.push(Statement::VariableDeclaration(
                ast.alloc_variable_declaration(
                    anchor,
                    VariableDeclarationKind::Let,
                    declarations,
                    false,
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
        capture_rewriter.visit_function_body(&mut arrow.body);
        let mut params = arrow.params.unbox();
        let mut removed = ArenaVec::new_in(&ast);
        removed.extend(params.items.drain(plan.boundary..));
        let rest = params.rest.take().map(ArenaBox::unbox);
        params.kind = FormalParameterKind::FormalParameter;
        let mut prologue =
            self.parameter_prologue(removed, rest, plan.boundary, plan.rest_names, plan.anchor)?;
        let mut body = arrow.body.unbox();
        if arrow.expression {
            if body.statements.len() != 1 {
                return Err("parameters-arrow-expression-body-shape-error");
            }
            let statement = body.statements.remove(0);
            let Statement::ExpressionStatement(statement) = statement else {
                return Err("parameters-arrow-expression-body-shape-error");
            };
            let mut expression = statement.unbox().expression;
            clear_leading_pure_annotation(&mut expression);
            prologue.push(ast.statement_return(plan.anchor, Some(expression)));
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
        #[expect(deprecated)]
        let function = ast.expression_function(
            plan.anchor,
            FunctionType::FunctionExpression,
            None,
            false,
            arrow.r#async,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            None::<ArenaBox<'a, TSThisParameter<'a>>>,
            ast.alloc_formal_parameters(params.span, params.kind, params.items, params.rest),
            arrow.return_type,
            Some(ast.alloc_function_body(body.span, body.directives, body.statements)),
        );
        if !plan.capture_in_place {
            return Ok(function);
        }
        let declaration = self.capture_declaration(&plan.captures, plan.anchor)?;
        let mut statements = ArenaVec::new_in(&ast);
        statements.push(declaration);
        statements.push(ast.statement_return(plan.anchor, Some(function)));
        let body = ast.alloc_function_body(plan.anchor, ArenaVec::new_in(&ast), statements);
        let params = ast.alloc_formal_parameters(
            plan.anchor,
            FormalParameterKind::ArrowFormalParameters,
            ArenaVec::new_in(&ast),
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
        );
        let wrapper = ast.expression_arrow_function(
            plan.anchor,
            false,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            params,
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            body,
        );
        Ok(ast.expression_call(
            plan.anchor,
            wrapper,
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            ArenaVec::new_in(&ast),
            false,
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
            declarations.push(ast.variable_declarator(
                anchor,
                VariableDeclarationKind::Var,
                ast.binding_pattern_binding_identifier(anchor, self.allocator.alloc_str(name)),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                Some(ast.expression_this(anchor)),
                false,
            ));
        }
        if let Some(name) = &aliases.arguments_name {
            let argument = self.id(anchor, "arguments");
            let test = ast.expression_binary(
                anchor,
                ast.expression_unary(
                    anchor,
                    UnaryOperator::Typeof,
                    argument.clone_in(self.allocator),
                ),
                BinaryOperator::StrictEquality,
                ast.expression_string_literal(anchor, "undefined", None),
            );
            let value = ast.expression_conditional(anchor, test, self.undefined(anchor), argument);
            declarations.push(ast.variable_declarator(
                anchor,
                VariableDeclarationKind::Var,
                ast.binding_pattern_binding_identifier(anchor, self.allocator.alloc_str(name)),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                Some(value),
                false,
            ));
        }
        if let Some(name) = &aliases.new_target_name {
            declarations.push(ast.variable_declarator(
                anchor,
                VariableDeclarationKind::Var,
                ast.binding_pattern_binding_identifier(anchor, self.allocator.alloc_str(name)),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                Some(ast.expression_new_target(anchor)),
                false,
            ));
        }
        if declarations.is_empty() {
            return Err("parameters-empty-capture-declaration");
        }
        Ok(Statement::VariableDeclaration(
            ast.alloc_variable_declaration(
                anchor,
                VariableDeclarationKind::Var,
                declarations,
                false,
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
        let key = (span.start, span.end);
        let name = match expression {
            Expression::ThisExpression(_) if self.aliases.this_spans.contains(&key) => {
                self.aliases.this_name.as_deref()
            }
            Expression::Identifier(identifier)
                if identifier.name == "arguments"
                    && self.aliases.arguments_spans.contains(&key) =>
            {
                self.aliases.arguments_name.as_deref()
            }
            Expression::NewTarget(_) if self.aliases.new_target_spans.contains(&key) => {
                self.aliases.new_target_name.as_deref()
            }
            _ => None,
        };
        if let Some(name) = name {
            #[expect(deprecated)]
            {
                *expression = AstBuilder::new(self.allocator)
                    .expression_identifier(span, self.allocator.alloc_str(name));
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
            && let Some(plans) = self.arrows.get_mut(&arrow.span.start)
        {
            let plan = plans.remove(0);
            if plans.is_empty() {
                self.arrows.remove(&arrow.span.start);
            }
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

    #[expect(deprecated)]
    fn visit_function(
        &mut self,
        function: &mut Function<'a>,
        flags: oxc_syntax::scope::ScopeFlags,
    ) {
        if non_simple(&function.params).is_some()
            && let Some(plans) = self.functions.get_mut(&function.span.start)
        {
            let plan = plans.remove(0);
            if plans.is_empty() {
                self.functions.remove(&function.span.start);
            }
            let Some(body) = &mut function.body else {
                self.error = Some("parameters-body-missing");
                return;
            };
            // Setters must retain exactly one formal parameter. Moving their
            // default into an `arguments`-based body prologue, as for ordinary
            // functions, leaves `set value()` which is invalid ECMAScript.
            // A setter's sole BindingElement is allowed to carry a default, so
            // preserve the identifier and lower only its initializer.
            if plan.setter {
                let Some(parameter) = function.params.items.first_mut() else {
                    self.error = Some("parameters-setter-parameter-missing");
                    return;
                };
                let BindingPattern::BindingIdentifier(identifier) = &parameter.pattern else {
                    self.error = Some("parameters-setter-pattern-not-implemented");
                    return;
                };
                let name = identifier.name.to_string();
                let Some(initializer) = parameter.initializer.take().map(ArenaBox::unbox) else {
                    self.error = Some("parameters-setter-default-missing");
                    return;
                };
                body.statements.splice(
                    0..0,
                    [self.setter_default_statement(&name, initializer, plan.anchor)],
                );
                self.changed = true;
                walk_mut::walk_function(self, function, flags);
                return;
            }
            let mut parameters = ArenaVec::new_in(&self.allocator);
            parameters.extend(function.params.items.drain(..));
            for placeholder in &plan.length_placeholders {
                function.params.items.push(self.ast().formal_parameter(
                    plan.anchor,
                    ArenaVec::new_in(&self.allocator),
                    self.ast().binding_pattern_binding_identifier(
                        plan.anchor,
                        self.allocator.alloc_str(placeholder),
                    ),
                    None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                    None::<ArenaBox<'a, Expression<'a>>>,
                    false,
                    None,
                    false,
                    false,
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

fn clear_leading_pure_annotation(expression: &mut Expression<'_>) {
    match expression {
        Expression::CallExpression(call) => call.pure = false,
        Expression::NewExpression(new) => new.pure = false,
        Expression::ParenthesizedExpression(parenthesized) => {
            clear_leading_pure_annotation(&mut parenthesized.expression);
        }
        _ => {}
    }
}

#[expect(deprecated)]
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
        items.push(ast.formal_parameter(
            anchor,
            ArenaVec::new_in(&ast),
            ast.binding_pattern_binding_identifier(anchor, allocator.alloc_str(name)),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            None::<ArenaBox<'a, Expression<'a>>>,
            false,
            None,
            false,
            false,
        ));
    }
    let params = ast.alloc_formal_parameters(
        anchor,
        FormalParameterKind::FormalParameter,
        items,
        None::<ArenaBox<'a, FormalParameterRest<'a>>>,
    );
    #[expect(deprecated)]
    let body = ast.alloc_function_body(anchor, directives, statements);
    #[expect(deprecated)]
    let function = ast.expression_function(
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
    );
    #[expect(deprecated)]
    let call_member = Expression::from(ast.member_expression_static(
        anchor,
        function,
        ast.identifier_name(anchor, "call"),
        false,
    ));
    let mut arguments = ArenaVec::new_in(&ast);
    #[expect(deprecated)]
    {
        arguments.push(Argument::from(ast.expression_this(anchor)));
        for name in wrapper_arguments {
            arguments.push(Argument::from(
                ast.expression_identifier(anchor, allocator.alloc_str(name)),
            ));
        }
    }
    #[expect(deprecated)]
    let call = ast.expression_call(
        anchor,
        call_member,
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
        false,
    );
    let result = if generator {
        #[expect(deprecated)]
        {
            ast.expression_yield(anchor, true, Some(call))
        }
    } else {
        call
    };
    #[expect(deprecated)]
    Ok(ast.statement_return(anchor, Some(result)))
}

fn ast_eligible(
    source: &str,
    function: &Function<'_>,
    _body: &FunctionBody<'_>,
    _symbols: &[SymbolFact<'_>],
) -> bool {
    let Some(_) = non_simple(&function.params) else {
        return false;
    };
    let _ = source;
    true
}

#[derive(Default)]
struct ArrowFacts {
    has_super: bool,
    this_spans: Vec<(u32, u32)>,
    arguments_spans: Vec<(u32, u32)>,
    new_target_spans: Vec<(u32, u32)>,
}

enum ActiveOwner {
    Function { id: NodeId, end: u32 },
    Arrow { id: NodeId, end: u32 },
}

impl ActiveOwner {
    fn end(&self) -> u32 {
        match self {
            Self::Function { end, .. } | Self::Arrow { end, .. } => *end,
        }
    }
}

fn collect_lexical_facts(
    semantic: &Semantic<'_>,
    symbols: &[SymbolFact<'_>],
) -> (
    FxHashMap<NodeId, ArrowFacts>,
    FxHashMap<NodeId, ArrowFacts>,
    Vec<NodeId>,
) {
    let mut facts = FxHashMap::default();
    let mut function_facts = FxHashMap::default();
    let mut planning_nodes = Vec::new();
    let mut active = Vec::<ActiveOwner>::new();
    let mut argument_shadow_ends = Vec::<u32>::new();
    for (node_id, node) in semantic.nodes().iter_enumerated() {
        let span = node.kind().span();
        while active.last().is_some_and(|owner| span.start >= owner.end()) {
            active.pop();
        }
        while argument_shadow_ends
            .last()
            .is_some_and(|end| span.start >= *end)
        {
            argument_shadow_ends.pop();
        }
        match node.kind() {
            AstKind::Function(function) => {
                planning_nodes.push(node_id);
                function_facts.insert(node_id, ArrowFacts::default());
                active.push(ActiveOwner::Function {
                    id: node_id,
                    end: function.span.end,
                });
                continue;
            }
            AstKind::ArrowFunctionExpression(arrow) => {
                let selected = non_simple(&arrow.params).is_some();
                if parameter_binding_names(symbols, &arrow.params).contains("arguments") {
                    argument_shadow_ends.push(arrow.span.end);
                }
                if selected {
                    facts.insert(node_id, ArrowFacts::default());
                    planning_nodes.push(node_id);
                    active.push(ActiveOwner::Arrow {
                        id: node_id,
                        end: arrow.span.end,
                    });
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
        if lexical_kind == 2 && !argument_shadow_ends.is_empty() {
            continue;
        }
        for owner in active.iter().rev() {
            match owner {
                ActiveOwner::Arrow { id, .. } => {
                    let arrow_facts = facts.get_mut(id).unwrap();
                    match lexical_kind {
                        0 => arrow_facts.has_super = true,
                        1 => arrow_facts.this_spans.push((span.start, span.end)),
                        2 => arrow_facts.arguments_spans.push((span.start, span.end)),
                        _ => arrow_facts.new_target_spans.push((span.start, span.end)),
                    }
                }
                ActiveOwner::Function { id, .. } => {
                    let function_facts = function_facts.get_mut(id).unwrap();
                    match lexical_kind {
                        2 => function_facts.arguments_spans.push((span.start, span.end)),
                        3 => function_facts.new_target_spans.push((span.start, span.end)),
                        _ => {}
                    }
                    break;
                }
            }
        }
    }
    (facts, function_facts, planning_nodes)
}

fn plan_function_capture(facts: &ArrowFacts, reserved: &mut FxHashSet<String>) -> CaptureAliases {
    let mut aliases = CaptureAliases::default();
    if !facts.arguments_spans.is_empty() {
        aliases.arguments_name = Some(reserve_name("_arguments", reserved));
        aliases
            .arguments_spans
            .extend(facts.arguments_spans.iter().copied());
    }
    if !facts.new_target_spans.is_empty() {
        aliases.new_target_name = Some(reserve_name("_newtarget", reserved));
        aliases
            .new_target_spans
            .extend(facts.new_target_spans.iter().copied());
    }
    aliases
}

struct ArrowCapturePlan {
    aliases: CaptureAliases,
    hoist: Option<NodeId>,
    in_place: bool,
}

fn plan_arrow_capture(
    source: &str,
    semantic: &Semantic<'_>,
    node_id: NodeId,
    facts: &ArrowFacts,
    reserved: &mut FxHashSet<String>,
) -> ArrowCapturePlan {
    let nodes = semantic.nodes();
    let mut aliases = CaptureAliases::default();
    if !facts.this_spans.is_empty() {
        aliases.this_name = Some(reserve_name("_this", reserved));
        aliases.this_spans.extend(facts.this_spans.iter().copied());
    }
    if !facts.arguments_spans.is_empty() {
        aliases.arguments_name = Some(reserve_name("_arguments", reserved));
        aliases
            .arguments_spans
            .extend(facts.arguments_spans.iter().copied());
    }
    if !facts.new_target_spans.is_empty() {
        aliases.new_target_name = Some(reserve_name("_newtarget", reserved));
        aliases
            .new_target_spans
            .extend(facts.new_target_spans.iter().copied());
    }
    if aliases.is_empty() {
        return ArrowCapturePlan {
            aliases,
            hoist: None,
            in_place: false,
        };
    }
    match statement_insertion(source, nodes, node_id) {
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

/// Offset of the statement enclosing `node_id`, when a `var` declaration hoisted
/// there would still see the same `this`, `arguments`, and `new.target` as the
/// arrow being lowered.
///
/// Arrows are transparent to all three, so the walk may cross them, but two
/// containers stop it:
///
/// * A class field initializer or accessor property binds its own `this` — the
///   instance under construction — so a declaration hoisted out of the class
///   would capture the enclosing module's `this` instead.
/// * An arrow written with a concise body parses to a `FunctionBody` like any
///   other, but the source has no braces to hold a statement.
///
/// `None` means the caller has to keep the capture inside the expression.
fn statement_insertion(
    _source: &str,
    nodes: &oxc_semantic::AstNodes<'_>,
    node_id: NodeId,
) -> Option<NodeId> {
    let mut root = node_id;
    for ancestor in nodes.ancestor_ids(node_id) {
        match nodes.kind(ancestor) {
            AstKind::FunctionBody(_) => {
                if matches!(
                    nodes.parent_kind(ancestor),
                    AstKind::ArrowFunctionExpression(arrow) if arrow.expression
                ) {
                    return None;
                }
                return Some(root);
            }
            AstKind::Program(_)
            | AstKind::BlockStatement(_)
            | AstKind::StaticBlock(_)
            | AstKind::SwitchCase(_) => return Some(root),
            AstKind::PropertyDefinition(_) | AstKind::AccessorProperty(_) => return None,
            _ => {}
        }
        root = ancestor;
    }
    None
}

fn reserve_name(base: &str, used: &mut FxHashSet<String>) -> String {
    if used.insert(base.to_owned()) {
        return base.to_owned();
    }
    let mut suffix = used.len().max(2);
    loop {
        let name = format!("{base}{suffix}");
        if used.insert(name.clone()) {
            return name;
        }
        suffix += 1;
    }
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

fn parameter_binding_names(
    symbols: &[SymbolFact<'_>],
    params: &FormalParameters<'_>,
) -> FxHashSet<String> {
    symbols_in(symbols, params.span)
        .filter(|symbol| {
            symbol.span.end <= params.span.end && symbol.flags.intersects(SymbolFlags::Variable)
        })
        .map(|symbol| symbol.name.to_owned())
        .collect()
}

fn body_scope_wrapper_plan(
    source: &str,
    symbols: &[SymbolFact<'_>],
    params: &FormalParameters<'_>,
    body: &FunctionBody<'_>,
    param_bindings: &FxHashSet<String>,
) -> (bool, Vec<String>) {
    let mut body_names: FxHashSet<&str> = symbols_in(symbols, body.span)
        .filter(|symbol| symbol.span.start > body.span.start && symbol.span.end < body.span.end)
        .map(|symbol| symbol.name)
        .collect();
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
    let initializer_uses_body_name = params.items.iter().any(|parameter| {
        parameter.initializer.as_ref().is_some_and(|initializer| {
            let initializer = slice(source, initializer.span());
            let mut token_start = None;
            for (offset, character) in initializer.char_indices() {
                if character.is_alphanumeric() || character == '_' {
                    token_start.get_or_insert(offset);
                } else if let Some(start) = token_start.take()
                    && body_names.contains(&initializer[start..offset])
                {
                    return true;
                }
            }
            token_start.is_some_and(|start| body_names.contains(&initializer[start..]))
        })
    });
    (
        !wrapper_arguments.is_empty() || initializer_uses_body_name,
        wrapper_arguments,
    )
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

fn symbols_in<'a>(
    symbols: &'a [SymbolFact<'a>],
    span: Span,
) -> impl Iterator<Item = &'a SymbolFact<'a>> {
    let start = symbols.partition_point(|symbol| symbol.span.start < span.start);
    symbols[start..]
        .iter()
        .take_while(move |symbol| symbol.span.start <= span.end)
}

fn slice(source: &str, span: Span) -> &str {
    &source[span.start as usize..span.end as usize]
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
        assert!(code.starts_with("function collect(head)"));
        assert!(code.contains("tail = new Array"));
        assert!(code.contains("tail[_key - 1] = arguments[_key]"));
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
        assert!(code.contains("return function()"));
        assert!(code.contains(".call(this)"));
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
        assert!(code.contains("rest = new Array"));
        assert!(code.contains("return value + rest.length"));
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
        let symbols = semantic
            .semantic
            .scoping()
            .symbol_ids()
            .map(|symbol_id| SymbolFact {
                span: semantic.semantic.scoping().symbol_span(symbol_id),
                name: semantic.semantic.scoping().symbol_name(symbol_id),
                flags: semantic.semantic.scoping().symbol_flags(symbol_id),
            })
            .collect::<Vec<_>>();
        let (facts, _, _) = collect_lexical_facts(&semantic.semantic, &symbols);
        assert_eq!(facts.len(), 128);
        assert!(facts.values().all(|facts| facts.this_spans.len() == 1));
    }

    #[test]
    fn wrapper_scanner_preserves_textual_token_compatibility() {
        let wrapper = |source: &str| {
            let allocator = Allocator::default();
            let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
            let semantic = oxc_semantic::SemanticBuilder::new()
                .with_build_nodes(true)
                .build(&parsed.program);
            let plan = prepare_ast(source, &semantic.semantic).unwrap();
            plan.functions.values().next().unwrap()[0].wrapper
        };
        assert!(wrapper(
            "function read(value = object.body) { let body = 1; return value; }"
        ));
        assert!(wrapper(
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
        assert!(!wrapper(
            "function read(value = $body) { let $body = 1; return value; }"
        ));
    }

    #[test]
    fn nested_arrow_facts_propagate_without_crossing_functions() {
        let collect = |source: &str| {
            let allocator = Allocator::default();
            let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
            let semantic = oxc_semantic::SemanticBuilder::new()
                .with_build_nodes(true)
                .build(&parsed.program);
            let mut symbols = semantic
                .semantic
                .scoping()
                .symbol_ids()
                .map(|symbol_id| SymbolFact {
                    span: semantic.semantic.scoping().symbol_span(symbol_id),
                    name: semantic.semantic.scoping().symbol_name(symbol_id),
                    flags: semantic.semantic.scoping().symbol_flags(symbol_id),
                })
                .collect::<Vec<_>>();
            symbols.sort_unstable_by_key(|symbol| symbol.span.start);
            let (facts, _, _) = collect_lexical_facts(&semantic.semantic, &symbols);
            facts
                .values()
                .map(|facts| {
                    (
                        facts.this_spans.len(),
                        facts.arguments_spans.len(),
                        facts.new_target_spans.len(),
                    )
                })
                .collect::<Vec<_>>()
        };
        let mut nested = collect("const read = (a = 1) => (b = 2) => this;");
        nested.sort_unstable();
        assert_eq!(nested, [(1, 0, 0), (1, 0, 0)]);
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
