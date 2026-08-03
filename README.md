# Noxcturnal

Noxcturnal is the working codename for an independent native-backed JavaScript transformation library. JavaScript plugins use a Babel-like visitor contract while Oxc parsing, semantic analysis, AST traversal, edit validation, rendering, and VLQ source-map encoding remain in Rust.

It is not a Metro transformer and does not expose dependency collection, module rewriting, wrapping, or another framework-specific operation.

## Development

```sh
nix develop
pnpm install
pnpm build
pnpm check
pnpm benchmark
```

Rust tooling is available through the Nix development shell and all native dependencies are pinned
in `Cargo.lock`. Package scripts invoke Cargo directly, so activate `nix develop` or provide an
equivalent Rust toolchain before running them.

Installing dependencies prepares a repository-local pre-commit hook that runs lint-staged with
Oxfmt. Run `pnpm format` to format the TypeScript and Rust sources, or `pnpm lint` to run Clippy
independently. User-visible changes should include a `pnpm changeset`; the JavaScript package and all
eight native platform packages are versioned as one fixed release group.

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

`transform` has a strict three-outcome contract. Successful work returns a
`NativeTransformResult`; an intentional compatibility boundary returns a
`NativeBailoutResult`, whose `source` is always the pristine input; invalid source or
configuration and internal transform failures throw. Fatal native failures use
`NativeTransformError` with the stable code `NOXCTURNAL_TRANSFORM_ERROR`, while syntax
failures use `TransformSyntaxError` with `TRANSFORM_SYNTAX_ERROR`. Callers may run a
compatibility transformer only for a returned bailout—thrown values must propagate.

`defineNativePlugin` returns an immutable reusable definition. Bind per-pipeline options with `plugin.withOptions(options)` and declared predicate values with `plugin.withParameters(values)`. Pipelines always declare explicit phases and snapshot and freeze their phase and plugin arrays so cache identity cannot drift after construction. Every transform phase is compiled to numeric native routes.

### Configuration scopes

Plugin, phase, and pipeline definitions are program configuration, not per-file
values, and the API is arranged so that nothing about a plugin's plan can depend
on the file being transformed. Three scopes, three mechanisms:

1. **Definition** — `defineNativePlugin`, `defineVisitor`, and
   `plugin.withOptions(options)`. Whether a plugin runs at all is decided here,
   by putting it in a phase or leaving it out.
2. **Binding** — predicate values that vary per configuration but not per file.
   Declare them with `parameter(name)` and resolve them once with
   `plugin.withParameters(values)`.
3. **Per file** — `createState` and `pluginData`, read by lifecycle hooks and
   visitor callbacks. Neither can change a plan.

```ts
import {
  composeNativePipeline,
  defineNativePlugin,
  definePipelinePhase,
  defineVisitor,
  parameter,
  transform,
} from 'noxcturnal';

interface FileData {
  replacement: string;
}

const fileData = (value: unknown): FileData => value as FileData;

const replaceBuildId = defineNativePlugin({
  name: 'replace-build-id',
  visitors: [
    defineVisitor(
      'Identifier',
      { fields: ['name'], where: { name: { oneOf: parameter('names') } } },
      path => {
        path.replaceWith(
          path.context.code.stringLiteral(fileData(path.context.pluginData).replacement),
        );
      },
    ),
  ],
});

const sourcePhase = definePipelinePhase({
  name: 'source',
  plugins: [replaceBuildId.withParameters({ names: ['__BUILD_ID__'] })],
});
const legacySyntaxPhase = definePipelinePhase({
  name: 'legacy-syntax',
  native: { transforms: { blockScoping: true } },
});

const sourceOnly = composeNativePipeline([sourcePhase]);
const sourceAndLegacySyntax = composeNativePipeline([sourcePhase, legacySyntaxPhase]);

const result = transform(source, filename, needsLegacySyntax ? sourceAndLegacySyntax : sourceOnly, {
  pluginData: { replacement },
});
```

`withParameters` interns on the values, so binding the same configuration twice
returns the same plugin. A parameter stands for the value inside a predicate, not
for the operator or the matched field, so the contract still declares the shape
the native route manifest is compiled from. Reaching a transform with an
unresolved parameter is a contract error rather than a silent wildcard.

Phases and pipelines are interned structurally. Two phases with the same name,
flags, and either the same native plan or the same ordered plugin identities are
the same object, and pipelines are interned on their ordered phases. Plan and
route compilation are therefore memoised on identity, with no per-file cache key
to build or hash — and a phase written inline is as cheap as one created with
`definePipelinePhase`. `composeNativePipeline` still requires phases created with
`definePipelinePhase`; use `defineNativePipeline` when reusable composition is
unnecessary.

Because every plugin plan follows from its definition, a plugin's plan is
synthesized once per plugin and a phase is prepared once per phase — never per
file. Building a distinct phase _shape_ for every file is the one remaining way to
pay compilation repeatedly; the intern table is bounded, so shapes it has already
seen keep hitting and only new ones recompile.

Use `plugin.withOptions` for the finite configuration that changes a plugin's
declared behavior, `plugin.withParameters` for predicate values fixed per
configuration, and `pluginData` for current-file inputs such as filenames,
manifest values, feature flags, and shared transform state. `pluginData` is
available to `createState`, lifecycle hooks, and visitor callbacks. Do not close
over per-file data in a top-level plugin: read it from the current context and
create mutable per-file collections in `createState`.

`pluginData` is intentionally excluded from `pipelineCacheKey`, because it is
consumer-owned and may not be serializable. If it affects emitted code,
metadata, or diagnostics, the consumer must include the relevant values in
its own transform-result cache key. Parser selection, preflight options, and
other Noxcturnal-owned transform options remain part of the library key.

Every visitor is a typed contract beside its callback: `defineVisitor(route, contract, handler)` declares the payload `fields`, parsed `comments`, native `where` predicates, `scope`, `ancestry`, `children`, `controlFlow`, and (when needed) `nested` visitor requirements — and the callback's path type is derived from exactly that contract, so undeclared scalar fields are TypeScript errors while operational capabilities remain runtime-validated. The compiled native route manifest is generated from the same normalized contract object. The plugin `contract` declares context-level requirements (metadata ownership, semantic queries). Predicate values that vary per configuration are declared with `parameter(name)` and bound with `plugin.withParameters(values)`; there is no per-file hook that can change a contract.

Declaring `comments: 'inner'` enables `path.getComments('inner')`. It returns immutable parser records, in source order, whose complete ranges are contained by the node. Comment `start`/`end` coordinates are UTF-16 and half-open, include the `//` or `/* */` delimiters, while `value` omits those delimiters. Comments are input data for the current phase; edits become visible after the next phase reparses. No leading or trailing attachment relation is currently exposed.

Child authorization is exact and recursive. A named entry such as
`children: { declarations: { route: 'VariableDeclarator' } }` authorizes
`getChildList('declarations')`. A `'*'` entry authorizes `getChildren()` and each
enumerated path retains that entry's declared fields and nested children; it does
not authorize an arbitrary named `getChild()` call. Child paths inherit the
owning visitor's scope, ancestry, and control-flow capabilities, but comments are
local to the exact delivered visitor route and never inherited by derived paths.
Casting a typed callback path to `NativeNodePath` bypasses these compile-time
checks and should not be necessary.

Use nested wildcards only for genuinely heterogeneous structure. For example,
`children: { '*': { route: 'Pattern', children: { '*': { route: '*' } } } }`
preserves useful recursive typing, but the inner `route: '*'` can make every
concrete node type a retained structural parent. Prefer generated named roles
when the relationship is stable. `getSource()` is range-based and does not need
descendant routing, so request descendants only when the callback reads their
parsed fields or relations. Formal parameters follow Oxc's retained shape:
`pattern` is the binding and `default` is its separate initializer, rather than
an assumed Babel `AssignmentPattern` wrapper.

The TypeScript API derives its node and scalar-field names from the generated Oxc protocol schema: per-route declarable fields come from the same generated table the native predicate validator uses. Contracts narrow `path.node` to base identity plus declared fields (including `ReferencedIdentifier` and collapsed function/class routes), invalid route/field/capability literals are rejected, and the generic analysis value returned by `analyze` flows into `apply`. Composite routes such as `'Identifier|StringLiteral'` intentionally receive open field typing; use `path.is(...)` when a branch needs a specific view.

Ancestry uses an object contract. Legacy strings and bare numeric values are not
accepted: migrate `ancestry: 'findParent'` to
`ancestry: { mode: 'findParent' }`, and `ancestry: 2` to
`ancestry: { mode: 2 }`. Modes retain their existing method surface:
`parent` retains the direct parent, `findParent` retains the chain,
`functionParent` adds `getFunctionParent`, and `programParent` adds
`getProgramParent`. Positive integers retain a bounded chain.

Ancestor payload is independently declared with ordinary route, field, and child
contracts:

```ts
defineVisitor(
  'CallExpression',
  {
    ancestry: {
      mode: 'findParent',
      routes: {
        VariableDeclarator: { fields: ['bindingName'] },
        AssignmentExpression: { fields: ['targetName'] },
        TryStatement: {
          children: { block: { route: 'BlockStatement' } },
        },
      },
    },
  },
  path => {
    const owner = path.findParent(parent => parent.node.type === 'VariableDeclarator');
    owner?.node.bindingName;
  },
);
```

Route aliases and composites are supported, but ancestry routes cannot declare
`where`: hydration is fixed by node type rather than runtime values. A type guard
on `ancestor.node.type` narrows its declared fields. Declared ancestor children
use `get`, `getChild`, and `getChildList`, and their `getSource()` fragments retain
source provenance. Summary-only ancestry transfers IDs, types, ranges, and parent
relationships only. Hydrated ancestry adds one sparse record per unique matching
ancestor or retained child, shared across routed descendants; phases without
hydrated routes allocate no ancestor-field records.

## Implemented surface

- Typed per-visitor contracts compiled into the native route manifest, safe all-subscriber event filters, configuration-bound predicate parameters, aliases, lifecycle hooks, state, contract-declared metadata ownership and queries, diagnostics, and cleanup. Path capabilities are contract-scoped, not plugin-wide: one broad visitor cannot grant undeclared access to its siblings.
- Compiled binary route manifests and routed tapes with native scalar predicates, numeric JavaScript dispatch, explicit payload fields, and no runtime timing instrumentation.
- Optional analyze/apply lifecycle: every plugin decision is collected before any apply hook runs, so unsupported files bail out from pristine input without speculative mutation.
- Arbitrary compact Oxc node events with stable per-parse node IDs, parent summaries, scope IDs, typed scalar fields, semantic global-reference facts, and UTF-16 ranges. The integer node/field protocol is generated and checked against the pinned Oxc `AstKind` definition.
- Compact ancestor paths with bounded retention, `findParent`, function/program-parent helpers, TypeScript-declared scalar fields, runtime-validated child roles, and sparse shared hydration in the initial routed envelope.
- Enter/exit visitors, per-plugin `skip` and `stop`, pipeline-wide stop, targeted `path.traverse`, subtree/scope widening, program revisits, and bounded follow-up batches.
- One internally retained columnar index with deterministic close, cached native queries, targeted inspection, UID generation, memory limits, and transactional commit. The compiled retention manifest is authoritative; missing facilities fail instead of widening subscriptions or selecting an event-store fallback.
- Binding queries include declaration, read/write references, and lexical captures as ready-to-use compact node views. Constant queries conservatively evaluate side-effect-free literal, unary, binary, logical, conditional, parenthesized, and sequence expressions; requested IDs return through a targeted packed buffer rather than transferring every expression. Module events expose import/export specifiers, declaration kinds, directives, and common call/construction summaries needed by source transformers.
- Scope views are interned for stable identity, use Oxc's complete semantic parent table (including empty intermediate scopes), expose lazy parent/program-owner paths, resolve bindings with lazy declaration paths and owning scopes, can insert generated declarations after directive prologues, and can rename a declaration plus its Oxc-resolved references in one transactional edit batch, including shorthand object and assignment properties. The scope table crosses N-API only as an on-demand packed integer buffer. Path views include Babel-shaped `replaceWithMultiple`, body-container, comment, and code-frame conveniences where those operations map cleanly to immutable source edits.
- Compact views expose frequently matched scalar discriminants—including property keys/flags, expression operators, function arity, yield delegation, and export-all facts—without transferring recursive child objects.
- Structural reads are declared with the contract's `children`; named and wildcard child contracts remain statically typed through every nested hop, while runtime authorization is checked at the same boundary. Direct children for matching parents are prefetched in one packed native batch. Paths expose Babel-shaped `get()` plus cardinality-steered `getChild()` and `getChildList()` alternatives. Undeclared roles fail instead of causing hidden property-level FFI.
- Babel-compatible routes used by Expo include `ReferencedIdentifier`, `MetaProperty`, and declaration/expression variants collapsed by Oxc for functions and classes. Static member chains support `path.matchesPattern()` without child traversal.
- Replacement, removal, all four insertion affinities, append/prepend, move/reset/indent/trim/replace lowering, source-map marks, code fragments, overlap detection, Unicode-safe offsets, and direct encoded VLQ output. The committed document is a piece table: every piece records its source provenance, and rendering and mapping derive from piece structure.
- Output sections: `editor.prepend` and `editor.append` are prefix/suffix sections assembled around the body — a wrapper's opener always precedes Program body insertions, rather than competing with them in insertion-affinity order. `prependToProgram` and `ensureHelper` use one parser-authoritative boundary after the shebang, leading comments, and directive prologue; `appendToProgram` uses the final AST-statement boundary before trailing comments. All three remain inside output wrappers.
- Provenance-carrying source fragments from `path.getSource()` and `context.sourceSlice(start, end)`. Replacements built from fragments keep in-range, in-order slices original-source-backed so other plugins' edits inside them compose instead of conflicting; fragments used out of place become commit-time copies realized with the same phase's contained edits applied. Cross-phase fragments degrade to plain text. Coercing a fragment to a string throws — `path.sourceText()` / `fragment.text()` are the explicit escape hatches.
- `path.replaceWith(code)` replaces the complete node. Use `getSource()` or `sourceSlice()` when moving or wrapping existing code so provenance and contained edits survive. For an anonymous function or class declaration whose route requests `declarationNameAnchor` and `declarationNamePrefix`, `path.withDeclarationName(name)` returns a provenance-carrying composite with a structurally placed generated identifier. `sourceText()` deliberately loses provenance and is intended for inspection or integrations that truly require plain text, not syntax edits.

  ```ts
  // Before: token-layout-sensitive and provenance-losing.
  exportPath.replaceWith(declaration.sourceText().replace(/\bfunction/, `function ${local}`));

  // After: the native declaration anchor handles functions, generators, and classes.
  exportPath.replaceWith(declaration.withDeclarationName(local));
  ```

- Copy boundary rule: a copied range applies every edit fully inside it, includes zero-width insertions strictly inside, and excludes insertions exactly at its endpoints. `insertBefore(node)` text is anchored to a position, not to the node, so hoisting "a node plus the comment another plugin attached before it" requires widening the slice (for example `context.sourceSlice(comment.start, node.end)`). Realized copies keep interior source mappings: verbatim slices map back to their original tokens and contained edits keep their own anchors and names, so both the original and the copy symbolicate to the same source.
- Relocation is a first-class capability: `editor.move(start, end, destination)` and `path.moveTo(destination)` reorder original-backed pieces instead of snapshotting text, so contained edits from any plugin apply inside the moved content wherever it lands, and moved tokens keep identity mappings and names. The boundary rule mirrors copies: zero-width insertions strictly inside move with the range; endpoint insertions stay behind. Overlapping relocations, relocations into a moved-away range, edits straddling a moved range, and replacements covering exactly the moved range all fail loudly with both owners. Removing and copying the same range in one phase — the old relocation spelling — is rejected with a pointer to `editor.move`.
- Conflicts stay loud and attributed: overlapping edits, copies straddled by another edit, circular copies, and every relocation conflict fail with the owning plugin names in the message and as a structured `owners` array on the thrown `NativeTransformError`, so consumers can aggregate recurring owner pairs from fallback telemetry. Byte-identical convergent range edits (same kind, range, content, mapping, and names) collapse to the first owner instead of conflicting; the drop is counted in debug metadata.
- Shared-token intents live in one transform-level registry keyed `(kind, key)`: identical realized intent from any plugin or later phase dedupes to the first owner, divergent intent is a loud error naming both owners, and keys are namespaced by convention (`pluginName/helper`) unless deliberately shared.
  - `context.prependToProgram(code)` inserts provenance-aware code before the first ordinary Program statement, after the shebang, leading comments, and directive prologue, in first-call order.
  - `context.appendToProgram(code)` inserts provenance-aware code after the final Program statement and before trailing comments and output suffix wrappers, in first-call order.
  - `context.ensureHelper(key, code)` inserts idempotent-intent helpers once per transform at the same parser-authoritative prepend boundary, one per line in first-ensure order.
  - `context.ensureReplace(key, start, end, code)` replaces a range under a keyed intent, so plugins that legitimately share responsibility for the same tokens (dependency registration, ESM lowering, and polyfill rewrites converging on one import statement) claim it through one edit as an explicit contract instead of a coincidence of byte equality. Within the registering phase the key binds one exact range; later phases re-ensure content only. Distinct keys on overlapping ranges stay ordinary overlap conflicts.
- `line`, `boundary`, and `character` mapping modes and name-bearing segments, all behaviors of one piece renderer. Multi-phase pipelines keep every non-final phase's mapping in packed decoded form and compose the chain natively with a single VLQ encode at the end; no phase encodes VLQ to feed the next phase. Input source maps compose once at the boundary where they enter.
- JS/JSX/TS/TSX/DTS classification with typed Flow/unknown-syntax bailout and caller-registered parser adapters.
- Structured errors, diagnostics, deterministic cache keys, worker-thread isolation, and platform-package scaffolds for macOS, Linux GNU/musl, and Windows on arm64/x64.

The retained session materializes one owned columnar index from the compiled retention manifest. Undeclared facilities are contract errors; there is no subscription widening, hidden reparse, retained event store, or alternate executor. No self-referential borrowed Oxc AST crosses an N-API return. Routed records, inspection results, structural children, and edit batches cross N-API as integer records plus UTF-8 string tables, while final code/map strings use direct N-API string conversion.

The current Expo/Metro source-transform capability audit is recorded in [FITMENT.md](./FITMENT.md). Babel remains outside this runtime and is selected by Metro only for files that cannot enter the secondary pipeline.

### Babel runtime helper versions

Runtime helper configuration takes the exact semver supplied to Expo's
`babelRuntimeVersion` option:

```ts
helpers: {
  mode: 'runtime',
  moduleName: '@babel/runtime',
  version: '7.20.0',
}
```

Expo integrations must pass that value unchanged to both Babel and Noxcturnal; npm
ranges and package discovery are not part of this contract. Noxcturnal derives each
helper's minimum from the pinned `@babel/helpers`, applies Babel's exact-version caret
availability boundary, and can emit runtime-backed and generated inline helpers in the
same file. `helpersUsed` reports canonical identities independently of ownership.

Omitting `version` uses Babel 7's `7.0.0-beta.0` default. An empty value, a range, or
malformed semver produces `helper-runtime-version-invalid:*`; unsupported runtime
module names, unknown helpers, and helpers without a generated safe fallback remain
structured unsupported results. Explicit inline mode never reads the version or emits
runtime loads. For script runtimes before 7.13, Noxcturnal intentionally uses the
runtime helper's callable CommonJS self-export rather than Babel's redundant
`interopRequireDefault(...).default` wrapper; the pinned Babel 7 runtime exposes both
forms with the same helper ABI.

On the repository's representative compact fixture requesting `asyncToGenerator` and
`usingCtx` (Apple Silicon, release native build, 2,000 warm iterations), all-runtime
output was 439 bytes at 0.0116 ms/transform, all-inline was 2,248 bytes at 0.0113 ms,
and mixed `7.20.0` output was 1,736 bytes at 0.0214 ms. These figures are a regression
baseline rather than a cross-machine performance guarantee.

The editor surface is a direct contract: every documented operation is supported. The hot transform result always returns encoded `mappings` and `names`; decoded maps are intentionally absent.
