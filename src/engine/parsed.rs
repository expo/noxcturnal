use std::cell::Cell;

use napi::{
    Error, Result, Status,
    bindgen_prelude::{Buffer, Either},
};
use napi_derive::napi;
use oxc_allocator::Allocator;
use oxc_ast::{AstKind, ast::TSEnumMemberName};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::{Parser, ParserReturn};
use oxc_semantic::Stats;
use oxc_span::SourceType;
use oxc_syntax::scope::{ScopeFlags, ScopeId};
use self_cell::self_cell;

use crate::generated::event_schema::{NODE_TYPE_COUNT, ast_kind_protocol_id, node_type_name};
use crate::syntax::{classification::source_type, validation::validate_program};

use super::manifest::ResolvedManifest;
use super::{NativeCompiledManifest, collect::materialize_program, session::NativeIndexedSession};

struct ParseOwner {
    allocator: Allocator,
    source: String,
    source_type: SourceType,
}

self_cell! {
    struct OwnedProgram {
        owner: ParseOwner,
        #[covariant]
        dependent: ParserReturn,
    }
}

struct SyntaxFacts {
    // Protocol node IDs are one-based; reserve slot zero as well.
    types: [bool; NODE_TYPE_COUNT + 1],
    async_function: bool,
    generator_function: bool,
    stats: Stats,
}

impl<'a> Visit<'a> for SyntaxFacts {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.types[ast_kind_protocol_id(kind) as usize] = true;
        self.stats.nodes += 1;
        match kind {
            AstKind::BindingIdentifier(_) => self.stats.symbols += 1,
            AstKind::IdentifierReference(_) => self.stats.references += 1,
            AstKind::Function(function) => {
                self.async_function |= function.r#async;
                self.generator_function |= function.generator;
            }
            AstKind::ArrowFunctionExpression(function) => {
                self.async_function |= function.r#async;
            }
            _ => {}
        }
    }

    fn enter_scope(&mut self, _: ScopeFlags, _: &Cell<Option<ScopeId>>) {
        self.stats.scopes += 1;
    }

    fn visit_ts_enum_member_name(&mut self, name: &TSEnumMemberName<'a>) {
        self.stats.symbols += 1;
        walk::walk_ts_enum_member_name(self, name);
    }
}

/// Own the input parse while JavaScript selects the applicable plugin contracts.
/// Materialization consumes this owner, so selection never requires a second parse.
#[napi]
pub struct NativeParsedSource {
    parsed: Option<OwnedProgram>,
    filename: String,
    // Syntax selection already walks this immutable tree. Carry its exact
    // allocation counts into semantic analysis instead of counting it again.
    semantic_stats: Cell<Option<Stats>>,
}

#[napi]
impl NativeParsedSource {
    #[napi(constructor)]
    pub fn new(source: String, filename: String) -> Result<Self> {
        let source_type = source_type(&filename, &source)?;
        let parsed = OwnedProgram::new(
            ParseOwner {
                allocator: Allocator::default(),
                source,
                source_type,
            },
            |owner| Parser::new(&owner.allocator, &owner.source, owner.source_type).parse(),
        );
        if !parsed.borrow_dependent().diagnostics.is_empty() {
            return Err(crate::parse_failure::error(
                &parsed.borrow_owner().source,
                &parsed.borrow_dependent().diagnostics,
                "indexed-session",
            ));
        }
        Ok(Self {
            parsed: Some(parsed),
            filename,
            semantic_stats: Cell::new(None),
        })
    }

    #[napi]
    pub fn function_map(&self) -> Result<crate::sourcemap::function_map::FunctionMap> {
        let parsed = self.parsed.as_ref().ok_or_else(consumed)?;
        Ok(parsed.with_dependent(|owner, parsed| {
            crate::sourcemap::function_map::collect(&owner.source, &self.filename, &parsed.program)
        }))
    }

    #[napi]
    pub fn syntax_facts(&self) -> Result<Vec<String>> {
        let parsed = self.parsed.as_ref().ok_or_else(consumed)?;
        let mut facts = SyntaxFacts {
            types: [false; NODE_TYPE_COUNT + 1],
            async_function: false,
            generator_function: false,
            stats: Stats::default(),
        };
        facts.visit_program(&parsed.borrow_dependent().program);
        self.semantic_stats.set(Some(facts.stats));
        let mut names = facts
            .types
            .iter()
            .enumerate()
            .filter_map(|(id, present)| {
                present
                    .then(|| node_type_name(id as u32).map(str::to_owned))
                    .flatten()
            })
            .collect::<Vec<_>>();
        if facts.async_function {
            names.push("AsyncFunction".into());
        }
        if facts.generator_function {
            names.push("GeneratorFunction".into());
        }
        Ok(names)
    }

    #[napi]
    pub fn materialize(
        &mut self,
        retention_manifest: Either<Buffer, &NativeCompiledManifest>,
        initial_route_manifest: Either<Buffer, &NativeCompiledManifest>,
    ) -> Result<NativeIndexedSession> {
        let parsed = self.parsed.take().ok_or_else(consumed)?;
        let retention_manifest = ResolvedManifest::new(retention_manifest)?;
        let initial_route_manifest = ResolvedManifest::new(initial_route_manifest)?;
        let parts = parsed.with_dependent(|owner, parsed| {
            materialize_program(
                &owner.source,
                &owner.allocator,
                &parsed.program,
                Some(retention_manifest.compiled()),
                Some(initial_route_manifest.compiled()),
                true,
                self.semantic_stats.get(),
            )
        })?;
        Ok(NativeIndexedSession::from_parts(
            parsed.into_owner().source,
            self.filename.clone(),
            Some(initial_route_manifest.key()),
            parts,
        ))
    }

    #[napi]
    pub fn materialize_routed(
        &mut self,
        manifest: Either<Buffer, &NativeCompiledManifest>,
    ) -> Result<Buffer> {
        let manifest = ResolvedManifest::new(manifest)?;
        let parsed = self.parsed.take().ok_or_else(consumed)?;
        parsed.with_dependent(|owner, parsed| {
            super::routed::materialize_routed_program(
                &owner.source,
                &owner.allocator,
                &parsed.program,
                manifest.compiled(),
                None,
                self.semantic_stats.get(),
            )
        })
    }

    /// A file with no applicable plugins still needs all ordinary early-error checks.
    #[napi]
    pub fn validate(&mut self) -> Result<()> {
        let parsed = self.parsed.take().ok_or_else(consumed)?;
        parsed.with_dependent(|owner, parsed| {
            if let Some(stats) = self.semantic_stats.get() {
                crate::syntax::validation::validate_program_with_stats(
                    &parsed.program,
                    "indexed-session",
                    stats,
                )
                .map(|_| ())
            } else {
                validate_program(&parsed.program, "indexed-session", &owner.allocator).map(|_| ())
            }
        })
    }

    #[napi]
    pub fn close(&mut self) {
        self.parsed = None;
    }
}

fn consumed() -> Error {
    Error::new(Status::GenericFailure, "parsed-source-consumed")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn facts(source: &str) -> Vec<String> {
        NativeParsedSource::new(source.into(), "input.js".into())
            .unwrap()
            .syntax_facts()
            .unwrap()
    }

    #[test]
    fn syntax_features_ignore_comments_literals_and_property_names() {
        let facts = facts(
            "// async class super\nconst text='async function* fake(){}'; const obj={async:1,super:2,class:3}; function ordinary(){}",
        );
        assert!(facts.iter().any(|fact| fact == "Function"));
        for absent in ["AsyncFunction", "GeneratorFunction", "Super", "Class"] {
            assert!(!facts.iter().any(|fact| fact == absent));
        }
    }

    #[test]
    fn syntax_features_include_nested_methods_and_async_arrows() {
        let facts =
            facts("const 雪=async()=>1; class C extends B { async *method(){yield super.value} }");
        for present in ["AsyncFunction", "GeneratorFunction", "Super", "Class"] {
            assert!(facts.iter().any(|fact| fact == present));
        }
    }

    #[test]
    fn syntax_features_include_the_highest_protocol_node_id() {
        let facts = NativeParsedSource::new("type Unknown = (?);".into(), "input.ts".into())
            .unwrap()
            .syntax_facts()
            .unwrap();
        assert!(facts.iter().any(|fact| fact == "JSDocUnknownType"));
    }

    #[test]
    fn syntax_selection_reuses_exact_semantic_allocation_counts() {
        for (filename, source) in [
            (
                "input.js",
                "function outer(value = () => unknown) { try { return value(); } catch ({message}) { return message; } }",
            ),
            (
                "input.js",
                "var repeated; var repeated; class C extends Base { #value = 1; static { const local = 2; } method() { return this.#value; } }",
            ),
            (
                "input.ts",
                "interface I<T> { value: T } type Mapper<T> = T extends infer U ? U : never; enum E { First, Second = 2 } namespace N { export const value = E.First; }",
            ),
            (
                "input.tsx",
                "const View = <T,>(value: T) => <Widget value={value} />;",
            ),
        ] {
            let mut parsed = NativeParsedSource::new(source.into(), filename.into()).unwrap();
            let expected =
                Stats::count(&parsed.parsed.as_ref().unwrap().borrow_dependent().program);
            let initial_facts = parsed.syntax_facts().unwrap();
            assert_eq!(parsed.syntax_facts().unwrap(), initial_facts);
            let actual = parsed.semantic_stats.get().unwrap();
            assert_eq!(
                (
                    actual.nodes,
                    actual.scopes,
                    actual.symbols,
                    actual.references
                ),
                (
                    expected.nodes,
                    expected.scopes,
                    expected.symbols,
                    expected.references
                ),
                "{filename}: {source}",
            );
            // The same cached counts feed ordinary early-error validation;
            // successful validation still consumes exactly this parse.
            parsed.validate().unwrap();
            assert!(parsed.syntax_facts().is_err());
        }
    }

    #[test]
    fn cached_syntax_counts_do_not_skip_early_errors() {
        let mut parsed =
            NativeParsedSource::new("let duplicate; let duplicate;".into(), "input.js".into())
                .unwrap();
        parsed.syntax_facts().unwrap();
        assert!(parsed.validate().is_err());
        assert!(parsed.syntax_facts().is_err());
        parsed.close();
        parsed.close();
    }

    #[test]
    fn validation_consumes_the_parse_and_close_is_idempotent() {
        let mut parsed =
            NativeParsedSource::new("const value=1;".into(), "input.js".into()).unwrap();
        parsed.validate().unwrap();
        assert!(parsed.syntax_facts().is_err());
        parsed.close();
        parsed.close();
    }
}
