Vendored crates.io `oxc_react_compiler` 0.141.0, MIT license retained.

Archive SHA-256: `7d2dd0c52fb4e90464605951b18a14efb525f7f6ea0ca0b811ecc5d167983962`.
Upstream commit: `14533a3dc118bea73e755426aaf35f71dbe81eb8`,
`crates/oxc_react_compiler`. All source files were verified byte for byte against
that registry archive before local patches. Upstream fixtures/snapshot tests are
omitted and their explicit Cargo test targets removed; repository alignment and
actual React renderer regressions cover the integration patches.

Keep Rust and npm Oxc versions pinned together. Reassess local compiler diagnostics,
selection, and source-cache invalidation patches against upstream before upgrades.
