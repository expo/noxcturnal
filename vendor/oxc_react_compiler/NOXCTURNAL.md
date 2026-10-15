Vendored crates.io `oxc_react_compiler` 0.141.0, MIT license retained.

Archive SHA-256: `7d2dd0c52fb4e90464605951b18a14efb525f7f6ea0ca0b811ecc5d167983962`.
Upstream commit: `14533a3dc118bea73e755426aaf35f71dbe81eb8`,
`crates/oxc_react_compiler`. All source files were verified byte for byte against
that registry archive before local patches. Upstream fixtures/snapshot tests are
omitted and their explicit Cargo test targets removed; repository alignment and
actual React renderer regressions cover the integration patches.

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
