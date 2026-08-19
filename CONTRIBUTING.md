# Contributing to Noxcturnal

Noxcturnal is a Rust-backed TypeScript library. Rust owns parsing and native
transforms; TypeScript owns the public API, pipeline composition, visitors, and
npm package surface. Keep behavior on the side that owns it.

## Setup

Use the pinned Nix environment:

```sh
nix develop
pnpm install --offline --frozen-lockfile --ignore-scripts
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
cargo test            # native tests
pnpm check:types      # TypeScript contracts
pnpm format           # JavaScript, TypeScript, and Rust formatting
nix fmt               # Nix formatting
pnpm check            # complete pre-commit verification
```

Use focused commands while iterating, then run `pnpm check` before handoff.
Generated protocol files must be changed through their generators; run
`pnpm codegen` and verify them with `pnpm codegen:check`.

## Native release packages

On x86_64 Linux or Apple Silicon macOS, build and place all eight supported
native binaries into their `npm/**` workspaces with:

```sh
nix run .#prepare-release-packages
```

The command validates the complete artifact set before changing package
workspaces. To inspect the resulting packages or create local tarballs:

```sh
pnpm package:check --release
pnpm --recursive --include-workspace-root pack --pack-destination target/npm-tarballs
```

Nix owns cross-compilation and reproducible native artifacts. pnpm owns npm
packing, workspace links, and Changesets. Do not add custom tarball generation or
duplicate cross-build scripts.

The flake pins Hermes as a source input so Nix builds do not depend on special
submodule-aware flake invocation. The Git submodule remains the normal source
for development outside Nix builds; keep the two revisions aligned when updating
Hermes.

## CI and releases

Pull requests and `main` run the same Nix-backed `pnpm check`. The release
workflow starts only after CI succeeds on `main`, builds the exact verified
commit, smoke-tests every platform, validates all npm packages, and publishes
through Changesets and npm trusted publishing.

Contributors normally only create a Changeset:

```sh
pnpm changeset
```

The workflow manages version PRs and publication. Direct local publication is
also supported for recovery or maintainer-driven releases after preparing the
complete native package set:

```sh
nix run .#prepare-release-packages
pnpm release
```

`pnpm release` performs the same package checks and Changesets publication as
CI, using the maintainer's existing npm authentication. Package lifecycle hooks
still reject direct `npm publish` commands and incomplete or stale artifacts.

## Maintaining automation

Keep the automation behind these existing surfaces:

- `scripts/check.mjs` — complete repository verification
- `scripts/native.mjs` — native build, smoke test, and materialization
- `scripts/native-lib.mjs` — shared internal native metadata
- `scripts/check-package.mjs` — package integrity and pack tests
- `scripts/release.mjs` — workflow-only Changesets operations
- `scripts/native-targets.json` — the single platform matrix

Prefer an existing npm command or a subcommand on one of these files. Avoid
single-use wrappers and do not repeat validation steps in workflow YAML. Pin new
tools in the flake and third-party GitHub Actions to full commit SHAs.

See `RELEASE_PLAN.md` for the complete build and release design.
