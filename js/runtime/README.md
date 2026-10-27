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

Nested replays bind path runtimes once per route contract, sharing lazy scope and
ancestor caches across deliveries. Each replay owns fresh control state and caches;
sharing them across separate `traverse` calls would leak stops and skip ranges.
Nested envelopes transport parent summaries only for declared ancestry and scope
IDs only for scope access or dynamic subscriptions. Dynamic followup filtering is
stateless; delivery sets remain necessary to prevent reentrant subscriptions from
delivering the same callback twice.

Event and ancestor-path caches address native node identities through pages of
256 slots. Only touched pages allocate node slots, so sparse visitors avoid
reserving arrays for the entire parse. Ancestor-path caches are created on first
use within their route runtime. Page directories stay packed even when replay
visits identities out of order; source spans never participate in addressing.

Exit replay retains only matched exit carriers on a stack. Its lifetime follows
structural nesting rather than node-ID range or total delivered nodes. Enter
paths keep their own event objects; creating the exit view never mutates them.

Child preparation selects roots from actual route deliveries, then expands their
retained child graph in one native batch. The graph follows the phase's declared
role union; path contracts still enforce each visitor's own child access. Packed
adjacency groups include empty parents and preserve native child order. JavaScript
keeps one child-state cache pointing into the packed edge buffer. Child access
filters those edges directly, avoiding per-parent typed-array views, role maps,
and copied child-ID arrays. Wide parents lazily cache requested singular roles
to avoid rescanning long sibling lists. Repeated routed-child seeding alone needs a membership
set to deduplicate replayed nodes.
Singular child access resolves its one node directly, without constructing child
arrays or unrelated paths. Lists preserve native order and create fresh result
arrays so callers cannot mutate cached structural state.
