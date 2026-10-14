# Plan 16: React Compiler and Refresh

Status: implementation and validation complete; ready for parent/user review. No push performed.

Branch: `fix/audit-16-react-compiler-refresh`
Plan: `/Users/phil/git/expo/noxcturnal/plans/16-react-compiler-refresh`
Owner: plan16 agent. Only this agent edits this handover.

## Completed work

- Read plan, findings, criteria and repository/test guidance; restored all 15 archived files at owning paths. Baseline passed 284 guarded checks, including isolated debug abort probes and actual Chromium/React 17/18/19.
- Vendored exact Oxc 0.141.0 compiler and transformer with license/provenance. Parent independently verified all 98 pristine compiler source files against the registry archive. Rust/npm versions remain aligned.
- Distinguished fatal compiler results from recoverable diagnostics, stopped unsupported lowering before inference, and removed whole-transform retry. Helpers and Refresh registrations now survive recovery exactly once.
- Matched lexical compiler directives, including escaped module/custom directives.
- Fixed generated-span Refresh signature lengths, lexical-block attribution with static-block boundaries, parsed reset comments before compiler pruning, and complete member/import.meta callback paths.
- Added source fingerprints with fixed slot zero reserved before memo allocation. Enabled zero-memo functions retain a cache hook across source updates. Ordinary outlined callbacks suppress the fingerprint while being emitted and introduce no hooks.
- Added actual mounted-source update tests for unchanged/growing/shrinking/zero layouts, trailing caller state, reducer initializers and independent siblings. Preserved accepted Babel compiled-initializer state retention.
- Added changeset and reproducible compilation/emitted-cache benchmarks. Parent reviewed final source; no outstanding code blocker.

## Validation

- Exact final `pnpm check`: **4459 JavaScript tests / 194 files; 131 Rust tests**; codegen, format, types, Clippy, build and package gates passed. Log: `/tmp/plan16-check-exact.log`.
- Final `pnpm build:release` succeeded. Exact release addon passed **120 browser/render/Refresh/scope tests**, including React 17/18/19. Log: `/tmp/plan16-release-exact.log`. Artifact: `/tmp/plan16-release-candidate.node`.
- Debug addon restored with `pnpm build:native`; native fingerprint check passed during final benchmark.
- Nix Cargo staging hash `sha256-rs/r43HWNLRP41oZ4aePvEKiclHosZQsDTJ3wdpXmkk=` verified by matching cargoDeps build. Logs: `/tmp/plan16-nix-stage.log`, `/tmp/plan16-nix-verify.log`.
- Default Node22 succeeded. Node24's oxfmt stdin process hung during codegen; no Node24-specific source changes are included.

Every native command used `HERMES_SOURCE_DIR=/Users/phil/git/expo/noxcturnal/crates/hermes-parser-sys/hermes` and `CARGO_TARGET_DIR="$PWD/target/dev"`. Browser/runtime paths are recorded in `/tmp/noxcturnal-audit-env.json`; override its old release path with this branch's artifact.

## Performance

Final debug benchmark against `/tmp/plan13-baseline.node` (same base plus pristine vendor prerequisites), log `/tmp/plan16-benchmark-quiet.log`:

| Workload                                       | Baseline | Candidate |  Output bytes |
| ---------------------------------------------- | -------: | --------: | ------------: |
| Compile 40 components, reset off               | 12.50 ms |  12.24 ms |   9990 → 9990 |
| Compile 40 components, reset on                | 12.23 ms |  13.04 ms |  9990 → 17750 |
| Recover 40 unsupported components with Refresh |  6.48 ms |   1.68 ms |   7848 → 5904 |
| Refresh 100 hook components                    | 2.766 ms |  2.767 ms | 18404 → 18404 |

Reported relative measurement errors were below 0.9%. Enabled invalidation adds about 6.6% compile time in this workload, 194 bytes per simple component and one memo slot. A zero-memo enabled function grows from 64 to 248 bytes, including its required runtime import/cache hook; no empty clearing loop is emitted. Cache hits add one fingerprint comparison; source changes clear existing slots. The emitted-cache microbenchmark varied 3.2–5.1 ns/call even for byte-identical output, so no reliable small hot-path cost is claimed. Actual renderer tests establish semantics independently. Earlier highly contended timing runs were excluded.

Reproduce compilation with `NOXCTURNAL_BENCH_BASELINE_ADDON=/tmp/plan13-baseline.node pnpm benchmark js/__benchmarks__/react-compiler.bench.ts` and the native environment above. The separate `react-cache-comparison.mjs` takes baseline/candidate addon paths.

## Unsigned commits

- `16e66a5`: pristine transformer vendor.
- `cadc2bf`: vendor format/provenance setup.
- `b1d83a8`: pristine React Compiler vendor and Cargo integration.
- `01c8995`: archived audit evidence.
- `846c2cc`: verified Nix vendor staging hash.
- `2bbb26e`: compiler/Refresh fixes and regression coverage.
- Final documentation commit: changeset, benchmark scripts and this handover.

## Review and next steps

All plan findings have dispositions in the original plan `EXECUTION.md`. Shared transformer vendoring overlaps other branches. Plan15 captures JSX directives before compiler reconstruction and extends transformer return metadata; preserve both its changes and this branch's Refresh reset capture when merging. Host recovery removal may overlap scheduling repairs. No combined-branch validation is claimed.

Parent/user should review this branch and push only when ready. Shared node_modules was not modified. No remaining implementation task is known.
