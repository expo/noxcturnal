# Noxcturnal

Noxcturnal is the working codename for an independent native-backed JavaScript transformation library. JavaScript plugins use a Babel-like visitor contract while Oxc parsing, semantic analysis, AST traversal, edit validation, rendering, and VLQ source-map encoding remain in Rust.

It is not a Metro transformer and does not expose dependency collection, module rewriting, wrapping, or another framework-specific operation.

## Development

```sh
nix develop
pnpm install
pnpm build
pnpm verify
pnpm benchmark
pnpm rust:format
pnpm rust:lint
```

Rust tooling is available through the Nix development shell and all native dependencies are pinned
in `Cargo.lock`. Package scripts invoke Cargo directly, so activate `nix develop` or provide an
equivalent Rust toolchain before running them.

Installing dependencies prepares a repository-local pre-commit hook that runs lint-staged with
Oxfmt. Run `pnpm format` to format the repository manually. User-visible changes should include a
`pnpm changeset`; the JavaScript package and all eight native platform packages are versioned as one
fixed release group.

## Transform contract

```ts
import { defineNativePipeline, defineNativePlugin, transform } from 'noxcturnal';

const replaceConstants = defineNativePlugin({
  name: 'replace-constants',
  prepare() {
    return {
      subscriptions: ['Identifier'],
      metadataWrites: ['replaced'],
    };
  },
  visitor: {
    Identifier(path) {
      if (path.node.name === '__BUILD_ID__' && path.node.global) {
        path.replaceWith(path.context.code.stringLiteral('development'));
        path.context.metadata.set('replaced', true);
      }
    },
  },
});

const result = transform(source, filename, defineNativePipeline([replaceConstants]));
```

Within a phase every plugin observes the same immutable source. Mutations become visible after the native commit and optional reparse boundary. A bailout discards attempted edits and returns the pristine input source.

`defineNativePlugin` returns an immutable reusable API-v2 definition. Bind per-pipeline options with `plugin.withOptions(options)`. `defineNativePipeline([plugin])` is the single-pass shorthand; pass `{ phases: [...] }` when edits must become visible between passes. Pipelines snapshot and freeze their phase and plugin arrays so cache identity cannot drift after construction. API v2 has no generic visitor-dispatch fallback: every transform phase is compiled to numeric native routes.

`prepare` may return `{ enabled: false }` to remove a plugin and its lifecycle from the current file, which is useful with `sourceHints` for directive-driven transforms. Consumers declare every scalar property read by a callback in `fields`; undeclared payload fields are not transferred. They also declare `skip`, `stop`, nested traversal, and dynamic subscriptions in `controlFlow`; undeclared operations fail. Hot define-style visitors may declare `identifierNames`, exact `staticMemberPatterns`, or typed `where` predicates, all evaluated before native route delivery.

The TypeScript API derives its node and scalar-field names from the generated Oxc protocol schema. Visitor keys contextually narrow `path.node` (including `ReferencedIdentifier` and collapsed function/class routes), invalid route/field/capability literals are rejected, and the generic analysis value returned by `analyze` flows into `apply`. Composite routes such as `'Identifier|StringLiteral'` intentionally receive the common `NodeView`; use `path.is(...)` when a branch needs a specific view.

## Implemented surface

- Declarative plugin plans, static subscriptions, safe all-subscriber event filters, per-file enablement, aliases, lifecycle hooks, state, metadata ownership, diagnostics, and cleanup.
- Compiled binary route manifests and routed tapes with native scalar predicates, numeric JavaScript dispatch, explicit payload fields, and no API-v1 transform fallback or runtime timing instrumentation.
- Optional analyze/apply lifecycle: every plugin decision is collected before any apply hook runs, so unsupported files bail out from pristine input without speculative mutation.
- Arbitrary compact Oxc node events with stable per-parse node IDs, parent summaries, scope IDs, typed scalar fields, semantic global-reference facts, and UTF-16 ranges. The integer node/field protocol is generated and checked against the pinned Oxc `AstKind` definition.
- Lazy compact ancestor paths with `findParent`, function/program-parent helpers, declared field filtering, and explicit batched `inspect` for additional shallow facts.
- Enter/exit visitors, per-plugin `skip` and `stop`, pipeline-wide stop, targeted `path.traverse`, subtree/scope widening, program revisits, and bounded follow-up batches.
- `NativeTransformSession` backed by lazily widened owned native indexes, with deterministic close, event batches, cached coarse queries, inspection, UID generation, memory limits, and transactional commit. Pipeline transforms materialize their merged subscription and declared-query plan directly instead of first building a broad event index.
- Binding queries include declaration, read/write references, and lexical captures as ready-to-use compact node views. Constant queries conservatively evaluate side-effect-free literal, unary, binary, logical, conditional, parenthesized, and sequence expressions; requested IDs return through a targeted packed buffer rather than transferring every expression. Module events expose import/export specifiers, declaration kinds, directives, and common call/construction summaries needed by source transformers.
- Scope views are interned for stable identity, use Oxc's complete semantic parent table (including empty intermediate scopes), expose lazy parent/program-owner paths, resolve bindings with lazy declaration paths and owning scopes, can insert generated declarations after directive prologues, and can rename a declaration plus its Oxc-resolved references in one transactional edit batch, including shorthand object and assignment properties. The scope table crosses N-API only as an on-demand packed integer buffer. Path views include Babel-shaped `replaceWithMultiple`, body-container, comment, and code-frame conveniences where those operations map cleanly to immutable source edits.
- Compact views expose frequently matched scalar discriminants—including property keys/flags, expression operators, function arity, yield delegation, and export-all facts—without transferring recursive child objects.
- Structural reads are declared with `PluginPlan.children`; direct children for matching parents are prefetched in one packed native batch. Paths expose Babel-shaped `get()` plus typed `getChild()` and `getChildList()` alternatives. Undeclared roles fail instead of causing hidden property-level FFI.
- Babel-compatible routes used by Expo include `ReferencedIdentifier`, `MetaProperty`, and declaration/expression variants collapsed by Oxc for functions and classes. Static member chains support `path.matchesPattern()` without child traversal.
- Replacement, removal, all four insertion affinities, append/prepend, move/reset/indent/trim/replace lowering, source-map marks, code fragments, overlap detection, Unicode-safe offsets, and direct encoded VLQ output.
- `line`, `boundary`, and `character` mapping modes, name-bearing segments, and encoded input/multi-phase map composition without decoded JS segment arrays.
- JS/JSX/TS/TSX/DTS classification with typed Flow/unknown-syntax bailout and caller-registered parser adapters.
- Structured errors, diagnostics, deterministic cache keys, worker-thread isolation, and platform-package scaffolds for macOS, Linux GNU/musl, and Windows on arm64/x64.

The safe session strategy materializes an owned native event/semantic index for the declared initial plan. Widening reuses indexed subscriptions and lazily reparses only when a plugin requests an undeclared node family; production plugins should declare subscriptions and queries to keep the static path to one parse. No self-referential borrowed Oxc AST crosses an N-API return. Static event and edit batches cross N-API as generated integer records plus UTF-8 string tables, while final code/map strings use direct N-API string conversion. Continuation cursors, Flow parsing, separately compiled native-plugin registration, and full MagicString `Bundle` compatibility remain optional extension points; they are not required for the general JavaScript visitor contract and are not presented as framework APIs.

The current Expo/Metro source-transform capability audit is recorded in [FITMENT.md](./FITMENT.md). External Babel syntax transforms remain explicit fallback work rather than arbitrary-plugin compatibility.

`context.editor.supports(name)` is the capability boundary for compatibility-oriented editor operations. Plugins should test it before depending on operations outside the documented surface. The hot transform result always returns encoded `mappings` and `names`; decoded maps are intentionally absent.
