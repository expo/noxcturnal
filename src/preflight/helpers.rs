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

    pub(super) fn request(&mut self, name: &'static str) {
        self.names.insert(name);
    }

    pub(super) fn push_fragment(&mut self, compact: String, pretty: String) {
        self.fragments.push((compact, pretty));
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

pub const fn compatibility(helper: Helper) -> Option<HelperCompatibility> {
    let (minimum_version, semantic_note) = match helper {
        Helper::AwaitAsyncGenerator
        | Helper::AsyncGeneratorDelegate
        | Helper::AsyncIterator
        | Helper::AsyncToGenerator
        | Helper::WrapAsyncGenerator => ((7, 0, 0), "Babel async helper ABI"),
        Helper::Extends
        | Helper::ObjectDestructuringEmpty
        | Helper::ObjectWithoutProperties
        | Helper::DefineProperty
        | Helper::ReadOnlyError
        | Helper::WriteOnlyError
        | Helper::TaggedTemplateLiteral => ((7, 0, 0), "Babel helper ABI"),
        Helper::ObjectSpread2 => ((7, 5, 0), "Babel object spread evaluation order"),
        Helper::ClassPrivateFieldInitSpec
        | Helper::ClassPrivateMethodInitSpec
        | Helper::ClassPrivateFieldLooseKey
        | Helper::ClassPrivateFieldLooseBase => ((7, 10, 0), "Babel private-field ABI"),
        Helper::ToPropertyKey | Helper::CheckInRHS => ((7, 22, 0), "Babel property-key ABI"),
        Helper::ClassPrivateFieldGet2
        | Helper::ClassPrivateFieldSet2
        | Helper::AssertClassBrand
        | Helper::ToSetter
        | Helper::SuperPropGet
        | Helper::SuperPropSet => ((7, 24, 0), "Babel 7.24 class-feature ABI"),
        Helper::UsingCtx => ((7, 28, 0), "Babel explicit-resource-management ABI"),
        // Decorators are rejected before transformation, so these helpers must never
        // be reachable from a supported preflight transform set.
        Helper::Decorate | Helper::DecorateParam | Helper::DecorateMetadata => return None,
    };
    Some(HelperCompatibility {
        oxc_name: helper.name(),
        babel_path: helper.name(),
        minimum_version,
        export_shape: "default",
        semantic_note,
    })
}

pub fn validate_runtime_helpers(
    helpers: impl IntoIterator<Item = Helper>,
    module_name: &str,
    version: Option<&str>,
) -> Result<(), String> {
    let helpers: Vec<Helper> = helpers.into_iter().collect();
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
        let contract = compatibility(helper)
            .ok_or_else(|| format!("helper-not-compatible:{}", helper.name()))?;
        if version < contract.minimum_version {
            return Err(format!(
                "helper-runtime-too-old:{}:{} requires {}.{}.{}",
                module_name,
                helper.name(),
                contract.minimum_version.0,
                contract.minimum_version.1,
                contract.minimum_version.2,
            ));
        }
    }
    Ok(())
}

/// The `var _<helper>` prelude markers a rewrite prints for a custom (non-Oxc)
/// helper, paired with the runtime helper names each stands for.
const HELPER_ADAPTERS: [(&str, &[&str]); 7] = [
    ("var _toArray", &["slicedToArray", "toArray"]),
    (
        "var _objectDestructuringEmpty",
        &["objectDestructuringEmpty"],
    ),
    (
        "var _objectWithoutProperties",
        &[
            "objectDestructuringEmpty",
            "objectWithoutProperties",
            "objectWithoutPropertiesLoose",
        ],
    ),
    ("var _construct", &["construct"]),
    ("var _get", &["get"]),
    (
        "var _classPrivateFieldLooseBase",
        &["classPrivateFieldLooseBase"],
    ),
    ("var _wrapRegExp", &["wrapRegExp"]),
];

/// Which helper-adapter markers the original source already carries, so the
/// caller can answer "introduced by the transform" without retaining a whole
/// clone of the source purely for a handful of `contains` checks.
pub fn helper_adapter_markers(source: &str) -> [bool; HELPER_ADAPTERS.len()] {
    std::array::from_fn(|index| source.contains(HELPER_ADAPTERS[index].0))
}

/// Custom helpers the transform introduced: a marker present in `after` whose
/// slot in `before_present` (from [`helper_adapter_markers`] over the original
/// source) was false.
pub fn custom_helpers_introduced(
    before_present: &[bool; HELPER_ADAPTERS.len()],
    after: &str,
) -> Vec<&'static str> {
    let mut helpers = Vec::new();
    for (index, (marker, names)) in HELPER_ADAPTERS.iter().enumerate() {
        if after.contains(marker) && !before_present[index] {
            helpers.extend(names.iter().copied().filter(|name| {
                after.contains(&format!("@babel/runtime/helpers/{name}"))
                    || !after.contains("require(\"@babel/runtime/helpers/")
            }));
        }
    }
    helpers.sort_unstable();
    helpers.dedup();
    helpers
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
        let minimum = match *helper {
            "classPrivateFieldLooseBase" => (7, 10, 0),
            "construct"
            | "extends"
            | "get"
            | "objectDestructuringEmpty"
            | "objectWithoutProperties"
            | "objectWithoutPropertiesLoose"
            | "readOnlyError"
            | "toPropertyKey"
            | "slicedToArray"
            | "toArray"
            | "wrapRegExp" => (7, 0, 0),
            _ => return Err(format!("helper-not-compatible:{helper}")),
        };
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
    let mut binding = "babelHelpers".to_string();
    let mut suffix = 2;
    while source.contains(&binding) {
        binding = format!("babelHelpers{suffix}");
        suffix += 1;
    }
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
