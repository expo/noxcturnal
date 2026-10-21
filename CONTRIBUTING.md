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

Keep the automation behind these existing surfaces:

- `package.json` scripts — repository verification through `pnpm check`
- `scripts/native.mjs` — native build, smoke test, and materialization
- `scripts/native-lib.mjs` — shared internal native metadata
- `scripts/check-package.mjs` — package integrity and pack tests
- `scripts/release.mjs` — workflow-only Changesets operations
- `scripts/native-targets.json` — the single platform matrix

Prefer an existing npm command or a subcommand on one of these files. Avoid
single-use wrappers and do not repeat validation steps in workflow YAML. Pin new
tools in the flake and third-party GitHub Actions to full commit SHAs.
