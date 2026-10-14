Vendored from crates.io oxc_transformer 0.141.0. Original MIT license retained.
Noxcturnal patches the pinned transformer to repair constructor initialization and exponentiation assignment.

Original crates.io archive SHA-256: `3481b17ea50d4866901de759f736aa2c63bfca1fb6a20a67faa423f5361429e9`.

Provenance: upstream commit `14533a3dc118bea73e755426aaf35f71dbe81eb8`,
`crates/oxc_transformer`. LICENSE was retrieved from that commit's repository root
because the published crate archive omits the license file.

Local patches:

- `typescript/class.rs`: initialize parameter properties and loose fields after a
  successful try-wrapped or conditional super call. Keep one initializer AST and
  reparent its scopes instead of cloning reference/scope identities.
- `es2016/exponentiation_operator.rs`: capture computed receivers and keys while
  constructing assignment references; memoize allocated RegExp keys; isolate
  parameter-initializer temporaries with the existing arrow-IIFE scope builder.

Keep Rust and npm Oxc versions pinned together. Reassess these patches against the
upstream implementation before any upgrade; archived regressions define the repair
contracts and accepted Babel compatibility boundaries.
