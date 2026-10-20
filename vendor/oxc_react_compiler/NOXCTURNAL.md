Read this when compiler integration in this tree behaves differently from upstream.
The bullets name the file that holds each repair. Open that file and confirm the
repair is still there before you edit it or treat the bullet as a diff.

Vendored `oxc_react_compiler`, pinned at 0.143.0 and selected by `[patch.crates-io]`.
`UPSTREAM_REVISION` records `oxc-project/oxc` tag `crates_v0.154.0` (`d47efe5`).
MIT license retained.

The note below was first written against crates.io 0.141.0
(archive SHA-256 `7d2dd0c52fb4e90464605951b18a14efb525f7f6ea0ca0b811ecc5d167983962`,
upstream commit `14533a3dc118bea73e755426aaf35f71dbe81eb8`). `aab6d77` and `8144347`
moved the tree forward. Upstream fixtures and snapshot tests are omitted and
their Cargo test targets removed; repository alignment and React renderer
regressions cover the integration patches.

Keep Rust and npm Oxc versions pinned together. Reassess local compiler diagnostics,
selection, and source-cache invalidation patches against upstream before upgrades.

Local patches:

- `lib.rs`: expose fatal compilation status independently from diagnostic severity;
  preserve the existing diagnostic-returning API for lint consumers.
- `entrypoint/program.rs`: match lexical directive values rather than cooked strings.
- `entrypoint/pipeline.rs`: stop unsupported lowering before partial HIR reaches
  inference; propagate the optional source fingerprint to code generation.
- `entrypoint/imports.rs`, `environment.rs`, and `codegen_reactive_function.rs`:
  fingerprint source once per file with existing SHA1 infrastructure; reserve one
  fixed memo slot and clear memo values when the fingerprint changes. This is
  a change detector, not a security hash. Disabled mode emits no additional code.

The Nix Cargo vendor hash changes because this crate now resolves locally. The
existing native fingerprint and Nix source fileset already include all `vendor/`.
