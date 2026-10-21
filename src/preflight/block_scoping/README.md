# Block scoping

This lowers `let` and `const` inside a native preflight phase. The preflight note says when it runs.

A binding a closure captures needs a fresh box on every iteration. Everything else is a rename. The two halves share one classification of which bindings are captured. The rename half fails if a captured binding is still present, so a binding the loop rewrite declined to touch is not renamed into the wrong shape.

The loop rewrite has to keep exits and lexical boundaries, not only rename the binding, and it has to terminate when the remaining loop bindings are uncaptured.

Removing an unused block-scoped var whose initializer is a function is the optimizer's job. It is a later pass. A plain unused value stays.

## Captured loops

Captured loops run first and repeat until none remain. Each round drops semantics, rewrites, and rebuilds them. A missing target, or a semantic error after the rewrite, is fatal. The tree and the scope information have diverged, and another round would rename against a lie.

For a captured for-loop, the test and update move into the next iteration. The binding list records which names are captured, which must keep a const write error, and which are parameter aliases.

Which loop a declaration belongs to is decided by walking ancestors. Generated parameter-rest loops reuse source anchors, and those spans can overlap a later sibling. Ancestry is what still associates the declaration with its loop after the rewrite. A closure nested inside the loop still counts as capturing it, and that loop is wrapped. A function in the header owns its locals. Those stay with the header.

The extracted body is rewritten in one walk over its direct statements: hoisted var, exits, and arguments. Declarations are initialized before a use in that same body. The walk does not follow data flow. A body under with is left alone. Returns, breaks, continues, labels, await, yield, and finally are recorded so the extracted function keeps them.

Some uninitialized let or const declarations run again on later iterations and do not need the full captured-loop box. Those are found by walking the program in source order with a stack of active loops. A reset is an uninitialized declaration inside the active loop body, at that loop's boundary depth. A declaration still pending before the body, and an uninitialized let or const in a for-in or for-of head, are the loop's own bindings and are not recorded as resets.

## Renames

Names come from the semantic symbols, not from scanning source text. Reserved names from class, destructuring, regexp, and decorator helpers are already taken.

A function-scoped binding keeps its name when a lexical binding collides with it, including when the function declaration appears later. Otherwise the shallowest lexical binding keeps the name. Trailing digits are stripped first, so a name that already ends in a number starts from the stem, then the stem with a suffix, and so on.

An early rename plan is built only when block scoping still has let or const, classes did not rewrite the file, and parameters, for-of, destructuring, and object rest are all off. Selecting object rest skips that plan even when it is not loose. Any of those passes rebuilds the plan. A diagnostic on that rebuild is fatal: the plan would otherwise rename bindings the rewrite just moved.

The rename runs again after the Oxc visit when let or const is still present. Oxc lowers TypeScript enums and namespaces to let. Babel's TypeScript plugin emits var, so that comparison does not take the second round. A let or const pattern that remains is fatal.

## Private stores

A store to a private method or a getter-only private accessor still throws at runtime. Hermes keeps private syntax, so the error is emitted here even when the caller did not select the private-method transform. The helper is the read-only error, with a temporary for the value that was written.

Helpers from this pass follow the phase's inline or runtime mode.
