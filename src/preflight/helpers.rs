//! Compatibility contract between Oxc 0.141 helper requests and Babel runtime.

use std::sync::OnceLock;

use oxc_transformer::Helper;
use rustc_hash::FxHashSet;
use semver::Version;

use crate::generated::inline_helpers::{
    INLINE_ASYNC_HELPERS as GENERATED_INLINE_ASYNC_HELPERS,
    INLINE_ASYNC_TO_GENERATOR as GENERATED_INLINE_ASYNC_TO_GENERATOR,
    INLINE_OBJECT_HELPERS as GENERATED_INLINE_OBJECT_HELPERS,
    INLINE_OXC_CLASS_FEATURE_HELPERS as GENERATED_INLINE_CLASS_FEATURE_HELPERS,
    INLINE_USING_CTX as GENERATED_INLINE_USING_CTX,
};

/// Babel-owned compatibility metadata emitted from the pinned `@babel/helpers`.
pub(crate) struct GeneratedHelperCompatibility {
    pub ordinal: u8,
    pub name: &'static str,
    pub runtime_path: &'static str,
    pub min_version: &'static str,
    pub export_shape: &'static str,
}

pub(crate) struct GeneratedInlineRoot {
    pub name: &'static str,
    pub compact: &'static str,
}

/// Generator-owned support code and all metadata needed to materialize it.
pub(crate) struct GeneratedHelperFragment {
    pub inline_compact: &'static str,
    pub inline_pretty: &'static str,
    pub runtime_compact: &'static str,
    pub runtime_pretty: &'static str,
    pub inline_bindings: &'static [&'static str],
    pub runtime_bindings: &'static [&'static str],
    pub babel_dependencies: &'static [&'static str],
}

#[derive(Clone, Copy)]
pub(super) enum CustomHelper {
    IteratorResult,
    LegacyDecorate,
    LegacyDecorateParam,
}

pub(super) struct CustomHelperSpec {
    pub name: &'static str,
    pub owner: &'static str,
    pub rationale: &'static str,
    pub behavioral_tests: &'static [&'static str],
    compact: &'static str,
    pretty: &'static str,
    binding: &'static str,
}

pub(super) const fn custom_helper_spec(helper: CustomHelper) -> CustomHelperSpec {
    match helper {
        CustomHelper::IteratorResult => CustomHelperSpec {
            name: "_iteratorResult",
            owner: "async iterator result validation",
            rationale: "Oxc async-iterator lowering requires object-shape validation; Babel runtime has no equivalent helper",
            behavioral_tests: &["generated_async_iterator_results_are_validated"],
            compact: "function _iteratorResult(value){if(Object(value)!==value)throw new TypeError('Iterator result is not an object');return value}\n",
            pretty: "function _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\n",
            binding: "_iteratorResult",
        },
        CustomHelper::LegacyDecorate => CustomHelperSpec {
            name: "_decorate",
            owner: "legacy TypeScript decorators",
            rationale: "Babel runtime decorate implements a different decorators ABI",
            behavioral_tests: &["legacy_decorators"],
            compact: "function _decorate(e,t,r,n){var o=arguments.length,a=o<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,r):n,l;for(var c=e.length-1;c>=0;c--)if(l=e[c])a=(o<3?l(a):o>3?l(t,r,a):l(t,r))||a;return o>3&&a&&Object.defineProperty(t,r,a),a}",
            pretty: "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result = argumentCount < 3 ? target : descriptor === null ? descriptor = Object.getOwnPropertyDescriptor(target, key) : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if (decorator = decorators[index]) result = (argumentCount < 3 ? decorator(result) : argumentCount > 3 ? decorator(target, key, result) : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}",
            binding: "_decorate",
        },
        CustomHelper::LegacyDecorateParam => CustomHelperSpec {
            name: "_decorateParam",
            owner: "legacy TypeScript parameter decorators",
            rationale: "Babel runtime has no helper for the legacy parameter-decorator adapter ABI",
            behavioral_tests: &["legacy_parameter_decorators"],
            compact: "function _decorateParam(e,t){return function(r,n){t(r,n,e)}}",
            pretty: "function _decorateParam(index, decorator) {\n  return function (target, key) {\n    decorator(target, key, index);\n  };\n}",
            binding: "_decorateParam",
        },
    }
}

/// Custom (non-Oxc) helpers requested structurally by in-place preflight passes.
///
/// Passes record helper ABI names and generated source at the point where they
/// emit a helper reference. Generated source is inserted once after final
/// codegen, with the decoded map shifted structurally and no fragment parse.
#[derive(Default)]
pub(super) struct CustomHelperRequests {
    names: FxHashSet<&'static str>,
    fragments: Vec<(String, String)>,
    generated: Vec<GeneratedRequest>,
    scope_names: FxHashSet<String>,
}

struct GeneratedRequest {
    descriptor: &'static GeneratedHelperFragment,
    force_inline: bool,
    renames: Vec<(String, String)>,
}

impl CustomHelperRequests {
    pub(super) fn is_empty(&self) -> bool {
        self.names.is_empty()
            && self.fragments.is_empty()
            && self.generated.is_empty()
            && self.scope_names.is_empty()
    }

    fn push_fragment(&mut self, compact: String, pretty: String) {
        self.fragments.push((compact, pretty));
    }

    pub(super) fn push_declaration(&mut self, compact: String, pretty: String) {
        self.push_fragment(compact, pretty);
    }

    pub(super) fn materialize_custom(&mut self, helper: CustomHelper, binding: &str) {
        let spec = custom_helper_spec(helper);
        debug_assert!(!spec.name.is_empty());
        debug_assert!(!spec.owner.is_empty());
        debug_assert!(!spec.rationale.is_empty());
        debug_assert!(!spec.behavioral_tests.is_empty());
        let renames = [(spec.binding, binding)];
        self.fragments.push((
            replace_identifier_tokens(spec.compact, &renames),
            replace_identifier_tokens(spec.pretty, &renames),
        ));
        self.scope_names.insert(binding.to_owned());
    }

    /// Atomically selects, renames, accounts for, and reserves a generated fragment.
    pub(super) fn materialize_generated(
        &mut self,
        descriptor: &'static GeneratedHelperFragment,
        inline: bool,
        renames: &[(&str, &str)],
    ) {
        let keys: FxHashSet<&str> = renames.iter().map(|(from, _)| *from).collect();
        assert_eq!(
            keys.len(),
            renames.len(),
            "duplicate generated helper rename"
        );
        let declared_bindings: FxHashSet<&str> = descriptor
            .inline_bindings
            .iter()
            .chain(descriptor.runtime_bindings)
            .copied()
            .collect();
        assert_eq!(
            keys, declared_bindings,
            "generated helper rename map must exactly cover declared bindings"
        );
        let values: FxHashSet<&str> = renames.iter().map(|(_, to)| *to).collect();
        assert_eq!(
            values.len(),
            renames.len(),
            "duplicate generated helper destination"
        );
        self.names.extend(descriptor.babel_dependencies);
        self.scope_names
            .extend(renames.iter().map(|(_, to)| (*to).to_owned()));
        self.generated.push(GeneratedRequest {
            descriptor,
            force_inline: inline,
            renames: renames
                .iter()
                .map(|(from, to)| ((*from).to_owned(), (*to).to_owned()))
                .collect(),
        });
    }

    /// Materialize a standard runtime import after the caller checks availability.
    pub(super) fn materialize_runtime(
        &mut self,
        helper: &'static str,
        binding: &str,
        module: bool,
    ) {
        let spec =
            babel_helper_spec(helper).expect("runtime helper has generated compatibility metadata");
        let source = if module {
            format!(
                "import {binding} from \"@babel/runtime/helpers/{}\";",
                spec.babel_path
            )
        } else {
            format!(
                "var {binding}=require(\"@babel/runtime/helpers/{}\");",
                spec.babel_path
            )
        };
        self.names.insert(helper);
        self.scope_names.insert(binding.to_owned());
        self.fragments.push((source.clone(), source));
    }

    pub(super) fn reserve_scope_names(&mut self, names: impl IntoIterator<Item = String>) {
        self.scope_names.extend(names);
    }

    pub(super) fn scope_names(&self) -> impl Iterator<Item = &str> {
        self.scope_names.iter().map(String::as_str)
    }

    pub(super) fn prepend(&mut self, mut other: Self) {
        self.names.extend(other.names);
        self.scope_names.extend(other.scope_names);
        other.generated.append(&mut self.generated);
        self.generated = other.generated;
        other.fragments.append(&mut self.fragments);
        self.fragments = other.fragments;
    }

    pub(super) fn extend_into(
        self,
        target: &mut Vec<&'static str>,
        fragments: &mut Vec<String>,
        compact: bool,
        runtime_policy: Option<&RuntimeHelperPolicy>,
    ) {
        target.extend(self.names);
        target.sort_unstable();
        target.dedup();
        let mut selected_fragments = self
            .fragments
            .into_iter()
            .map(|(compact_source, pretty_source)| {
                if compact {
                    compact_source
                } else {
                    pretty_source
                }
            })
            .collect::<Vec<_>>();
        for request in self.generated {
            let inline = request.force_inline
                || runtime_policy.is_none()
                || request
                    .descriptor
                    .babel_dependencies
                    .iter()
                    .any(|dependency| {
                        runtime_policy.unwrap().availability(dependency)
                            == RuntimeAvailability::Inline
                    });
            let (source, bindings) = if inline {
                (
                    request.descriptor.inline_compact,
                    request.descriptor.inline_bindings,
                )
            } else {
                (
                    request.descriptor.runtime_compact,
                    request.descriptor.runtime_bindings,
                )
            };
            let selected_source = if compact {
                source
            } else if inline {
                request.descriptor.inline_pretty
            } else {
                request.descriptor.runtime_pretty
            };
            let renames = request
                .renames
                .iter()
                .map(|(from, to)| (from.as_str(), to.as_str()))
                .collect::<Vec<_>>();
            let selected_source = replace_identifier_tokens(selected_source, &renames);
            // Simultaneous renames may reuse an old spelling as another binding's
            // destination. Only stale names outside that destination set are invalid.
            for binding in bindings.iter().filter(|binding| {
                renames
                    .iter()
                    .any(|(from, to)| from == *binding && from != to)
                    && !renames.iter().any(|(_, to)| to == *binding)
            }) {
                assert!(!contains_identifier_token(&selected_source, binding));
            }
            if !selected_fragments.contains(&selected_source) {
                selected_fragments.push(selected_source);
            }
        }
        fragments.extend(selected_fragments);
    }
}

fn is_identifier_byte(byte: u8) -> bool {
    byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'$')
}

fn contains_identifier_token(source: &str, identifier: &str) -> bool {
    source.match_indices(identifier).any(|(start, _)| {
        (start == 0 || !is_identifier_byte(source.as_bytes()[start - 1]))
            && (start + identifier.len() == source.len()
                || !is_identifier_byte(source.as_bytes()[start + identifier.len()]))
    })
}

fn replace_identifier_tokens(source: &str, renames: &[(&str, &str)]) -> String {
    let mut result = String::with_capacity(source.len());
    let mut cursor = 0;
    while cursor < source.len() {
        let byte = source.as_bytes()[cursor];
        if byte.is_ascii_alphabetic() || matches!(byte, b'_' | b'$') {
            let start = cursor;
            cursor += 1;
            while cursor < source.len() && is_identifier_byte(source.as_bytes()[cursor]) {
                cursor += 1;
            }
            let token = &source[start..cursor];
            result.push_str(
                renames
                    .iter()
                    .find_map(|(from, to)| (*from == token).then_some(*to))
                    .unwrap_or(token),
            );
        } else {
            let ch = source[cursor..].chars().next().unwrap();
            result.push(ch);
            cursor += ch.len_utf8();
        }
    }
    result
}

/// The newest minimum below intentionally determines the default Expo runtime
/// requirement. Older helpers retain their real lower bound so custom pipelines can
/// make an informed compatibility decision rather than inheriting one global guess.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct HelperCompatibility {
    pub ordinal: u8,
    pub oxc_name: &'static str,
    pub babel_path: &'static str,
    pub minimum_version: &'static str,
    pub export_shape: &'static str,
    pub semantic_note: &'static str,
}

pub fn babel_helper_spec(name: &str) -> Option<HelperCompatibility> {
    let canonical = match name {
        "awaitAsyncGenerator" => "awaitAsyncGenerator",
        "asyncGeneratorDelegate" => "asyncGeneratorDelegate",
        "asyncIterator" => "asyncIterator",
        "asyncToGenerator" => "asyncToGenerator",
        "wrapAsyncGenerator" => "wrapAsyncGenerator",
        "extends" => "extends",
        "defineProperty" => "defineProperty",
        "objectDestructuringEmpty" => "objectDestructuringEmpty",
        "objectWithoutProperties" => "objectWithoutProperties",
        "objectWithoutPropertiesLoose" => "objectWithoutPropertiesLoose",
        "readOnlyError" => "readOnlyError",
        "writeOnlyError" => "writeOnlyError",
        "taggedTemplateLiteral" => "taggedTemplateLiteral",
        "construct" => "construct",
        "createForOfIteratorHelper" => "createForOfIteratorHelper",
        "get" => "get",
        "slicedToArray" => "slicedToArray",
        "toArray" => "toArray",
        "wrapRegExp" => "wrapRegExp",
        "objectSpread2" => "objectSpread2",
        "classPrivateFieldInitSpec" => "classPrivateFieldInitSpec",
        "classPrivateMethodInitSpec" => "classPrivateMethodInitSpec",
        "classPrivateFieldLooseKey" => "classPrivateFieldLooseKey",
        "classPrivateFieldLooseBase" => "classPrivateFieldLooseBase",
        "toPropertyKey" => "toPropertyKey",
        "checkInRHS" => "checkInRHS",
        "classPrivateFieldGet2" => "classPrivateFieldGet2",
        "classPrivateFieldSet2" => "classPrivateFieldSet2",
        "assertClassBrand" => "assertClassBrand",
        "toSetter" => "toSetter",
        "superPropGet" => "superPropGet",
        "superPropSet" => "superPropSet",
        "usingCtx" => "usingCtx",
        _ => return None,
    };
    let generated = crate::generated::inline_helpers::BABEL_HELPER_COMPATIBILITY
        .binary_search_by(|spec| spec.name.cmp(canonical))
        .ok()
        .map(|index| &crate::generated::inline_helpers::BABEL_HELPER_COMPATIBILITY[index])?;
    Some(HelperCompatibility {
        ordinal: generated.ordinal,
        oxc_name: canonical,
        babel_path: generated.runtime_path,
        minimum_version: generated.min_version,
        export_shape: generated.export_shape,
        semantic_note: "Babel runtime helper ABI",
    })
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuntimeAvailability {
    Runtime,
    Inline,
}

pub struct RuntimeHelperPolicy {
    available: u64,
}

impl RuntimeHelperPolicy {
    pub fn parse(version: Option<&str>) -> Result<Self, String> {
        let version = parse_runtime_version(version)?;
        let compatibility = crate::generated::inline_helpers::BABEL_HELPER_COMPATIBILITY;
        assert!(compatibility.len() <= u64::BITS as usize);
        let mut available = 0_u64;
        for (generated, minimum) in compatibility.iter().zip(generated_minimum_versions()) {
            if version.major == 7 && &version >= minimum {
                available |= 1_u64 << generated.ordinal;
            }
        }
        Ok(Self { available })
    }

    pub fn availability(&self, helper: &str) -> RuntimeAvailability {
        let Some(contract) = babel_helper_spec(helper) else {
            return RuntimeAvailability::Inline;
        };
        self.availability_for(contract)
    }

    pub fn availability_for(&self, contract: HelperCompatibility) -> RuntimeAvailability {
        if self.available & (1_u64 << contract.ordinal) != 0 {
            RuntimeAvailability::Runtime
        } else {
            RuntimeAvailability::Inline
        }
    }

    pub fn all_generated_available(&self) -> bool {
        let count = crate::generated::inline_helpers::BABEL_HELPER_COMPATIBILITY.len();
        let all = if count == u64::BITS as usize {
            u64::MAX
        } else {
            (1_u64 << count) - 1
        };
        self.available == all
    }
}

fn generated_minimum_versions() -> &'static [Version] {
    static MINIMUMS: OnceLock<Vec<Version>> = OnceLock::new();
    MINIMUMS.get_or_init(|| {
        crate::generated::inline_helpers::BABEL_HELPER_COMPATIBILITY
            .iter()
            .enumerate()
            .map(|(ordinal, generated)| {
                assert_eq!(generated.ordinal as usize, ordinal);
                Version::parse(generated.min_version)
                    .expect("generated Babel helper minimum is valid semver")
            })
            .collect()
    })
}

pub fn runtime_availability(
    contract: HelperCompatibility,
    runtime_version: &Version,
) -> RuntimeAvailability {
    let minimum = Version::parse(contract.minimum_version)
        .expect("generated Babel helper minimum is valid semver");
    if runtime_version.major == 7 && runtime_version >= &minimum {
        RuntimeAvailability::Runtime
    } else {
        RuntimeAvailability::Inline
    }
}

pub fn parse_runtime_version(version: Option<&str>) -> Result<Version, String> {
    let version = version.unwrap_or("7.0.0-beta.0");
    if version.is_empty() {
        return Err("helper-runtime-version-invalid:empty".into());
    }
    Version::parse(version).map_err(|_| format!("helper-runtime-version-invalid:{version}"))
}

pub fn compatibility(helper: Helper) -> Option<HelperCompatibility> {
    match helper {
        // NOTE: The decorator prepass materializes collision-safe local helpers,
        // so decorator helpers must never reach the final runtime loader.
        Helper::Decorate | Helper::DecorateParam | Helper::DecorateMetadata => None,
        _ => babel_helper_spec(helper.name()),
    }
}

pub fn compatibility_for_request(
    helper: Helper,
    object_rest_loose: bool,
) -> Option<HelperCompatibility> {
    if object_rest_loose && helper == Helper::ObjectWithoutProperties {
        babel_helper_spec("objectWithoutPropertiesLoose")
    } else {
        compatibility(helper)
    }
}

pub fn validate_runtime_helper_specs(
    helpers: impl IntoIterator<Item = HelperCompatibility>,
    module_name: &str,
    version: Option<&str>,
) -> Result<(), String> {
    let helpers: Vec<_> = helpers.into_iter().collect();
    if helpers.is_empty() {
        return Ok(());
    }
    if module_name != "@babel/runtime" {
        return Err(format!("helper-runtime-module-unsupported:{module_name}"));
    }
    let version = parse_runtime_version(version)?;
    for contract in helpers {
        if runtime_availability(contract, &version) == RuntimeAvailability::Inline {
            return Err(format!(
                "helper-runtime-too-old:{}:{} requires {}",
                module_name, contract.oxc_name, contract.minimum_version,
            ));
        }
    }
    Ok(())
}

pub fn validate_runtime_helpers(
    helpers: impl IntoIterator<Item = Helper>,
    module_name: &str,
    version: Option<&str>,
) -> Result<(), String> {
    validate_runtime_helper_specs(
        helpers
            .into_iter()
            .map(|helper| compatibility(helper).ok_or(helper))
            .collect::<Result<Vec<_>, _>>()
            .map_err(|helper| format!("helper-not-compatible:{}", helper.name()))?,
        module_name,
        version,
    )
}

pub fn validate_custom_runtime_helpers(
    helpers: &[&str],
    module_name: &str,
    version: Option<&str>,
) -> Result<(), String> {
    if helpers.is_empty() {
        return Ok(());
    }
    if module_name != "@babel/runtime" {
        return Err(format!("helper-runtime-module-unsupported:{module_name}"));
    }
    let version = parse_runtime_version(version)?;
    for helper in helpers {
        let minimum = babel_helper_spec(helper)
            .ok_or_else(|| format!("helper-not-compatible:{helper}"))?
            .minimum_version;
        let contract = babel_helper_spec(helper).expect("looked up above");
        if runtime_availability(contract, &version) == RuntimeAvailability::Inline {
            return Err(format!(
                "helper-runtime-too-old:{module_name}:{helper} requires {minimum}",
            ));
        }
    }
    Ok(())
}

pub fn inline_helpers(
    helpers: impl IntoIterator<Item = Helper>,
    selective: bool,
) -> Result<Option<InlineHelpers>, String> {
    let helpers: Vec<Helper> = helpers.into_iter().collect();
    if helpers.is_empty() {
        return Ok(None);
    }
    for helper in &helpers {
        if *helper != Helper::UsingCtx
            && !matches!(
                helper,
                Helper::DefineProperty
                    | Helper::Extends
                    | Helper::ObjectDestructuringEmpty
                    | Helper::ObjectSpread2
                    | Helper::ObjectWithoutProperties
                    | Helper::ToPropertyKey
            )
            && !matches!(
                helper,
                Helper::AwaitAsyncGenerator
                    | Helper::AsyncGeneratorDelegate
                    | Helper::AsyncIterator
                    | Helper::WrapAsyncGenerator
                    | Helper::AsyncToGenerator
            )
            && !matches!(
                helper,
                Helper::ClassPrivateFieldInitSpec
                    | Helper::ClassPrivateMethodInitSpec
                    | Helper::ClassPrivateFieldGet2
                    | Helper::ClassPrivateFieldSet2
                    | Helper::AssertClassBrand
                    | Helper::ToSetter
                    | Helper::ClassPrivateFieldLooseKey
                    | Helper::ClassPrivateFieldLooseBase
                    | Helper::SuperPropGet
                    | Helper::SuperPropSet
                    | Helper::ReadOnlyError
                    | Helper::WriteOnlyError
                    | Helper::CheckInRHS
                    | Helper::TaggedTemplateLiteral
            )
        {
            return Err(format!("inline-helper-not-compatible:{}", helper.name()));
        }
    }
    Ok(Some(InlineHelpers {
        // Kept on one generated line so native source-map adjustment is a single
        // line offset. These implementations follow Babel's helper behavior but
        // are locally scoped and introduce no runtime dependency or global.
        prefix: if !selective {
            let has_async_generator = helpers.iter().any(|helper| {
                matches!(
                    helper,
                    Helper::AwaitAsyncGenerator
                        | Helper::AsyncGeneratorDelegate
                        | Helper::AsyncIterator
                        | Helper::WrapAsyncGenerator
                )
            });
            let has_async = has_async_generator || helpers.contains(&Helper::AsyncToGenerator);
            let has_object = helpers.iter().any(|helper| {
                matches!(
                    helper,
                    Helper::DefineProperty
                        | Helper::Extends
                        | Helper::ObjectDestructuringEmpty
                        | Helper::ObjectSpread2
                        | Helper::ObjectWithoutProperties
                        | Helper::ToPropertyKey
                )
            });
            let has_class = helpers.iter().any(|helper| {
                matches!(
                    helper,
                    Helper::ClassPrivateFieldInitSpec
                        | Helper::ClassPrivateMethodInitSpec
                        | Helper::ClassPrivateFieldGet2
                        | Helper::ClassPrivateFieldSet2
                        | Helper::AssertClassBrand
                        | Helper::ToSetter
                        | Helper::ClassPrivateFieldLooseKey
                        | Helper::ClassPrivateFieldLooseBase
                        | Helper::SuperPropGet
                        | Helper::SuperPropSet
                        | Helper::ReadOnlyError
                        | Helper::WriteOnlyError
                        | Helper::CheckInRHS
                        | Helper::TaggedTemplateLiteral
                )
            });
            let prefixes = [
                has_async.then_some(if has_async_generator {
                    GENERATED_INLINE_ASYNC_HELPERS
                } else {
                    GENERATED_INLINE_ASYNC_TO_GENERATOR
                }),
                helpers
                    .contains(&Helper::UsingCtx)
                    .then_some(GENERATED_INLINE_USING_CTX),
                has_object.then_some(GENERATED_INLINE_OBJECT_HELPERS),
                has_class.then_some(GENERATED_INLINE_CLASS_FEATURE_HELPERS),
            ]
            .into_iter()
            .flatten()
            .collect::<Vec<_>>();
            if prefixes.len() == 1 {
                prefixes[0].into()
            } else {
                format!("Object.assign({})", prefixes.join(","))
            }
        } else {
            let mut names = helpers
                .iter()
                .map(|helper| helper.name())
                .collect::<Vec<_>>();
            names.sort_unstable();
            names.dedup();
            let async_group = names.iter().any(|name| {
                matches!(
                    *name,
                    "awaitAsyncGenerator"
                        | "asyncGeneratorDelegate"
                        | "asyncIterator"
                        | "wrapAsyncGenerator"
                )
            });
            let object_group = names
                .iter()
                .filter(|name| {
                    matches!(
                        **name,
                        "defineProperty"
                            | "extends"
                            | "objectDestructuringEmpty"
                            | "objectSpread2"
                            | "objectWithoutProperties"
                            | "toPropertyKey"
                    )
                })
                .count()
                > 1;
            let class_group = names
                .iter()
                .filter(|name| {
                    matches!(
                        **name,
                        "classPrivateFieldInitSpec"
                            | "classPrivateMethodInitSpec"
                            | "classPrivateFieldGet2"
                            | "classPrivateFieldSet2"
                            | "assertClassBrand"
                            | "toSetter"
                            | "classPrivateFieldLooseKey"
                            | "classPrivateFieldLooseBase"
                            | "superPropGet"
                            | "superPropSet"
                            | "readOnlyError"
                            | "writeOnlyError"
                            | "checkInRHS"
                            | "taggedTemplateLiteral"
                    )
                })
                .count()
                > 1;
            let mut prefixes = async_group
                .then_some(GENERATED_INLINE_ASYNC_HELPERS)
                .into_iter()
                .collect::<Vec<_>>();
            prefixes.extend(object_group.then_some(GENERATED_INLINE_OBJECT_HELPERS));
            prefixes.extend(class_group.then_some(GENERATED_INLINE_CLASS_FEATURE_HELPERS));
            prefixes.extend(
                names
                    .into_iter()
                    .filter(|name| {
                        (!async_group
                            || !matches!(
                                *name,
                                "awaitAsyncGenerator"
                                    | "asyncGeneratorDelegate"
                                    | "asyncIterator"
                                    | "wrapAsyncGenerator"
                                    | "asyncToGenerator"
                            ))
                            && (!object_group
                                || !matches!(
                                    *name,
                                    "defineProperty"
                                        | "extends"
                                        | "objectDestructuringEmpty"
                                        | "objectSpread2"
                                        | "objectWithoutProperties"
                                        | "toPropertyKey"
                                ))
                            && (!class_group
                                || !matches!(
                                    *name,
                                    "classPrivateFieldInitSpec"
                                        | "classPrivateMethodInitSpec"
                                        | "classPrivateFieldGet2"
                                        | "classPrivateFieldSet2"
                                        | "assertClassBrand"
                                        | "toSetter"
                                        | "classPrivateFieldLooseKey"
                                        | "classPrivateFieldLooseBase"
                                        | "superPropGet"
                                        | "superPropSet"
                                        | "readOnlyError"
                                        | "writeOnlyError"
                                        | "checkInRHS"
                                        | "taggedTemplateLiteral"
                                ))
                    })
                    .map(|name| {
                        crate::generated::inline_helpers::BABEL_INLINE_ROOTS
                            .iter()
                            .find(|root| root.name == name)
                            .expect("reachable helper has a generated inline root")
                            .compact
                    }),
            );
            if prefixes.len() == 1 {
                prefixes[0].into()
            } else {
                format!("Object.assign({})", prefixes.join(","))
            }
        },
    }))
}

pub struct InlineHelpers {
    pub prefix: String,
}

pub(super) struct SourceNameReservations {
    names: FxHashSet<String>,
}

// This conservative reservation scan may include strings and comments. Decode
// identifier escapes before scanning so spellings cannot evade reservations.
fn decode_identifier_escapes(source: &str) -> String {
    let mut out = String::with_capacity(source.len());
    let mut rest = source;
    while !rest.is_empty() {
        if let Some(escape) = rest.strip_prefix("\\u") {
            let digits = if let Some(braced) = escape.strip_prefix('{') {
                braced.find('}').map(|end| (&braced[..end], end + 4))
            } else {
                escape.get(..4).map(|digits| (digits, 6))
            };
            if let Some((digits, len)) = digits
                && let Ok(value) = u32::from_str_radix(digits, 16)
                && let Some(character) = char::from_u32(value)
            {
                out.push(character);
                rest = &rest[len..];
                continue;
            }
        }
        let character = rest.chars().next().unwrap();
        out.push(character);
        rest = &rest[character.len_utf8()..];
    }
    out
}

impl SourceNameReservations {
    pub(super) fn new(source: &str) -> Self {
        let decoded;
        let source = if source.contains("\\u") {
            decoded = decode_identifier_escapes(source);
            &decoded
        } else {
            source
        };
        let names = source
            .split(|character: char| !oxc_syntax::identifier::is_identifier_part(character))
            .filter(|name| !name.is_empty())
            .map(str::to_owned)
            .collect();
        Self { names }
    }

    pub(super) fn reserve(&mut self, base: &str) -> String {
        for suffix in 1.. {
            let candidate = if suffix == 1 {
                base.to_owned()
            } else {
                format!("{base}{suffix}")
            };
            if self.names.insert(candidate.clone()) {
                return candidate;
            }
        }
        unreachable!()
    }

    pub(super) fn include(&mut self, names: impl IntoIterator<Item = String>) {
        self.names.extend(names);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const REACHABLE: [Helper; 26] = [
        Helper::AwaitAsyncGenerator,
        Helper::AsyncGeneratorDelegate,
        Helper::AsyncIterator,
        Helper::AsyncToGenerator,
        Helper::ObjectSpread2,
        Helper::WrapAsyncGenerator,
        Helper::Extends,
        Helper::ObjectDestructuringEmpty,
        Helper::ObjectWithoutProperties,
        Helper::ToPropertyKey,
        Helper::DefineProperty,
        Helper::ClassPrivateFieldInitSpec,
        Helper::ClassPrivateMethodInitSpec,
        Helper::ClassPrivateFieldGet2,
        Helper::ClassPrivateFieldSet2,
        Helper::AssertClassBrand,
        Helper::ToSetter,
        Helper::ClassPrivateFieldLooseKey,
        Helper::ClassPrivateFieldLooseBase,
        Helper::SuperPropGet,
        Helper::SuperPropSet,
        Helper::ReadOnlyError,
        Helper::WriteOnlyError,
        Helper::CheckInRHS,
        Helper::UsingCtx,
        Helper::TaggedTemplateLiteral,
    ];

    #[test]
    fn every_reachable_helper_has_a_babel_contract() {
        for helper in REACHABLE {
            let contract = compatibility(helper).unwrap();
            assert_eq!(contract.oxc_name, helper.name());
            assert_eq!(contract.babel_path, helper.name());
            assert_eq!(contract.export_shape, "default");
        }
    }

    #[test]
    fn generated_helper_ordinals_are_dense_and_fit_the_policy_mask() {
        let compatibility = crate::generated::inline_helpers::BABEL_HELPER_COMPATIBILITY;
        assert!(compatibility.len() <= u64::BITS as usize);
        for (ordinal, helper) in compatibility.iter().enumerate() {
            assert_eq!(helper.ordinal as usize, ordinal);
        }
        assert!(
            RuntimeHelperPolicy::parse(Some("7.29.7"))
                .unwrap()
                .all_generated_available()
        );
    }

    #[test]
    fn ordinary_async_inline_helper_excludes_async_generator_runtime() {
        let helpers = inline_helpers([Helper::AsyncToGenerator], false)
            .unwrap()
            .unwrap();
        assert!(helpers.prefix.contains("asyncToGenerator"));
        assert!(!helpers.prefix.contains("wrapAsyncGenerator"));
    }

    #[test]
    fn selective_helpers_share_category_dependency_graphs() {
        let class_helpers = inline_helpers(
            [Helper::ClassPrivateFieldGet2, Helper::ClassPrivateFieldSet2],
            true,
        )
        .unwrap()
        .unwrap();
        assert_eq!(class_helpers.prefix, GENERATED_INLINE_CLASS_FEATURE_HELPERS);

        let object_helpers = inline_helpers(
            [Helper::ObjectSpread2, Helper::ObjectWithoutProperties],
            true,
        )
        .unwrap()
        .unwrap();
        assert_eq!(object_helpers.prefix, GENERATED_INLINE_OBJECT_HELPERS);
    }

    #[test]
    fn runtime_versions_are_checked_per_helper() {
        assert!(
            validate_runtime_helpers([Helper::UsingCtx], "@babel/runtime", Some("7.29.2")).is_ok()
        );
        assert_eq!(
            validate_runtime_helpers([Helper::UsingCtx], "@babel/runtime", Some("7.23.8")),
            Err("helper-runtime-too-old:@babel/runtime:usingCtx requires 7.23.9".into())
        );
        assert!(
            validate_runtime_helpers([Helper::AsyncToGenerator], "@babel/runtime", None).is_ok()
        );
        assert_eq!(
            validate_runtime_helpers([Helper::AsyncToGenerator], "custom-runtime", Some("7.29.7")),
            Err("helper-runtime-module-unsupported:custom-runtime".into())
        );
    }

    #[test]
    fn structural_helpers_share_central_version_metadata() {
        for name in [
            "construct",
            "extends",
            "get",
            "objectDestructuringEmpty",
            "objectWithoutProperties",
            "objectWithoutPropertiesLoose",
            "readOnlyError",
            "slicedToArray",
            "toArray",
            "toPropertyKey",
            "wrapRegExp",
        ] {
            let spec = babel_helper_spec(name).unwrap();
            let accepted = spec.minimum_version;
            assert!(
                validate_custom_runtime_helpers(&[name], "@babel/runtime", Some(accepted)).is_ok()
            );
            if spec.minimum_version != "7.0.0-beta.0" {
                assert!(
                    validate_custom_runtime_helpers(
                        &[name],
                        "@babel/runtime",
                        Some("7.0.0-beta.0")
                    )
                    .is_err()
                );
            }
        }
    }

    #[test]
    fn expo_7_20_fallback_set_matches_pinned_babel_metadata() {
        let version = Version::parse("7.20.0").unwrap();
        let unavailable = [
            "checkInRHS",
            "usingCtx",
            "classPrivateFieldGet2",
            "classPrivateFieldSet2",
            "assertClassBrand",
            "toSetter",
            "superPropGet",
            "superPropSet",
        ];
        for name in unavailable {
            assert_eq!(
                runtime_availability(babel_helper_spec(name).unwrap(), &version),
                RuntimeAvailability::Inline,
                "{name}"
            );
        }
        assert_eq!(
            runtime_availability(babel_helper_spec("asyncToGenerator").unwrap(), &version),
            RuntimeAvailability::Runtime
        );
    }

    #[test]
    fn exact_versions_preserve_prerelease_and_reject_ranges() {
        assert_eq!(
            parse_runtime_version(Some("7.23.9-beta.0"))
                .unwrap()
                .pre
                .as_str(),
            "beta.0"
        );
        for invalid in ["", "^7.20.0", "7.20", "v7.20.0", "not-semver"] {
            assert!(parse_runtime_version(Some(invalid)).is_err(), "{invalid}");
        }
    }

    #[test]
    fn generated_materializer_renames_and_reserves_every_binding() {
        use crate::generated::inline_helpers::INLINE_EXTENDS_HELPER_DESCRIPTOR;

        let mut requests = CustomHelperRequests::default();
        requests.materialize_generated(
            &INLINE_EXTENDS_HELPER_DESCRIPTOR,
            true,
            &[("_extends", "_extends3")],
        );
        assert_eq!(requests.names, FxHashSet::from_iter(["extends"]));
        assert!(requests.scope_names.contains("_extends3"));
        requests.materialize_generated(
            &INLINE_EXTENDS_HELPER_DESCRIPTOR,
            true,
            &[("_extends", "_extends3")],
        );
        let mut names = Vec::new();
        let mut fragments = Vec::new();
        requests.extend_into(&mut names, &mut fragments, false, None);
        assert_eq!(fragments.len(), 1);
        assert!(fragments[0].contains("_extends3"));
        assert!(!contains_identifier_token(&fragments[0], "_extends"));
    }

    #[test]
    fn every_custom_helper_has_a_rationale_and_behavioral_test() {
        for helper in [
            CustomHelper::IteratorResult,
            CustomHelper::LegacyDecorate,
            CustomHelper::LegacyDecorateParam,
        ] {
            let spec = custom_helper_spec(helper);
            assert!(!spec.owner.is_empty());
            assert!(!spec.rationale.is_empty());
            assert!(!spec.behavioral_tests.is_empty());
        }
    }

    #[test]
    fn inline_materializer_composes_helper_families_without_dependencies() {
        let inline = inline_helpers(
            [
                Helper::AsyncToGenerator,
                Helper::DefineProperty,
                Helper::UsingCtx,
            ],
            false,
        )
        .unwrap()
        .unwrap();
        assert!(inline.prefix.starts_with("Object.assign("));
        assert!(inline.prefix.contains("asyncToGenerator"));
        assert!(inline.prefix.contains("defineProperty"));
        assert!(inline.prefix.contains("usingCtx"));
        assert!(!inline.prefix.contains("require("));
    }
}
