//! Compatibility contract between Oxc 0.141 helper requests and Babel runtime.

use oxc_transformer::Helper;
use rustc_hash::FxHashSet;

use crate::generated::inline_helpers::{
    INLINE_ASYNC_HELPERS as GENERATED_INLINE_ASYNC_HELPERS,
    INLINE_ASYNC_TO_GENERATOR as GENERATED_INLINE_ASYNC_TO_GENERATOR,
    INLINE_OBJECT_HELPERS as GENERATED_INLINE_OBJECT_HELPERS,
    INLINE_OXC_CLASS_FEATURE_HELPERS as GENERATED_INLINE_CLASS_FEATURE_HELPERS,
    INLINE_USING_CTX as GENERATED_INLINE_USING_CTX,
};

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
    scope_names: FxHashSet<String>,
}

impl CustomHelperRequests {
    pub(super) fn is_empty(&self) -> bool {
        self.names.is_empty() && self.fragments.is_empty() && self.scope_names.is_empty()
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
        descriptor: &GeneratedHelperFragment,
        inline: bool,
        renames: &[(&str, &str)],
    ) {
        let (compact, pretty, bindings) = if inline {
            (
                descriptor.inline_compact,
                descriptor.inline_pretty,
                descriptor.inline_bindings,
            )
        } else {
            (
                descriptor.runtime_compact,
                descriptor.runtime_pretty,
                descriptor.runtime_bindings,
            )
        };
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
        let rewrite = |source: &str| replace_identifier_tokens(source, renames);
        let compact = rewrite(compact);
        let pretty = rewrite(pretty);
        for binding in bindings.iter().filter(|binding| {
            renames
                .iter()
                .any(|(from, to)| from == *binding && from != to)
        }) {
            assert!(
                !contains_identifier_token(&compact, binding),
                "unreplaced generated binding {binding}"
            );
        }
        self.names.extend(descriptor.babel_dependencies);
        self.scope_names
            .extend(renames.iter().map(|(_, to)| (*to).to_owned()));
        if !self
            .fragments
            .iter()
            .any(|(existing, _)| existing == &compact)
        {
            self.fragments.push((compact, pretty));
        }
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
        other.fragments.append(&mut self.fragments);
        self.fragments = other.fragments;
    }

    pub(super) fn extend_into(
        self,
        target: &mut Vec<&'static str>,
        fragments: &mut Vec<String>,
        compact: bool,
    ) {
        target.extend(self.names);
        target.sort_unstable();
        target.dedup();
        fragments.extend(
            self.fragments
                .into_iter()
                .map(|(compact_source, pretty_source)| {
                    if compact {
                        compact_source
                    } else {
                        pretty_source
                    }
                }),
        );
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
    pub oxc_name: &'static str,
    pub babel_path: &'static str,
    pub minimum_version: (u32, u32, u32),
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
    let minimum_version = match canonical {
        "awaitAsyncGenerator"
        | "asyncGeneratorDelegate"
        | "asyncIterator"
        | "asyncToGenerator"
        | "wrapAsyncGenerator"
        | "extends"
        | "defineProperty"
        | "objectDestructuringEmpty"
        | "objectWithoutProperties"
        | "readOnlyError"
        | "writeOnlyError"
        | "taggedTemplateLiteral"
        | "construct"
        | "get"
        | "slicedToArray"
        | "toArray"
        | "wrapRegExp"
        | "objectWithoutPropertiesLoose" => (7, 0, 0),
        "objectSpread2" => (7, 5, 0),
        "classPrivateFieldInitSpec"
        | "classPrivateMethodInitSpec"
        | "classPrivateFieldLooseKey"
        | "classPrivateFieldLooseBase" => (7, 10, 0),
        "toPropertyKey" | "checkInRHS" => (7, 22, 0),
        "classPrivateFieldGet2"
        | "classPrivateFieldSet2"
        | "assertClassBrand"
        | "toSetter"
        | "superPropGet"
        | "superPropSet" => (7, 24, 0),
        "usingCtx" => (7, 28, 0),
        _ => unreachable!(),
    };
    Some(HelperCompatibility {
        oxc_name: canonical,
        babel_path: canonical,
        minimum_version,
        export_shape: "default",
        semantic_note: "Babel runtime helper ABI",
    })
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
    let version = version
        .and_then(parse_version)
        .ok_or_else(|| "helper-runtime-version-required".to_string())?;
    for contract in helpers {
        if version < contract.minimum_version {
            return Err(format!(
                "helper-runtime-too-old:{}:{} requires {}.{}.{}",
                module_name,
                contract.oxc_name,
                contract.minimum_version.0,
                contract.minimum_version.1,
                contract.minimum_version.2,
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
    let version = version
        .and_then(parse_version)
        .ok_or_else(|| "helper-runtime-version-required".to_string())?;
    for helper in helpers {
        let minimum = babel_helper_spec(helper)
            .ok_or_else(|| format!("helper-not-compatible:{helper}"))?
            .minimum_version;
        if version < minimum {
            return Err(format!(
                "helper-runtime-too-old:{module_name}:{helper} requires {}.{}.{}",
                minimum.0, minimum.1, minimum.2
            ));
        }
    }
    Ok(())
}

pub fn inline_helpers(
    helpers: impl IntoIterator<Item = Helper>,
    source: &str,
) -> Result<Option<InlineHelpers>, String> {
    let helpers: Vec<Helper> = helpers.into_iter().collect();
    if helpers.is_empty() {
        return Ok(None);
    }
    let has_using_ctx = helpers.contains(&Helper::UsingCtx);
    let has_object_helpers = helpers.iter().any(|helper| {
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
    let has_async = helpers.iter().any(|helper| {
        matches!(
            helper,
            Helper::AwaitAsyncGenerator
                | Helper::AsyncGeneratorDelegate
                | Helper::AsyncIterator
                | Helper::WrapAsyncGenerator
                | Helper::AsyncToGenerator
        )
    });
    let has_class_feature_helpers = helpers.iter().any(|helper| {
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
    let async_to_generator_only = has_async
        && helpers.iter().all(|helper| {
            !matches!(
                helper,
                Helper::AwaitAsyncGenerator
                    | Helper::AsyncGeneratorDelegate
                    | Helper::AsyncIterator
                    | Helper::WrapAsyncGenerator
            )
        });
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
    let binding = SourceNameReservations::new(source).reserve("babelHelpers");
    Ok(Some(InlineHelpers {
        binding,
        // Kept on one generated line so native source-map adjustment is a single
        // line offset. These implementations follow Babel's helper behavior but
        // are locally scoped and introduce no runtime dependency or global.
        prefix: {
            let prefixes = [
                has_async.then_some(if async_to_generator_only {
                    GENERATED_INLINE_ASYNC_TO_GENERATOR
                } else {
                    GENERATED_INLINE_ASYNC_HELPERS
                }),
                has_using_ctx.then_some(GENERATED_INLINE_USING_CTX),
                has_object_helpers.then_some(GENERATED_INLINE_OBJECT_HELPERS),
                has_class_feature_helpers.then_some(GENERATED_INLINE_CLASS_FEATURE_HELPERS),
            ]
            .into_iter()
            .flatten()
            .collect::<Vec<_>>();
            if prefixes.len() == 1 {
                prefixes[0].into()
            } else {
                format!("Object.assign({})", prefixes.join(","))
            }
        },
    }))
}

pub struct InlineHelpers {
    pub binding: String,
    pub prefix: String,
}

fn parse_version(value: &str) -> Option<(u32, u32, u32)> {
    let value = value.strip_prefix('v').unwrap_or(value);
    let core = value.split_once('-').map_or(value, |(core, _)| core);
    let mut parts = core.split('.');
    let major = parts.next()?.parse().ok()?;
    let minor = parts.next().unwrap_or("0").parse().ok()?;
    let patch = parts.next().unwrap_or("0").parse().ok()?;
    Some((major, minor, patch))
}

pub(super) struct SourceNameReservations {
    names: FxHashSet<String>,
}

impl SourceNameReservations {
    pub(super) fn new(source: &str) -> Self {
        let names = source
            .split(|character: char| {
                !(character.is_ascii_alphanumeric() || matches!(character, '_' | '$'))
            })
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
    fn ordinary_async_inline_helper_excludes_async_generator_runtime() {
        let helpers = inline_helpers([Helper::AsyncToGenerator], "")
            .unwrap()
            .unwrap();
        assert!(helpers.prefix.contains("asyncToGenerator"));
        assert!(!helpers.prefix.contains("wrapAsyncGenerator"));
        assert!(helpers.prefix.len() < GENERATED_INLINE_ASYNC_HELPERS.len() / 2);
    }

    #[test]
    fn runtime_versions_are_checked_per_helper() {
        assert!(
            validate_runtime_helpers([Helper::UsingCtx], "@babel/runtime", Some("7.29.2")).is_ok()
        );
        assert_eq!(
            validate_runtime_helpers([Helper::UsingCtx], "@babel/runtime", Some("7.27.0")),
            Err("helper-runtime-too-old:@babel/runtime:usingCtx requires 7.28.0".into())
        );
        assert_eq!(
            validate_runtime_helpers([Helper::AsyncToGenerator], "@babel/runtime", None),
            Err("helper-runtime-version-required".into())
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
            let accepted = format!(
                "{}.{}.{}",
                spec.minimum_version.0, spec.minimum_version.1, spec.minimum_version.2
            );
            assert!(
                validate_custom_runtime_helpers(&[name], "@babel/runtime", Some(&accepted)).is_ok()
            );
            if spec.minimum_version != (7, 0, 0) {
                let rejected = format!(
                    "{}.{}.{}",
                    spec.minimum_version.0,
                    spec.minimum_version.1 - 1,
                    spec.minimum_version.2
                );
                assert!(
                    validate_custom_runtime_helpers(&[name], "@babel/runtime", Some(&rejected))
                        .is_err()
                );
            }
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
        assert!(requests.fragments[0].0.contains("_extends3"));
        assert!(!contains_identifier_token(
            &requests.fragments[0].0,
            "_extends"
        ));
        requests.materialize_generated(
            &INLINE_EXTENDS_HELPER_DESCRIPTOR,
            true,
            &[("_extends", "_extends3")],
        );
        assert_eq!(requests.fragments.len(), 1);
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
            "var babelHelpers = 1;",
        )
        .unwrap()
        .unwrap();
        assert_eq!(inline.binding, "babelHelpers2");
        assert!(inline.prefix.starts_with("Object.assign("));
        assert!(inline.prefix.contains("asyncToGenerator"));
        assert!(inline.prefix.contains("defineProperty"));
        assert!(inline.prefix.contains("usingCtx"));
        assert!(!inline.prefix.contains("require("));
    }
}
