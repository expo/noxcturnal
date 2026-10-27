# Noxcturnal

Noxcturnal is a native-backed JavaScript transformation library. It combines a typed,
Babel-like visitor API in TypeScript with parsing, semantic analysis, traversal, edit validation,
rendering, and source-map generation in Rust.

Noxcturnal is an independent transform runtime. It is not a Metro transformer and does not collect
dependencies, rewrite modules, or wrap output for a particular framework.

> [!NOTE]
> Noxcturnal is under active development. Its public API may change before the first stable release.

## Installation

```sh
pnpm add noxcturnal
```

Noxcturnal requires Node.js 18 or later. Native code ships as optional dependencies, one prebuilt
binary per supported platform. A platform without a prebuilt binary fails to load; there is no
JavaScript fallback.

| OS      | Architecture | libc  | Package                                   |
| ------- | ------------ | ----- | ----------------------------------------- |
| macOS   | arm64        |       | `@noxcturnal/noxcturnal-darwin-arm64`     |
| macOS   | x64          |       | `@noxcturnal/noxcturnal-darwin-x64`       |
| Linux   | arm64        | glibc | `@noxcturnal/noxcturnal-linux-arm64-gnu`  |
| Linux   | x64          | glibc | `@noxcturnal/noxcturnal-linux-x64-gnu`    |
| Linux   | arm64        | musl  | `@noxcturnal/noxcturnal-linux-arm64-musl` |
| Linux   | x64          | musl  | `@noxcturnal/noxcturnal-linux-x64-musl`   |
| Windows | arm64        |       | `@noxcturnal/noxcturnal-win32-arm64-msvc` |
| Windows | x64          |       | `@noxcturnal/noxcturnal-win32-x64-msvc`   |

## Usage

Plugins declare exactly which nodes and fields they need. Noxcturnal compiles those declarations
into native routes, sends only the requested data to JavaScript, and commits the resulting edits as
one transaction.

```ts
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from 'noxcturnal';

const replaceBuildId = defineNativePlugin({
  name: 'replace-build-id',
  contract: { metadata: { writes: ['replacedBuildId'] } },
  visitors: [
    defineVisitor(
      'Identifier',
      {
        fields: ['name', 'global'],
        where: { name: { equals: '__BUILD_ID__' } },
      },
      path => {
        if (path.node.global) {
          path.replaceWith(path.context.code.stringLiteral('development'));
          path.context.metadata.set('replacedBuildId', true);
        }
      },
    ),
  ],
});

const pipeline = defineNativePipeline({
  phases: [{ name: 'application', plugins: [replaceBuildId] }],
});

const result = transform('console.log(__BUILD_ID__);', 'app.js', pipeline);

if (result.status === 'complete') {
  console.log(result.code);
}
```

### Phases

A pipeline is a list of phases. A phase holds either plugins or a native plan, never both.

Every plugin in a phase observes the same immutable input. Its edits become visible together at the
phase boundary, after validation and an optional reparse. Split dependent transforms into separate
phases when a later transform must observe an earlier transform's output.

### Visitors

`defineVisitor(route, contract, handler)` subscribes a handler to one node type. The contract
declares everything the handler may read:

- `fields` lists the scalar properties copied onto `path.node`.
- `where` holds native match predicates. Nodes that fail them never reach JavaScript.
- `children`, `ancestry`, `scope`, `comments`, and `controlFlow` opt in to the matching `path`
  capabilities.
- `nested` lists visitors the handler may run with `path.traverse`.

Reading a capability or child role the contract did not declare throws. The handler is either a
function, which runs on enter, or an `{ enter, exit }` object.

`Function` and `Class` each arrive as one route, with a kind that distinguishes declarations,
expressions, and TypeScript ambient declarations. The `ReferencedIdentifier` route matches only
identifiers that are references, bound or global; `Identifier` matches every identifier.

A visitor on every node disables route planning and bails unless the transform is called with
`allowBroadVisitors: true`.

### Plugin lifecycle

A plugin may define these hooks. For each file they run in this order:

- `createState(context)` creates per-file state passed to the other hooks.
- `pre(context, state)` runs before analysis.
- `analyze(context, state)` may return `{ status: 'irrelevant' }` to skip this plugin's visitors
  and `apply`, `{ status: 'unsupported', reason }` to bail out of the whole transform, or
  `{ status: 'supported', analysis }`.
- `apply(context, analysis, state)` runs when `analyze` returned `supported`.
- `visitors` run during the phase traversal.
- `post(context, state)` runs after the traversal, including when `analyze` returned `irrelevant`.
- `cleanup(reason, state)` runs once for every plugin that was prepared, on success, bailout, and
  failure. The first cleanup error is reported. It turns a bailout into a fatal error and does not
  replace an earlier fatal error.

Plugins that apply only to particular syntax can declare a necessary condition:

```ts
contract: {
  syntax: { anyOf: ['AsyncFunction', 'Super'] },
}
```

The plugin runs only when at least one listed feature occurs in the current phase's input. Features
are concrete AST node kinds, plus `AsyncFunction` (including async arrows and methods) and
`GeneratorFunction` (including generator methods). Comments, strings, and property names do not
count as the syntax they mention. A plugin rejected here skips every hook, including `createState`
and `cleanup`. The list must be nonempty and contain only known features. Keep the condition
conservative, and use `analyze` for semantic checks.

### Selecting visitors by structure

The first argument to `defineVisitor` may be a selector. Existing route-name calls remain valid.
A selector describes what matches; the second argument declares what data the callback receives:

```ts
defineVisitor(
  {
    route: 'AssignmentExpression',
    children: {
      left: {
        route: 'Identifier',
        where: { name: { equals: 'exports' }, global: { equals: true } },
      },
    },
  },
  {},
  (assignment, state) => {
    state.hasCjsExports = true;
  },
);

defineVisitor(
  { route: 'VariableDeclaration', parent: { route: 'Program' } },
  { fields: ['kind'] },
  declaration => {
    // Only declarations directly in Program.body reach this callback.
  },
);
```

Selectors compose `route`, `where`, `parent`, and named `children`. Routes support the same aliases
and `|` composites as ordinary visitors. All conditions must hold. `parent` means the immediate AST
parent; it never restricts traversal into that parent's subtree. Exports inside an IIFE still match
an assignment selector. Wrappers exposed by the parser are explicit nodes, and `Program` has no parent.

A list child condition matches any node in the role unless `index` selects a zero-based position in
its generated child order. For example, `children: { arguments: { route: 'Identifier', index: 0,
where: { name: { equals: 'target' } } } }` tests the first argument. Missing children and out-of-range
positions do not match. Positions are counted before filtering by the child route or predicates.
An index is invalid on a single-child role. Relationships can be nested up to eight selector levels; recursive wildcards and arbitrary ancestor searches are not supported.

The selector filters visitor roots. Child data declared in the callback contract still includes
every child allowed by that contract, not just the child that satisfied the selector.

Matching happens natively before payload packing and JavaScript child prefetch. Matching a child
or ancestor does not grant `getChild`, `parentPath`, scope access, or payload fields. Declare those
separately in the callback contract when needed. Unknown selector keys are rejected. A contract's
existing `where` predicates remain supported and combine with selector conditions. Selectors also apply to exit and nested visitors.

Pure structural matching needs no semantic analysis or retained index. Semantic predicates such
as `global` still require analysis. When another capability requires an index, the plan retains
only the roles and fields needed for matching and callback data. Declare nested visitors through
`nested` so their selector requirements are included before collecting the snapshot.

### Metadata and queries

A plugin declares the metadata keys it writes and reads in `contract.metadata`. Two plugins cannot
write the same key, and an undeclared write or read throws. Written metadata is returned on
`result.metadata`.

Scope and module queries (`globals`, `imports`, `exports`, `constants`, `calls`, `captures`, and
`bindings`) must be declared in `contract.queries`. An undeclared query throws, and a sibling
plugin's declaration does not authorize it. Metadata ownership and query capabilities
compile with the pipeline definition. Create a new plugin definition to change
them; query selectors can still vary within the declared categories.

### Matching member expressions

`path.matchesPattern()` uses native AST facts. Declare `fields: ['memberPath']` for static or
computed member expressions or `fields: ['name']` for identifiers, including in child contracts.
Missing declarations throw. Patterns separate properties with dots; a backslash escapes a dot or a
backslash. A computed member has a path only when its key is a string literal. An identifier
reached through a `memberPath` declaration does not match, and neither do nodes such as a `super()`
callee or a spread argument.

For a fixed pattern, prefer a native predicate such as
`where: { memberPath: { equals: 'process.env.NODE_ENV' } }`. It filters nodes before they reach
JavaScript.

Generated UIDs avoid identifier names in the AST and names already reserved in the phase. Text
inside comments and string literals does not reserve names.

### Configuration and per-file data

Pipeline definitions describe reusable program configuration:

- `plugin.withOptions(options)` creates a definition with different declared behavior.
- `plugin.withParameters(values)` binds values used by native predicates.
- `pluginData` passes current-file data to state factories, hooks, and visitors.

```ts
const result = transform(source, filename, pipeline, {
  pluginData: { platform: 'ios' },
});
```

Do not close over per-file data in a reusable plugin definition. Read it from `pluginData` instead.
If that data affects output, include it in your transform-result cache key. `pipelineCacheKey`
covers only Noxcturnal-owned configuration.

### Native transforms

A phase can run declarative native transforms without a JavaScript visitor:

```ts
const pipeline = defineNativePipeline({
  phases: [
    {
      name: 'syntax',
      native: {
        typescript: 'strip',
        transforms: {
          optionalChaining: { loose: false },
          nullishCoalescingOperator: { loose: false },
        },
      },
    },
  ],
});
```

Native plans are validated when the pipeline is defined. Option objects are closed: a missing,
extra, or invalid key throws. False and omitted switches are ignored, and a phase with nothing
left to do is dropped. The Babel column names the closest Babel equivalent. Compatibility is
assessed per option, and known differences are listed in the notes.

#### `transforms`

| Option                         | Babel equivalent                                       | Value                                               | Notes                                                                           |
| ------------------------------ | ------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| `asyncFunctions`               | `@babel/plugin-transform-async-to-generator`           | `boolean`                                           |                                                                                 |
| `asyncGeneratorFunctions`      | `@babel/plugin-transform-async-generator-functions`    | `boolean`                                           |                                                                                 |
| `blockScoping`                 | `@babel/plugin-transform-block-scoping`                | `boolean`                                           |                                                                                 |
| `classes`                      | `@babel/plugin-transform-classes`                      | `boolean`                                           | Class lowering also lowers fields and private state in the same file.           |
| `classProperties`              | `@babel/plugin-transform-class-properties`             | `{ loose: boolean } \| false`                       |                                                                                 |
| `classStaticBlock`             | `@babel/plugin-transform-class-static-block`           | `boolean`                                           |                                                                                 |
| `destructuring`                | `@babel/plugin-transform-destructuring`                | `boolean`                                           |                                                                                 |
| `explicitResourceManagement`   | `@babel/plugin-transform-explicit-resource-management` | `boolean`                                           |                                                                                 |
| `exponentiationOperator`       | `@babel/plugin-transform-exponentiation-operator`      | `boolean`                                           |                                                                                 |
| `exportNamespaceFrom`          | `@babel/plugin-transform-export-namespace-from`        | `boolean`                                           |                                                                                 |
| `forOf`                        | `@babel/plugin-transform-for-of`                       | `boolean`                                           |                                                                                 |
| `legacyDecorators`             | `@babel/plugin-proposal-decorators` (`legacy`)         | `boolean`                                           | TypeScript-style legacy decorator semantics.                                    |
| `logicalAssignmentOperators`   | `@babel/plugin-transform-logical-assignment-operators` | `boolean`                                           |                                                                                 |
| `nullishCoalescingOperator`    | `@babel/plugin-transform-nullish-coalescing-operator`  | `{ loose: boolean } \| false`                       | When `optionalChaining` is also set, both `loose` values must match.            |
| `objectRestSpread`             | `@babel/plugin-transform-object-rest-spread`           | `{ loose: boolean; useBuiltIns: boolean } \| false` |                                                                                 |
| `optionalCatchBinding`         | `@babel/plugin-transform-optional-catch-binding`       | `boolean`                                           |                                                                                 |
| `optionalChaining`             | `@babel/plugin-transform-optional-chaining`            | `{ loose: boolean } \| false`                       | `loose` also treats `document.all` as an ordinary value for nullish coalescing. |
| `parameters`                   | `@babel/plugin-transform-parameters`                   | `boolean`                                           |                                                                                 |
| `privateMethods`               | `@babel/plugin-transform-private-methods`              | `boolean`                                           | Always uses a loose representation.                                             |
| `privatePropertyInObject`      | `@babel/plugin-transform-private-property-in-object`   | `boolean`                                           | Always uses a loose representation.                                             |
| `regexpDotAll`                 | `@babel/plugin-transform-dotall-regex`                 | `boolean`                                           |                                                                                 |
| `regexpLookBehind`             | none                                                   | `boolean`                                           | Recognized and left as written.                                                 |
| `regexpMatchIndices`           | none                                                   | `boolean`                                           | Recognized and left as written.                                                 |
| `regexpNamedCaptureGroups`     | `@babel/plugin-transform-named-capturing-groups-regex` | `boolean`                                           |                                                                                 |
| `regexpSticky`                 | `@babel/plugin-transform-sticky-regex`                 | `boolean`                                           |                                                                                 |
| `regexpUnicode`                | `@babel/plugin-transform-unicode-regex`                | `boolean`                                           | Also expands Unicode property escapes.                                          |
| `regexpUnicodePropertyEscapes` | `@babel/plugin-transform-unicode-property-regex`       | `boolean`                                           |                                                                                 |
| `regexpUnicodeSets`            | `@babel/plugin-transform-unicode-sets-regex`           | `boolean`                                           |                                                                                 |

#### Language, JSX, and output

| Option                | Babel equivalent                     | Value                                                                                                                  | Notes                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript`          | `@babel/plugin-transform-typescript` | `'strip'`                                                                                                              | Removes type syntax.                                                                                                                                                                                                              |
| `jsx`                 | `@babel/plugin-transform-react-jsx`  | `'preserve'`, `'classic'`, `'classic-development'`, `'automatic'`, `'automatic-development'`, `'automatic-if-present'` | Development modes match `@babel/plugin-transform-react-jsx-development`. `'automatic-if-present'` returns files without JSX unchanged. Its phase may only add `blockScoping`, and `comments: false` together with `blockScoping`. |
| `jsxImportSource`     | `importSource`                       | `string`                                                                                                               | Requires `jsx`.                                                                                                                                                                                                                   |
| `jsxPragma`           | `pragma`                             | `string`                                                                                                               | Requires `jsx`.                                                                                                                                                                                                                   |
| `jsxPragmaFrag`       | `pragmaFrag`                         | `string`                                                                                                               | Requires `jsx`.                                                                                                                                                                                                                   |
| `jsxPure`             | `pure`                               | `boolean`                                                                                                              | Requires `jsx`. Defaults to `false` in development modes.                                                                                                                                                                         |
| `jsxThrowIfNamespace` | `throwIfNamespace`                   | `boolean`                                                                                                              | Requires `jsx`. Defaults to `true`.                                                                                                                                                                                               |
| `helpers`             | `@babel/plugin-transform-runtime`    | `{ mode: 'runtime' \| 'inline'; moduleName?: string; version?: string }`                                               | `runtime` imports helpers from `@babel/runtime`, the only supported module. `inline` emits them into the file.                                                                                                                    |
| `compact`             | `compact`                            | `boolean`                                                                                                              | Prints output without formatting whitespace.                                                                                                                                                                                      |
| `comments`            | `comments`                           | `boolean`                                                                                                              | `false` removes comments. Defaults to `true`.                                                                                                                                                                                     |

#### `optimize`

| Option                | Value     | Notes                                                                                                                                                         |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constantFolding`     | `boolean` | Folds constant expressions, following Metro's conservative rules.                                                                                             |
| `deadCodeElimination` | `boolean` | Removes unreachable branches and unused bindings, following Metro's conservative rules.                                                                       |
| `moduleContext`       | `boolean` | Treats top-level bindings as private to a module wrapper, so dead-code elimination may remove unused top-level functions in scripts. Does not change parsing. |

#### `reactCompiler`

Runs the React Compiler, vendored from Oxc. All required fields must be set.

| Option                                | Value                                          | Notes                                                                                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `compilationMode`                     | `'infer' \| 'syntax' \| 'annotation' \| 'all'` | Required. Selects which functions are compiled.                                                                                                                                                             |
| `panicThreshold`                      | `'none' \| 'critical_errors' \| 'all_errors'`  | Required. `'none'` leaves a function the compiler cannot handle as written. `'critical_errors'` and `'all_errors'` throw a transform error for critical errors or for every diagnostic, including warnings. |
| `target`                              | `'17' \| '18' \| '19'`                         | Required. React version the output targets.                                                                                                                                                                 |
| `enableResetCacheOnSourceFileChanges` | `boolean`                                      | Required. Resets memoization caches when the source file changes during development.                                                                                                                        |
| `customOptOutDirectives`              | `string[]`                                     | Directives that opt a function out, in addition to `'use no memo'` and `'use no forget'`.                                                                                                                   |

The React Compiler needs the original source. A file that was rewritten by Flow erasure or a parser
adapter before this phase bails out instead.

#### `reactRefresh`

Emits React Fast Refresh registrations and signatures.

| Option               | Value     | Notes                                                   |
| -------------------- | --------- | ------------------------------------------------------- |
| `refreshReg`         | `string`  | Registration function name. Defaults to `$RefreshReg$`. |
| `refreshSig`         | `string`  | Signature function name. Defaults to `$RefreshSig$`.    |
| `emitFullSignatures` | `boolean` | Emits full hook signatures instead of hashes.           |

#### Combining options

`helpers` and the JSX companion options configure a phase but do not make it active on their own.
JSX companion options without `jsx` are rejected.

Flow files are erased automatically before the first phase runs.

### Transform outcomes

`transform` has three outcomes:

- A successful transform returns `{ status: 'complete', code, map, functionMap, metadata, diagnostics }`.
- An intentional compatibility boundary returns `{ status: 'bailout', reason, source, diagnostics }`.
  `source` is the string passed to `transform`, even when Flow erasure or a parser adapter had
  already rewritten it internally.
- Invalid input or configuration and internal failures throw.

Run a compatibility transformer only for a returned bailout. Let thrown errors propagate. A syntax
failure throws `TransformSyntaxError`; other fatal failures throw `NativeTransformError`.

`functionMap: true` collects function ranges from the original input, before any lowering.

## Development

The Nix development shell supplies Node.js 22, pnpm 10, Rust 1.97, CMake, Ninja, and Python.
`flow_parser` and `react_compiler` are default Cargo features, so a normal build includes Hermes
Flow erasure and the React Compiler. A binary built without `flow_parser` reports Flow erasure as
`unsupported` and leaves the file to a parser adapter.

```sh
nix develop
pnpm install
pnpm build
pnpm check
pnpm benchmark
```

Use `pnpm format` to format the TypeScript and Rust sources. User-visible changes should include a
changeset because the main package and its native platform packages are released as one fixed
version group. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

## Repository

Noxcturnal is one npm package and one N-API crate. Each folder under `js/` and `src/` has a README
describing its internals.

- [`js/`](js/) is the TypeScript package: the public API, pipelines, visitors, and the JavaScript
  side of the native protocol.
- [`src/`](src/README.md) is the Rust addon: parsing, native transforms, edit commits, and source
  maps.
- `protocol/event-schema.json` is the shared AST schema. `pnpm codegen` generates both sides from
  it.
- `crates/hermes-flow` erases Flow from Hermes' serialized AST. `crates/hermes-parser-sys` links
  the Hermes parser.
- `vendor/oxc_transformer` and `vendor/oxc_react_compiler` are patched Oxc crates, selected with
  `[patch.crates-io]`. Each crate's `NOXCTURNAL.md` lists the local changes. Oxc crates and
  `@oxc-project/types` stay on the same exact version.
- [`test/`](test/README.md) holds the alignment, compliance, transform, and integration suites.
- `npm/` holds the per-platform binary packages.

## License

MIT
