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

Noxcturnal requires Node.js 18 or later. The package selects a prebuilt native binary for supported
macOS, Linux, and Windows targets.

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

Every plugin in a phase observes the same immutable input. Its edits become visible together at the
phase boundary, after validation and an optional reparse. Split dependent transforms into separate
phases when a later transform must observe an earlier transform's output.

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
If that data affects output, include it in the consumer's transform-result cache key;
`pipelineCacheKey` intentionally covers only Noxcturnal-owned configuration.

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

The native surface includes TypeScript and Flow erasure, JSX modes, React Compiler and React
Refresh integration, common ES syntax lowering, constant folding, and dead-code elimination.

### Transform outcomes

`transform` has three outcomes:

- A successful transform returns a `NativeTransformResult`.
- An intentional compatibility boundary returns a `NativeBailoutResult` with the pristine input in
  `source`.
- Invalid input or configuration and internal failures throw.

Run a compatibility transformer only for a returned bailout. Thrown failures should propagate.
Syntax failures use `TransformSyntaxError`; fatal native failures use `NativeTransformError` with
the stable code `NOXCTURNAL_TRANSFORM_ERROR`.

## Development

The reproducible development environment includes Node.js, pnpm, Rust, CMake, Ninja, Python, and
the C++ tools needed to build the optional Hermes-backed Flow parser.

```sh
nix develop
pnpm install
pnpm build
pnpm check
pnpm benchmark
```

Use `pnpm format` to format the TypeScript and Rust sources. User-visible changes should include a
changeset because the main package and its native platform packages are released as one fixed
version group.

The test suite is organized by ownership and purpose; see [test/README.md](test/README.md) before
adding, moving, or deleting coverage.

## License

MIT
