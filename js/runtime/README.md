# Transform runtime

This directory executes pipelines through the synchronous public `transform` function. TypeScript schedules native work and manages plugin callbacks; Rust owns parsing, semantic analysis, source storage, and edit commits.

Source preparation happens through the [adapter layer](../adapters/README.md). Each phase then reads one immutable input. Visitor edits commit together, and the next phase sees the result. The Rust [engine](../../src/engine/README.md) keeps source and map layers available across these steps.

A transform succeeds with code and mappings, returns a bailout with the caller's original source when an implementation intentionally declines, or throws for invalid input, configuration, and internal failures. Never expose a partially transformed buffer as a bailout. See the [public API](../../README.md) for result types.

Syntax requirements filter plugins before state creation. When `analyze` returns `irrelevant`, visitors and `apply` are skipped, but `post` still runs. Cleanup runs for every prepared plugin on success, bailout, or failure, even if another plugin's cleanup throws.

The React Compiler reads the caller's original file, so it bails when Flow erasure or an adapter has replaced the working source. Function maps likewise describe input functions rather than names invented by lowering.

Parsed data can be reused only while its source and the phase's requirements still agree. A phase with no edits can retain its index; a phase that changes bindings may require fresh semantic analysis. The [pipeline planner](../pipeline/README.md) declares these demands.

Preserve structured source fragments through edits so the native commit can retain their mappings.

Visitor node IDs and semantic handles belong to the current phase's parsed input.
Use them to identify nodes and bindings within that phase; do not carry them across
an edit commit or reparse. Source ranges remain the correct coordinates for text
edits and source fragments because every plugin in the phase observes that same
immutable input. They do not identify nodes in a native AST after structural
rewriting; see [native identity rules](../../src/preflight/README.md#identity-during-rewriting).

The `skip` contract requests structural bounds in routed events, without forcing
a retained index. Stateless collection backpatches exclusive subtree ends during
the same walk, retaining only emitted ancestors until they close. Indexed routes
load their bulk interval table only when skip is called. These bounds are opaque
within their session;
never compare them with node IDs or source coordinates. Projected children or
ancestors may have only summaries; their contracts already retain an index, and
skipping them loads one bulk interval table. Descendant checks and replay never
use source ranges or per-node native queries. Siblings can share source spans.

`path.traverse` and `subscribeWithin` send the owning node ID to native routing.
Their bounds are structural, including when parents and siblings share the same
source coordinates. Explicit coordinate queries keep their range semantics.
