use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use oxc_allocator::Allocator;
use oxc_ast::AstKind;
use oxc_ast_visit::Visit;
use oxc_parser::{Parser, ParserReturn};
use oxc_span::SourceType;
use self_cell::self_cell;

use crate::generated::event_schema::{NODE_TYPE_COUNT, ast_kind_protocol_id, node_type_name};
use crate::syntax::{classification::source_type, validation::validate_program};

use super::{collect::materialize_program, session::NativeIndexedSession};

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
}

impl<'a> Visit<'a> for SyntaxFacts {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.types[ast_kind_protocol_id(kind) as usize] = true;
        match kind {
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
}

/// Own the input parse while JavaScript selects the applicable plugin contracts.
/// Materialization consumes this owner, so selection never requires a second parse.
#[napi]
pub struct NativeParsedSource {
    parsed: Option<OwnedProgram>,
    filename: String,
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
        };
        facts.visit_program(&parsed.borrow_dependent().program);
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
        retention_manifest: Buffer,
        initial_route_manifest: Buffer,
    ) -> Result<NativeIndexedSession> {
        let parsed = self.parsed.take().ok_or_else(consumed)?;
        let parts = parsed.with_dependent(|owner, parsed| {
            materialize_program(
                &owner.source,
                &owner.allocator,
                &parsed.program,
                Some(&retention_manifest),
                Some(&initial_route_manifest),
                true,
            )
        })?;
        Ok(NativeIndexedSession::from_parts(
            parsed.into_owner().source,
            self.filename.clone(),
            Some(initial_route_manifest),
            parts,
        ))
    }

    #[napi]
    pub fn materialize_routed(&mut self, manifest: Buffer) -> Result<Buffer> {
        let manifest = super::decode_route_manifest(&manifest)?;
        let parsed = self.parsed.take().ok_or_else(consumed)?;
        parsed.with_dependent(|owner, parsed| {
            super::routed::materialize_routed_program(
                &owner.source,
                &owner.allocator,
                &parsed.program,
                &manifest,
                None,
            )
        })
    }

    /// A file with no applicable plugins still needs all ordinary early-error checks.
    #[napi]
    pub fn validate(&mut self) -> Result<()> {
        let parsed = self.parsed.take().ok_or_else(consumed)?;
        parsed.with_dependent(|owner, parsed| {
            validate_program(&parsed.program, "indexed-session", &owner.allocator).map(|_| ())
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
    fn validation_consumes_the_parse_and_close_is_idempotent() {
        let mut parsed =
            NativeParsedSource::new("const value=1;".into(), "input.js".into()).unwrap();
        parsed.validate().unwrap();
        assert!(parsed.syntax_facts().is_err());
        parsed.close();
        parsed.close();
    }
}
