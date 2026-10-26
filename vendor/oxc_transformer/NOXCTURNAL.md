Read this when a transform in this tree behaves differently from upstream Oxc.
The bullets name the file that holds each repair. Open that file and confirm the
repair is still there before you edit it or treat the bullet as a diff.

Vendored Oxc transformer, pinned at 0.154.0 and selected by `[patch.crates-io]`.
`UPSTREAM_REVISION` records `oxc-project/oxc` tag `crates_v0.154.0` (`d47efe5`).
Original MIT license retained.

Noxcturnal patches this tree to repair constructor initialization, exponentiation assignment, logical assignment, optional chaining, legacy decorator lowering, async lowering, TypeScript import and enum preservation, resource-management scope and module ordering, and Compiler/Refresh integration.

`LICENSE` is taken from the Oxc repository root because the published crate
archive omits it.

Local patches:

- `common/helper_loader.rs` and `lib.rs`: return the exact semantic reference IDs
  created for external helper objects, so host materialization does not infer
  helper ownership from a name or synthetic source anchor.

- `typescript/class.rs`: initialize parameter properties and loose fields after a
  successful try-wrapped or conditional super call. Keep one initializer AST and
  reparent its scopes instead of cloning reference/scope identities.
- `es2016/exponentiation_operator.rs`: capture computed receivers and keys while
  constructing assignment references; memoize allocated RegExp keys; isolate
  parameter-initializer temporaries with the existing arrow-IIFE scope builder.
- `es2021/logical_assignment_operators.rs`: lower private targets in the same
  traversal as ordinary targets. Semantic receiver duplication reserves unresolved
  names and captures mutable bindings; the following nullish pass sees generated
  coalescing expressions when selected.
- `common/duplicate.rs`: regexp literals are identity-bearing allocations, so
  repeated uses share a temporary rather than cloning the literal. The shared
  utility also serves private class operations and legacy decorator computed keys.
- `es2020/optional_chaining.rs`: preserve mutable receivers, parameter activation
  scope, parenthesized delete/call references and mandatory operations between
  chains. Bind only terminal member references, never an optional call's result.
- `es2020/mod.rs`: remove the obsolete formal-parameter boolean hooks; parameter
  ownership is derived from traversal ancestry at optional-chain sites.
- `decorator/legacy/mod.rs`: preserve TypeScript legacy member grouping, setter
  parameter metadata, rest parameter adapters, private-environment placement and
  class/constructor callbacks. Allocate legal unique auto-accessor storage names
  and bind static accessors to the immutable original class rather than its
  decorator replacement. Custom decorator helper ABIs are unchanged.
- `es2017/async_to_generator.rs`: method parameter/directive preservation, legal
  noncapturing inferred names, ordinary async selection and for-await prerequisites.
- `es2018/async_generator_functions/for_await.rs`: retain all loop labels and expose
  generated iterator binding identities for downstream validation.
- `common/arrow_function_converter.rs`: lexical capture, deferred derived receiver
  initialization, super operators, updates, calls and destructuring references.
- `lib.rs`, `state.rs`, and pass wiring: erase transparent TypeScript wrappers before
  capture conversion; pass iterator provenance to the host runtime.
- `typescript/annotations.rs`: JSX fragments retain both their factory and fragment roots.
  Import erasure removes merged declarations by their import-specifier node IDs
  through the vendored semantic crate, preserving surviving runtime metadata.
- `typescript/module.rs`: propagate erased alias dependencies independently of declaration order.
- `typescript/enum.rs`: annotate initialization as pure only when semantic constant evaluation proves it safe.
- `typescript/enum.rs` and `typescript/namespace.rs`: match merged declarations and
  their immutable flags by semantic declaration node ID, preserving shared and moved
  source anchors even when semantic analysis omits the full node store.
- `es2026/explicit_resource_management.rs`: initialize colliding function declarations
  as hoisted function expressions inside disposal scopes, preserving lexical captures
  and leaving TypeScript overload signatures available for erasure; lower executable
  top-level enums before partitioning resource module statements. Detect body
  redeclarations by symbol identity and AST ownership rather than source positions.
- `typescript/enum.rs` and `typescript/mod.rs`: expose the existing enum lowering
  within the crate for reuse by resource module ordering. Enum semantics and helper
  implementations are unchanged.
- `lib.rs`: preserve the compiler panic threshold's fatal/nonfatal result and capture
  Refresh reset comments before compiler reconstruction prunes source comments.
- `state.rs`: retain that parsed reset directive across compiler reconstruction.
- `jsx/refresh.rs`: complete callback paths, enclosing-function hook ownership with
  static-block boundaries, reset comments, and safe synthetic-span signatures.
  Propagate HOC signature descriptions instead of cloning callback ASTs, so each
  emitted custom-hook callback has fresh scopes and references for later passes.

Keep Rust and npm Oxc versions pinned together. Reassess these patches against the
upstream implementation before any upgrade; archived regressions define the repair
contracts and accepted Babel compatibility boundaries.

JSX contract patches validate effective options after Babel-compatible parsed
comment directives, decode escaped pragma identifiers, normalize text/entities,
preserve classic literal spread prototypes, reject namespace attributes, and
infer index-file display names. Development fragments omit optional receiver
metadata; source locations use sparse JavaScript/UTF-16 checkpoints. The transform
result exposes its effective JSX runtime so local classic props completion honors
runtime directives without implementing a second directive parser.

Runtime helper loading exposes the generated binding IDs alongside external helper
reference IDs, so host loose-rest completion can select imports and requires without
matching source anchors or user-written module strings.
