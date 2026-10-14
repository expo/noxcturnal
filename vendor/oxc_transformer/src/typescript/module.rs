use oxc_allocator::{ArenaBox, TakeIn};
use oxc_ast::{ast::*, builder::NONE};
use oxc_semantic::{Reference, SymbolFlags};
use oxc_span::SPAN;
use oxc_str::static_ident;
use oxc_syntax::reference::ReferenceFlags;
use oxc_traverse::Traverse;
use rustc_hash::FxHashMap;

use super::diagnostics;

use crate::{Module, context::TraverseCtx, state::TransformState};

pub struct TypeScriptModule {
    /// <https://babeljs.io/docs/babel-plugin-transform-typescript#onlyremovetypeimports>
    only_remove_type_imports: bool,
    module: Module,
}

impl TypeScriptModule {
    pub fn new(only_remove_type_imports: bool, module: Module) -> Self {
        Self { only_remove_type_imports, module }
    }
}

impl<'a> Traverse<'a, TransformState<'a>> for TypeScriptModule {
    #[inline]
    fn enter_program(&mut self, program: &mut Program<'a>, ctx: &mut TraverseCtx<'a>) {
        self.mark_unused_import_equals_references_as_type(&program.body, ctx);
    }

    fn exit_program(&mut self, program: &mut Program<'a>, ctx: &mut TraverseCtx<'a>) {
        // In Babel, it will insert `use strict` in `@babel/transform-modules-commonjs` plugin.
        // Once we have a commonjs plugin, we can consider moving this logic there.
        if self.module.is_commonjs() {
            let has_use_strict = program.directives.iter().any(Directive::is_use_strict);
            if !has_use_strict {
                program.directives.insert(0, Directive::new_use_strict(ctx));
            }
        }
    }

    fn enter_statement(&mut self, stmt: &mut Statement<'a>, ctx: &mut TraverseCtx<'a>) {
        if let Statement::TSExportAssignment(export_assignment) = stmt {
            *stmt = self.transform_ts_export_assignment(export_assignment, ctx);
        }
    }

    fn enter_declaration(&mut self, decl: &mut Declaration<'a>, ctx: &mut TraverseCtx<'a>) {
        if let Declaration::TSImportEqualsDeclaration(import_equals) = decl
            && import_equals.import_kind.is_value()
            && let Some(new_decl) = self.transform_ts_import_equals(import_equals, ctx)
        {
            *decl = new_decl;
        }
    }
}

impl<'a> TypeScriptModule {
    /// Transform `export = expression` to `module.exports = expression`.
    fn transform_ts_export_assignment(
        &self,
        export_assignment: &mut TSExportAssignment<'a>,
        ctx: &mut TraverseCtx<'a>,
    ) -> Statement<'a> {
        if self.module.is_esm() {
            ctx.state.error(diagnostics::export_assignment_cannot_bed_used_in_esm(
                export_assignment.span,
            ));
        }

        // module.exports
        let module_exports = {
            let module = static_ident!("module");
            let reference_id = ctx.create_reference_in_current_scope(module, ReferenceFlags::Read);
            let reference =
                IdentifierReference::boxed_with_reference_id(SPAN, module, reference_id, ctx);
            let object = Expression::Identifier(reference);
            let property = IdentifierName::new(SPAN, "exports", ctx);
            MemberExpression::new_static_member_expression(SPAN, object, property, false, ctx)
        };

        let left = AssignmentTarget::from(SimpleAssignmentTarget::from(module_exports));
        let right = export_assignment.expression.take_in(ctx);
        let assignment_expr = Expression::new_assignment_expression(
            SPAN,
            AssignmentOperator::Assign,
            left,
            right,
            ctx,
        );
        Statement::new_expression_statement(SPAN, assignment_expr, ctx)
    }

    /// Transform TSImportEqualsDeclaration to a VariableDeclaration.
    ///
    /// ```TypeScript
    /// import module = require('module');
    /// import AliasModule = LongNameModule;
    ///
    /// ```JavaScript
    /// const module = require('module');
    /// const AliasModule = LongNameModule;
    /// ```
    fn transform_ts_import_equals(
        &self,
        decl: &mut TSImportEqualsDeclaration<'a>,
        ctx: &mut TraverseCtx<'a>,
    ) -> Option<Declaration<'a>> {
        if !self.only_remove_type_imports
            && !ctx.parent().is_export_named_declaration()
            && ctx.scoping().get_resolved_references(decl.id.symbol_id()).all(Reference::is_type)
        {
            // No value reference, we will remove this declaration in `TypeScriptAnnotations`
            let scope_id = ctx.current_scope_id();
            ctx.scoping_mut().remove_binding(scope_id, decl.id.name);
            return None;
        }

        let binding = BindingPattern::BindingIdentifier(ArenaBox::new_in(decl.id.clone(), ctx));
        let decl_span = decl.span;

        let flags = ctx.scoping_mut().symbol_flags_mut(decl.id.symbol_id());
        flags.remove(SymbolFlags::Import);

        let (kind, init) = match &mut decl.module_reference {
            TSModuleReference::IdentifierReference(ident) => {
                flags.insert(SymbolFlags::FunctionScopedVariable);

                let reference_id = ident.reference_id();
                let reference = ctx.scoping_mut().get_reference_mut(reference_id);
                *reference.flags_mut() = ReferenceFlags::Read;

                let ident = Expression::new_identifier_with_reference_id(
                    ident.span,
                    ident.name,
                    reference_id,
                    ctx,
                );
                (VariableDeclarationKind::Var, ident)
            }
            TSModuleReference::QualifiedName(qualified_name) => {
                flags.insert(SymbolFlags::FunctionScopedVariable);

                let init = MemberExpression::new_static_member_expression(
                    SPAN,
                    self.transform_ts_type_name(&mut qualified_name.left, ctx),
                    qualified_name.right.clone(),
                    false,
                    ctx,
                )
                .into();
                (VariableDeclarationKind::Var, init)
            }
            TSModuleReference::ExternalModuleReference(reference) => {
                flags.insert(SymbolFlags::BlockScopedVariable | SymbolFlags::ConstVariable);

                if self.module.is_esm() {
                    ctx.state.error(diagnostics::import_equals_cannot_be_used_in_esm(decl_span));
                }

                let require = static_ident!("require");
                let require_symbol_id = ctx.scoping().find_binding(ctx.current_scope_id(), require);
                let callee =
                    ctx.create_ident_expr(SPAN, require, require_symbol_id, ReferenceFlags::Read);
                let str_lit = &reference.expression;
                let str_lit = StringLiteral::boxed_with_lone_surrogates(
                    str_lit.span,
                    str_lit.value,
                    str_lit.raw,
                    str_lit.lone_surrogates,
                    ctx,
                );
                let argument = Argument::StringLiteral(str_lit);
                (
                    VariableDeclarationKind::Const,
                    Expression::new_call_expression(SPAN, callee, NONE, [argument], false, ctx),
                )
            }
        };
        let decl = VariableDeclarator::new(SPAN, kind, binding, NONE, Some(init), false, ctx);

        Some(Declaration::new_variable_declaration(SPAN, kind, [decl], false, ctx))
    }

    #[expect(clippy::self_only_used_in_recursion)]
    fn transform_ts_type_name(
        &self,
        type_name: &mut TSTypeName<'a>,
        ctx: &mut TraverseCtx<'a>,
    ) -> Expression<'a> {
        match type_name {
            TSTypeName::IdentifierReference(ident) => {
                let reference_id = ident.reference_id();
                let reference = ctx.scoping_mut().get_reference_mut(reference_id);
                *reference.flags_mut() = ReferenceFlags::Read;
                Expression::new_identifier_with_reference_id(
                    ident.span,
                    ident.name,
                    reference_id,
                    ctx,
                )
            }
            TSTypeName::QualifiedName(qualified_name) => Expression::new_static_member_expression(
                SPAN,
                self.transform_ts_type_name(&mut qualified_name.left, ctx),
                qualified_name.right.clone(),
                false,
                ctx,
            ),
            TSTypeName::ThisExpression(e) => Expression::new_this_expression(e.span, ctx),
        }
    }

    /// Mark identifiers in unused `import foo = bar.baz` module references as type references.
    ///
    /// When an `import foo = bar.baz` declaration is unused (no value references to `foo`),
    /// it will be removed by `TypeScriptAnnotations`. However, the reference to `bar` was marked
    /// as a Read reference during building Semantic. If we don't change it to a Type reference, the binding
    /// `bar` (which might come from another `import bar = ...`) would appear to have a value
    /// reference and wouldn't be removed.
    ///
    /// Propagate unused bindings through their dependencies with a worklist.
    /// Source order cannot resolve forward alias chains; repeatedly scanning all
    /// statements would make those chains quadratic.
    ///
    /// Note: `TSImportEqualsDeclaration` can appear at the top-level and inside namespaces.
    /// We only need to process top-level `Program` here because `TypeScriptNamespace`
    /// has special handling that already covers the case for import equals inside namespaces.
    pub fn mark_unused_import_equals_references_as_type(
        &self,
        stmts: &[Statement<'a>],
        ctx: &mut TraverseCtx<'a>,
    ) {
        // When `only_remove_type_imports` is true, we don't remove unused value imports,
        // so we don't need to change reference flags.
        if self.only_remove_type_imports {
            return;
        }

        let mut aliases = FxHashMap::default();
        let mut unused = Vec::new();
        for stmt in stmts {
            let Statement::TSImportEqualsDeclaration(decl) = stmt else { continue };
            let ident = match &decl.module_reference {
                TSModuleReference::IdentifierReference(ident) => Some(ident.as_ref()),
                TSModuleReference::QualifiedName(qualified) => {
                    qualified.left.get_identifier_reference()
                }
                TSModuleReference::ExternalModuleReference(_) => None,
            };
            let Some(ident) = ident else { continue };
            let symbol_id = decl.id.symbol_id();
            let value_references = ctx
                .scoping()
                .get_resolved_references(symbol_id)
                .filter(|reference| !reference.is_type())
                .count();
            aliases.insert(symbol_id, (ident.reference_id(), value_references));
            if value_references == 0 {
                unused.push(symbol_id);
            }
        }

        while let Some(symbol_id) = unused.pop() {
            let reference_id = aliases[&symbol_id].0;
            let reference = ctx.scoping_mut().get_reference_mut(reference_id);
            if reference.is_type() {
                continue;
            }
            *reference.flags_mut() = ReferenceFlags::Type;
            if let Some(dependency) = reference.symbol_id()
                && let Some((_, count)) = aliases.get_mut(&dependency)
            {
                *count -= 1;
                if *count == 0 {
                    unused.push(dependency);
                }
            }
        }
    }
}
