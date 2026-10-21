# Contributing to Noxcturnal

Noxcturnal is a Rust-backed TypeScript library. Rust owns parsing and native
transforms; TypeScript owns the public API, pipeline composition, visitors, and
npm package surface. Keep behavior on the side that owns it.

## Setup

Use the pinned Nix environment:

```sh
nix develop
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
```

`pnpm build` creates a debug native addon for the current host and builds the
JavaScript distribution. Tests detect missing, stale, or wrong-host addons and
ask you to rebuild.

## Common commands

```sh
pnpm build            # debug native addon and JavaScript
pnpm build:release    # host release addon and JavaScript
pnpm test             # JavaScript/runtime tests
cargo test --workspace # native addon and Hermes crate tests
pnpm check:types      # TypeScript contracts
pnpm format           # JavaScript, TypeScript, and Rust formatting
nix fmt               # Nix formatting
pnpm check            # complete pre-commit verification
```

Use focused commands while iterating, then run `pnpm check` before handoff.
Generated protocol files must be changed through their generators; run
`pnpm codegen` and verify them with `pnpm codegen:check`.

## Updating Hermes

The flake pins Hermes as a source input so Nix builds do not depend on special
submodule-aware flake invocation. The Git submodule remains the normal source
for development outside Nix builds; keep the two revisions aligned when updating
Hermes.

## CI and changesets

Pull requests and `main` run the same Nix-backed `pnpm check`. Add a changeset
for every user-visible change:

```sh
pnpm changeset
```

## Maintaining automation

`package.json` owns command composition, including `pnpm check`. The remaining
files in `scripts/` implement these active build and release jobs:

| File                                     | Caller and purpose                                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `sync-oxc-event-schema.mjs`              | `pnpm codegen`: reconciles the event schema with the pinned Rust AST and npm types.                                           |
| `generate-event-schema.mjs`              | `pnpm codegen`: emits matching Rust/TypeScript event tables and node predicates.                                              |
| `generate-estree-schema.mjs`             | `pnpm codegen`: derives the Flow eraser's Rust schema from the pinned Hermes `ESTree.def`.                                    |
| `generate-inline-helpers.mjs`            | `pnpm codegen`: builds helper fragments and ABI metadata from the pinned Babel runtime.                                       |
| `generate-regexp-unicode-properties.mjs` | `pnpm codegen`: emits Unicode property ranges used by native RegExp lowering.                                                 |
| `rollup.config.mjs`                      | `pnpm build:js`: bundles the public CommonJS, ESM, and declaration entry points.                                              |
| `native.mjs`                             | Build/test commands and release workflow: builds, validates, smoke-tests, and stages native addons.                           |
| `native-lib.mjs`                         | Native and package/release tooling: shares target lookup, fingerprints, and artifact validation.                              |
| `native-targets.json`                    | Native tooling and Nix: the shared platform/package matrix.                                                                   |
| `check-package.mjs`                      | `pnpm package:check` and packing/publishing hooks: validates package contents and native artifact integrity.                  |
| `release.mjs`                            | Release workflow and publishing hooks: coordinates Changesets and verifies publication authorization.                         |
| `changelog.cjs`                          | `.changeset/config.json`: formats release/dependency notes and GitHub references.                                             |
| `prepare.mjs`                            | Package `prepare` hook: installs the local pre-commit hook that formats staged files. Setup with `--ignore-scripts` skips it. |

Each generator supports `--check`; `pnpm codegen:check` verifies all generated
outputs without writing them. Historical revision-comparison and benchmark
scripts are not part of this maintained automation.

Prefer an existing npm command or a subcommand on the owning script. Avoid
single-use wrappers and do not repeat validation steps in workflow YAML. Pin new
tools in the flake and third-party GitHub Actions to full commit SHAs.
