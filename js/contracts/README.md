# Visitor contracts

A contract is the declaration of what a visitor may see and what it may do. Defining one checks and freezes that declaration. It does not traverse, pack a route, or commit an edit. A phase holds plugins or a native plan, never both.

Path capabilities are opt-in. Scope, ancestry, children, comments, and control flow show up on the callback only when the contract asks for them. A child role the contract did not declare, or that the node does not have, fails when it is read. Reading a list role as one child throws, and so does reading a single child as a list.

A visitor needs a route and at least one of enter or exit. Comments, when requested, are the comments inside the node. Child contracts are depth-bounded so a nested declaration cannot grow the route without limit. Ancestry is either a fixed walk or a small set of named walks, and an ancestry route cannot also carry predicates. A bare function is an enter callback.

`Function` and `Class` each arrive as one node type. A kind distinguishes a declaration, an expression, and a TypeScript ambient function. A route written for the declaration does not see the expression. A statement or declaration route asks for the declaration kind, so an ambient function is delivered only to a route that names it. A predicate that asks whether a node is a statement still answers yes for that ambient function. The referenced-identifier route matches identifiers that are references, bound or global. It does this by requiring the `global` fact, which only references carry.

## When a plugin runs

A syntax requirement is checked before state is created. The plugin is omitted, including cleanup, and the file continues. Names are concrete node kinds, plus async functions and generator functions as features, because those cut across several node types. Comments, string contents, and property names do not count. A plugin removed here adds no retention. Use this as a cheap filter, and use `analyze` when the check is semantic.

The list has to be nonempty, and every name has to be one of those features. An empty list or an unknown name fails when the phase is prepared.

`analyze` returning irrelevant happens after `pre`. Visitors and `apply` are skipped. `post` still runs. Returning unsupported bails the whole transform, and cleanup still runs.

A visitor that subscribes to every node bails unless broad visitors were explicitly allowed. That subscription disables the route plan the rest of the pipeline is built around.

## Pattern matching

Pattern matching reads member facts the native side already collected. Declare the member path for a static or computed member, or the name for an identifier, including on a child contract. A missing declaration fails. An identifier reached through a member-path declaration does not match, and neither does a node that is neither, such as a `super()` callee or a spread argument. Dots separate properties, and a backslash escapes a dot or a backslash. A broken escape, an empty pattern, or a value that is not a string does not match. A computed member has a path only when its key is a string literal.

For a fixed pattern, a predicate on the member path is cheaper. Predicates share chain prefixes, so nested members do not each carry a full path across the boundary.

## Text and lifecycle

Coercing a source fragment to a string fails. Ask for the text. Renaming an anonymous declaration needs the anchor and prefix that mark where the name is inserted.

Cleanup runs once for each plugin that was prepared, on success, bailout, and failure. Every prepared plugin still runs when an earlier cleanup throws. The first cleanup error is the one reported. It promotes a bailout into a fatal transform error and leaves an already-fatal error in place.

Helper and replacement intents are one registration per kind and key for the phase. The same realized content keeps the first registration and does not emit a second edit. Different content is a conflict, and so is a second replacement of the same key aimed at a different range.

Metadata keys and query capabilities are declared with the plugin. Two plugins cannot own the same key. A write or a query outside the declaration fails.
