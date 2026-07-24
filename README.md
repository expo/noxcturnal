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
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from 'noxcturnal';

const replaceConstants = defineNativePlugin({
  name: 'replace-constants',
  contract: { metadata: { writes: ['replaced'] } },
  visitors: [
    defineVisitor(
      'Identifier',
      { fields: ['name', 'global'], where: { name: { equals: '__BUILD_ID__' } } },
      path => {
        if (path.node.global) {
          path.replaceWith(path.context.code.stringLiteral('development'));
          path.context.metadata.set('replaced', true);
        }
      },
    ),
  ],
});

const result = transform(
  source,
  filename,
  defineNativePipeline({ phases: [{ name: 'transform', plugins: [replaceConstants] }] }),
);
```

Within a phase every plugin observes the same immutable source. Mutations become visible after the native commit and optional reparse boundary. A bailout discards attempted edits and returns the pristine input source.

`defineNativePlugin` returns an immutable reusable definition. Bind per-pipeline options with `plugin.withOptions(options)`. Pipelines always declare explicit phases and snapshot and freeze their phase and plugin arrays so cache identity cannot drift after construction. Every transform phase is compiled to numeric native routes.

Every visitor is a typed contract beside its callback: `defineVisitor(route, contract, handler)` declares the payload `fields`, native `where` predicates, `scope`, `ancestry`, `children`, `controlFlow`, and (when needed) `nested` visitor requirements — and the callback's path type is derived from exactly that contract, so undeclared fields and capability methods are TypeScript errors as well as runtime errors. The compiled native route manifest is generated from the same normalized contract object. The plugin `contract` declares context-level requirements (metadata ownership, semantic queries); `prepare` keeps only per-file lifecycle settings and may return `{ enabled: false }` to remove a plugin for the current file, which is useful with `sourceHints` for directive-driven transforms. Per-file dynamism with a static shape goes through the contract's `configure` hook (enablement and predicate values). A development-only `verifyVisitorContracts` option reports undeclared reads with paste-able contract fragments and declared-but-unused contract entries.

The TypeScript API derives its node and scalar-field names from the generated Oxc protocol schema: per-route declarable fields come from the same generated table the native predicate validator uses. Contracts narrow `path.node` to base identity plus declared fields (including `ReferencedIdentifier` and collapsed function/class routes), invalid route/field/capability literals are rejected, and the generic analysis value returned by `analyze` flows into `apply`. Composite routes such as `'Identifier|StringLiteral'` intentionally receive open field typing; use `path.is(...)` when a branch needs a specific view.

## Implemented surface

- Typed per-visitor contracts compiled into the native route manifest, safe all-subscriber event filters, per-file enablement, aliases, lifecycle hooks, state, contract-declared metadata ownership and queries, diagnostics, and cleanup. Path capabilities are contract-scoped, not plugin-wide: one broad visitor cannot grant undeclared access to its siblings.
- Compiled binary route manifests and routed tapes with native scalar predicates, numeric JavaScript dispatch, explicit payload fields, and no runtime timing instrumentation.
- Optional analyze/apply lifecycle: every plugin decision is collected before any apply hook runs, so unsupported files bail out from pristine input without speculative mutation.
- Arbitrary compact Oxc node events with stable per-parse node IDs, parent summaries, scope IDs, typed scalar fields, semantic global-reference facts, and UTF-16 ranges. The integer node/field protocol is generated and checked against the pinned Oxc `AstKind` definition.
- Lazy compact ancestor paths with `findParent`, function/program-parent helpers, declared field filtering, and explicit batched `inspect` for additional shallow facts.
- Enter/exit visitors, per-plugin `skip` and `stop`, pipeline-wide stop, targeted `path.traverse`, subtree/scope widening, program revisits, and bounded follow-up batches.
- One internally retained columnar index with deterministic close, cached native queries, targeted inspection, UID generation, memory limits, and transactional commit. The compiled retention manifest is authoritative; missing facilities fail instead of widening subscriptions or selecting an event-store fallback.
- Binding queries include declaration, read/write references, and lexical captures as ready-to-use compact node views. Constant queries conservatively evaluate side-effect-free literal, unary, binary, logical, conditional, parenthesized, and sequence expressions; requested IDs return through a targeted packed buffer rather than transferring every expression. Module events expose import/export specifiers, declaration kinds, directives, and common call/construction summaries needed by source transformers.
- Scope views are interned for stable identity, use Oxc's complete semantic parent table (including empty intermediate scopes), expose lazy parent/program-owner paths, resolve bindings with lazy declaration paths and owning scopes, can insert generated declarations after directive prologues, and can rename a declaration plus its Oxc-resolved references in one transactional edit batch, including shorthand object and assignment properties. The scope table crosses N-API only as an on-demand packed integer buffer. Path views include Babel-shaped `replaceWithMultiple`, body-container, comment, and code-frame conveniences where those operations map cleanly to immutable source edits.
- Compact views expose frequently matched scalar discriminants—including property keys/flags, expression operators, function arity, yield delegation, and export-all facts—without transferring recursive child objects.
- Structural reads are declared with the contract's `children` (one statically-typed level, with runtime-validated deeper chains); direct children for matching parents are prefetched in one packed native batch. Paths expose Babel-shaped `get()` plus typed `getChild()` and `getChildList()` alternatives. Undeclared roles fail instead of causing hidden property-level FFI.
- Babel-compatible routes used by Expo include `ReferencedIdentifier`, `MetaProperty`, and declaration/expression variants collapsed by Oxc for functions and classes. Static member chains support `path.matchesPattern()` without child traversal.
- Replacement, removal, all four insertion affinities, append/prepend, move/reset/indent/trim/replace lowering, source-map marks, code fragments, overlap detection, Unicode-safe offsets, and direct encoded VLQ output. The committed document is a piece table: every piece records its source provenance, and rendering and mapping derive from piece structure.
- Output sections: `editor.prepend` and `editor.append` are prefix/suffix sections assembled around the body — a wrapper's opener always precedes body insertions at offset 0 (so helpers land inside the wrapper), rather than competing with them in insertion-affinity order. `ensureHelper` content is a prologue section pinned to the directive-prologue boundary.
- Provenance-carrying source fragments from `path.getSource()` and `context.sourceSlice(start, end)`. Replacements built from fragments keep in-range, in-order slices original-source-backed so other plugins' edits inside them compose instead of conflicting; fragments used out of place become commit-time copies realized with the same phase's contained edits applied. Cross-phase fragments degrade to plain text; degradations are always counted in `metadata.provenanceDegradations` (diagnostics carry details under `debugPerformance`). Coercing a fragment to a string throws — `path.sourceText()` / `fragment.text()` are the explicit escape hatches.
- Copy boundary rule: a copied range applies every edit fully inside it, includes zero-width insertions strictly inside, and excludes insertions exactly at its endpoints. `insertBefore(node)` text is anchored to a position, not to the node, so hoisting "a node plus the comment another plugin attached before it" requires widening the slice (for example `context.sourceSlice(comment.start, node.end)`). Realized copies keep interior source mappings: verbatim slices map back to their original tokens and contained edits keep their own anchors and names, so both the original and the copy symbolicate to the same source.
- Relocation is a first-class capability: `editor.move(start, end, destination)` and `path.moveTo(destination)` reorder original-backed pieces instead of snapshotting text, so contained edits from any plugin apply inside the moved content wherever it lands, and moved tokens keep identity mappings and names. The boundary rule mirrors copies: zero-width insertions strictly inside move with the range; endpoint insertions stay behind. Overlapping relocations, relocations into a moved-away range, edits straddling a moved range, and replacements covering exactly the moved range all fail loudly with both owners. Removing and copying the same range in one phase — the old relocation spelling — is rejected with a pointer to `editor.move`.
- Conflicts stay loud and attributed: overlapping edits, copies straddled by another edit, circular copies, and every relocation conflict fail with the owning plugin names in the message and as a structured `owners` array on the thrown `NativeTransformError`, so consumers can aggregate recurring owner pairs from fallback telemetry. Byte-identical convergent range edits (same kind, range, content, mapping, and names) collapse to the first owner instead of conflicting; the drop is counted in debug metadata.
- Shared-token intents live in one transform-level registry keyed `(kind, key)`: identical realized intent from any plugin or later phase dedupes to the first owner, divergent intent is a loud error naming both owners, and keys are namespaced by convention (`pluginName/helper`) unless deliberately shared.
  - `context.ensureHelper(key, code)` inserts idempotent-intent helpers once per transform at the end of the directive prologue (after any shebang and directives), one per line in first-ensure order.
  - `context.ensureReplace(key, start, end, code)` replaces a range under a keyed intent, so plugins that legitimately share responsibility for the same tokens (dependency registration, ESM lowering, and polyfill rewrites converging on one import statement) claim it through one edit as an explicit contract instead of a coincidence of byte equality. Within the registering phase the key binds one exact range; later phases re-ensure content only. Distinct keys on overlapping ranges stay ordinary overlap conflicts.
- `line`, `boundary`, and `character` mapping modes and name-bearing segments, all behaviors of one piece renderer. Multi-phase pipelines keep every non-final phase's mapping in packed decoded form and compose the chain natively with a single VLQ encode at the end; no phase encodes VLQ to feed the next phase. Input source maps compose once at the boundary where they enter.
- JS/JSX/TS/TSX/DTS classification with typed Flow/unknown-syntax bailout and caller-registered parser adapters.
- Structured errors, diagnostics, deterministic cache keys, worker-thread isolation, and platform-package scaffolds for macOS, Linux GNU/musl, and Windows on arm64/x64.

The retained session materializes one owned columnar index from the compiled retention manifest. Undeclared facilities are contract errors; there is no subscription widening, hidden reparse, retained event store, or alternate executor. No self-referential borrowed Oxc AST crosses an N-API return. Routed records, inspection results, structural children, and edit batches cross N-API as integer records plus UTF-8 string tables, while final code/map strings use direct N-API string conversion.

The current Expo/Metro source-transform capability audit is recorded in [FITMENT.md](./FITMENT.md). Babel remains outside this runtime and is selected by Metro only for files that cannot enter the secondary pipeline.

The editor surface is a direct contract: every documented operation is supported. The hot transform result always returns encoded `mappings` and `names`; decoded maps are intentionally absent.
