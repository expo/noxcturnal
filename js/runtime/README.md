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
retained child graph in one native batch. The prepared route plan shares a compact
native child-demand projection across files. Native root selection reads structural
tape words directly, including stopped-plugin filtering and declared ancestor depth,
without constructing temporary JavaScript events. When the child cache is empty,
selection and packing run in one call; later queries filter roots through the existing
cache before fetching missing recursive graphs. The graph follows the phase's declared
role union; path contracts still enforce each visitor's own child access. Packed
adjacency groups include empty parents and preserve native child order. JavaScript
keeps one child-state cache pointing into the packed edge buffer. Child access
filters those edges directly, avoiding per-parent typed-array views, role maps,
and copied child-ID arrays. Wide parents lazily cache requested singular roles
to avoid rescanning long sibling lists.
Singular child access resolves its one node directly, without constructing child
arrays or unrelated paths. Lists preserve native order and create fresh result
arrays so callers cannot mutate cached structural state.

Single and batched binding lookups share lazily hydrated facts keyed by the
resolved scope and interned name, so shadowed declarations remain distinct.
Repeated `getBinding` calls reuse reference facts instead of transferring and
converting the full reference list at every use. The sparse fact cache has one
packed-key map rather than a map of scopes containing maps of names. Scope and
binding path views still belong to each route runtime and enforce its contract;
only immutable input facts are shared for the session's lifetime.
Global presence and coarse reference queries share one cache. Presence checks
store a native boolean without transporting reference records; arrays are
hydrated only when requested. Only queried names enter this cache. Rich binding
references retain their separate semantic view and read/write flags.
Batched lookups put cache hits directly into their result array. Only misses
allocate a deduplicated native request map and temporarily retain unresolved
keys; hydration replaces those keys in place, preserving order and duplicates.
Binding lookups return fresh views with shared prototype getters rather than
allocating getter closures per lookup. Their lazy owner path and scope still
resolve through the requesting route runtime.
`scope.getProgramParent()` follows parent IDs once and retains the resolved view
within that runtime. It avoids creating unused intermediate scope views and
repeating the parent walk for every lookup.
Scope views use a stable class layout with shared parent/path accessors and
insertion methods. Methods that historically captured their owning scope remain
bound, so extracting `getBinding`, `rename`, or the other lookup methods preserves
the same owner. Lazy views and edit operations still use that route's runtime.

Binding visibility uses scope-tree intervals computed from parent identities.
A name declared in one scope needs a containment check; shadowed names use
sorted changes to the visible owner and binary search. JavaScript retains packed
views of these ranges rather than rebuilding a membership set or walking scope
parents for every lookup. A redundant transport-count word becomes a cursor for
repeated reads in the same visibility interval; bounds checks allow replay in any
order. Only names with bindings are transferred.

Scope metadata transfers ownership as a packed integer hash table instead of
rebuilding a JavaScript map for every semantic snapshot. The header holds the
scope count, bucket mask, and multiplicative hash constant, followed by four-word
scope records and two-word owner/public-scope buckets. Empty buckets use the
absent-ID sentinel. Linear probing compares exact node IDs, and later records
replace earlier records for the same owner. Scope records retain scope-ID order;
neither owner order nor source coordinates determine identity. Only the requested
snapshot retains the buffer, and loading metadata does not allocate a second index.

Prepared phases compile plugin order, permissions, and artifact demand once.
Per-file state follows that plugin order, including syntax-filtered plugins.
Route handlers bind lazily on delivery and keep caches and control state local to
their route runtime. Shared helper functions use the receiving runtime's owner,
contract, state, and edit queue; they must not capture another plugin or file.

Handler scratch pools keep one idle binding set per compiled route plan. Reentrant
transforms borrow a separate set. Every exit clears the per-file compiler and
restores bound slots, so paths and plugin owners never survive in idle handlers.
