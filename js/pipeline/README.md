# Pipeline definitions

This turns plugin and phase definitions into interned objects, cache keys, and packed routes. It does not parse a file or run a visitor. Bind per-file predicate values into the definition, or read per-file data during the transform.

Defining a plugin freezes the visitors and the syntax requirement, and attaches the ways to vary options and predicate parameters. The same parameter values return the same definition. Binding fails when a parameter is missing, when a scalar and a list are swapped, or when the name was never declared.

A phase is plugins or a native plan. An unknown native key fails when the phase is defined, unless the value is false or omitted, which drops the key. A malformed option object fails then too. False and omitted syntax switches and optimizer flags are removed, and a phase with no remaining operation is dropped. Helpers, and JSX options other than the mode, are not an operation by themselves, so they do not keep an otherwise empty phase. Composing a pipeline accepts only phases that were defined as phases.

Conditional JSX, the mode that transforms only when the file contains JSX, may share its phase with block scoping, and with comment stripping when block scoping is also on. A rewrite, a fold, type stripping, the React Compiler, React Refresh, or compacting belongs in another phase. Those would run even on a file the JSX pass decided to leave alone.

The same structural phase returns the same object, which is what makes route compilation hit its memo. Define reusable phases at module scope, before any file is transformed. The first `transform` closes that scope. Phases created earlier are program configuration and are not counted against the later budget. Shapes first seen afterwards share a fixed number of extra slots. A shape already interned still hits. A shape past the budget is returned uninterned, so its routes compile again on every use. The call does not throw. Building phases lazily on the first file spends those slots on shapes that were meant to be reused.

## Cache keys

The pipeline cache key hashes the filename, the transform options except per-file plugin data, the phase graph, and each plugin's name, edit effect, options, contract, and visitor shape. A parser adapter enters that key only when the options name one and that name is registered. The shape records whether enter and exit exist. It does not record the function itself, so two plugins with the same declaration share a key even when their closures differ.

The classification cache key adds the classification, the adapter selected for that file, and, for Flow only, whether this binary includes Flow erasure. An adapter chosen by classification is on this key.

The stable encoding keeps negative zero, NaN, holes, and missing values distinct from the values ordinary JSON would collapse them into.

## Routes

A phase's effect defaults to the strongest plugin effect, or whole-program when the phase is native. A plugin that omits its effect counts as whole-program when the phase leaves its own effect unset. Effects run from "this phase does not edit" up through text, expression shape, bindings, and module structure, to a change of the whole program. The same plugin object twice in one phase is rejected. A native phase needs the source printed before it runs. After a visitor phase, a plugin or a phase that promised not to edit, and then did, fails.

Asking for semantics also asks for a syntax route. Asking for syntax, semantics, or a realized map also asks for rendered text. From that, the smallest construction is chosen: a cached phase, a render, a render with a map, or a fresh syntax or semantic index. A phase that emits no edits can reuse its index because the source version did not change. A phase whose demand does not match that construction either rebuilds on every file or serves stale bindings.

Routes expand aliases, collapse function and class kinds, and merge fields, child roles, and ancestry. A collapsed function or class key requires the kind to equal that key. Reached through an expression alias they require the expression kind. Reached through a declaration or statement alias they require the declaration kind. A referenced-identifier alias requires the identifier to be global. Validation rejects an unknown route, a field that is not valid on every concrete type the route covers, mixed predicate operators, non-finite numbers, a predicate value list past the decoder's limit, and a predicate parameter that was never bound. A plugin removed by its syntax requirement contributes no routes. An empty syntax list, or a name that is not a node type or one of the two synthetic function features, fails when the phase is prepared.

The packed manifest is bounded to the same route, predicate, and field limits the Rust decoder enforces.
