# Preflight plan

The pipeline checks the plan when it is defined, then the binding flattens it for the addon. The [native preflight note](../../src/preflight/README.md) is where that plan runs.

A plan chooses syntax lowering, optimization, type stripping, JSX, the React Compiler, React Refresh, helpers, compacting, and comment policy. Option objects are closed: a missing or extra key fails when the pipeline is defined. Switches are booleans. False and omitted switches are removed before the plan is considered active. An absent or empty plan disables the phase, and a phase with no remaining operation is dropped. Helpers, and JSX options other than the mode, do not count as an operation.

Module context affects dead-code elimination of a script. It does not change the parse. Development JSX defaults to impure calls. Rejecting namespaced JSX defaults on, matching Babel. JSX companion options without a mode are rejected, because they have nothing to configure. Helpers are either loaded from a runtime or emitted inline. Another mode fails on the native side.

The React Compiler's mode, panic policy, and target are closed sets. A missing or foreign value fails when the pipeline is defined, as does a non-boolean reset flag or a custom opt-out list that is not a list of nonempty strings. Custom opt-out directives are appended after the two built-in directives, `use no memo` and `use no forget`. A custom directive that repeats one of them is dropped. The panic policy decides whether a diagnostic aborts the visit or leaves the function as written. The [native note](../../src/preflight/README.md) is where that decision is applied. React Refresh's names and signature flag are the same kind of closed set.

Several switches share one implementation. Selecting class lowering owns fields and private state in the same file. Private methods and the private `in` operator use one loose representation. The RegExp unicode flag also expands Unicode property escapes.

Conditional JSX may share the phase with block scoping, and with comment stripping when block scoping is also on. A rewrite, a fold, type stripping, the compiler, Refresh, or compacting belongs in another phase. Dead-code elimination is reported as the optimizer, same as a fold. Helpers, JSX companion options, and module context can sit on the phase too.

When both optional chaining and nullish coalescing are on, their loose settings have to match. Loose optional chaining is what sets the assumption that `document.all` is an ordinary value. Nullish coalescing reads that assumption only through the shared setting.

Lookbehind and match indices are recognized and left as written. The sticky flag is lowered.
