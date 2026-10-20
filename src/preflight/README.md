# Native preflight

This is one native phase. The public switches are described with the TypeScript plan. Illegal combinations are rejected when the pipeline is defined. Flow erasure runs earlier. A file that was erased arrives here as JavaScript, reclassified as JSX when an `@flow` comment would otherwise make it look like Flow again.

Some repairs live in the vendored Oxc transformer and React Compiler. A later plugin in the same visit has to see the syntax they generate, so a pass after that visit returns is too late. The notes beside those crates list the repairs. The list started against a clean vendor drop. The trees have moved since, and that list was not rewritten with them. Confirm a bullet against the current source before relying on it.

## What a phase can return

Completion means the phase produced output. A decline means the file is legal and this transform will not take it: no code, no map, and the caller gets a bailout of the original input. That is how a missing compiler build, an escaped regexp name, a mutable namespace export, a shadowed for-of helper, an unsupported helper runtime, and a RegExp shape this pass will not lower are reported.

An error means a rewrite already ran and a postcondition failed. The partial buffer is not returned. A semantic diagnostic after an in-tree rewrite is this outcome too. The diagnostic is fatal because the rewrite already changed the tree, and continuing would print a program the later passes did not mean to accept.

A throw happens before a status exists. A secondary flag whose owner is off, optional chaining and nullish coalescing with different loose settings, JSX options without a mode, and React Refresh options without Refresh are configuration errors. An ordinary parse error throws. A semantic diagnostic on the first build throws in that same parse-failure shape, because nothing has been rewritten yet.

## Order

Nothing active and no function map returns the input unchanged.

The React Compiler in a binary built without it declines. A normal build includes the compiler and Flow erasure.

A language prepass runs when the file is TypeScript and a later rewrite will read it, or when legacy decorators are on and the text contains both a decorator and a class. Oxc would otherwise strip TypeScript in the same visit as the ES lowerings, after the in-tree rewrites. Those rewrites would have to understand parameter properties, overloads, and declared fields, and enum lowering would emit block-scoped bindings after block scoping had already run. The prepass prints unminified JavaScript and the later parse treats the file as JavaScript, so the strip does not run twice and drop a JSX factory import it just kept. A prepass parse failure is left for that later parse, which reports the original spans.

Public class fields are not rewritten into static blocks during the strip. With that rewrite on, a static field becomes a static block and the field pass the caller selected never sees it. JSX syntax is not lowered here. React Refresh has to see element names, and it writes into a body the parameter rewrite also changes, so Refresh, the compiler, and JSX stay in the later visit.

Legacy decorators run in the prepass. Their helper names are then reserved, and a name already taken is suffixed. The reservation exists so a later UID cannot collide with the helper the prepass just emitted.

The file is reparsed. An escaped regexp name declines. Any other diagnostic throws. The function map comes from this parse, unless the prepass already took it from the input.

Folding, dead-code elimination, compacting, or comment stripping, with nothing else to lower, skip the rest. Comment stripping uses the parser's comment list.

Otherwise the in-tree rewrites run, then one Oxc visit, then the fixups that have to see what that visit emitted. Helpers are inserted after the hashbang and the directives, and they are left unmapped. The prepass map and the final map compose.

Lookbehind and match indices stay as written. Oxc's plugins for them are off, whether or not other transforms run. The sticky flag is Oxc's sticky-flag pass. Named groups and set notation are lowered here, and Oxc's named-capture plugin is off.

## Before the Oxc visit

Loose object rest runs first. Built-ins emit `Object.assign`. Otherwise the pass emits its own extend helper. A spread that is the first property seeds an empty object. Later properties copy into that object. Spec-shaped rest stays with Oxc.

RegExp lowering covers the unicode flag, Unicode properties, dot-all, named groups, and set notation lowered toward unicode. An unsupported class, property, or set shape declines. A selected flag that is still present afterwards is fatal. The rewrite claimed the flag and then left it behind.

When loose class properties are on and the class pass is off, a static initializer is given a stable superclass binding.

Captured loops run next, and repeat until none remain. See the block-scoping note.

Class lowering, class properties, private methods, or the private `in` operator then lower classes. Selecting classes owns fields, static blocks, and private state, and Oxc's class-feature plugins stay off for that file. Public fields follow the spec unless loose. A focused private pass that takes a class also lowers that class's public fields. With class properties set, those fields follow its loose setting, which defaults to the spec. Without it, the focused pass lowers them loose, because the caller asked for the private representation and not for spec fields. Private state is always the loose form. A `this` in a derived constructor becomes an assertion that `super()` has been called, which is what pulls in the assert helper. When classes lowers a declaration, the result is a lexical binding of the same name and the class keyword is gone. A default export of a named class keeps that name as the binding and then exports it. A comment on the export stays with the lowered class. A nested class keeps its own super. Computed keys stay in the surrounding function. Yield and await in a key would be syntax errors inside the class wrapper. A class left behind when classes was requested is fatal.

Parameters lower non-simple formals. Oxc is left a single flat non-loose object rest only when the parameter list is that one pattern: no body-scope wrapper, no generator, no rest parameter, no `arguments` binding, and `eval` is not reserved. Ordered, nested, exported, and loop patterns stay here, as do assignments in parameters, fields, and concise arrows. A simple rest whose initializer is an identifier is snapshotted as a comma expression before Oxc copies it, so a getter cannot retarget the copy by reassigning that name. A formal that is still non-simple is fatal.

For-of lowers next, through Babel's iterator helper. Labels on the loop stay. For-await stays with Oxc. Parameters can introduce the helper's temporaries and capture aliases, so this pass rebuilds semantics and reserves helper names before it plans. Inline helpers, and a runtime older than the Babel helper, decline when `Symbol`, `Array`, or `TypeError` is bound in the root scope. The helper calls those as globals, and a root binding would make the inline copy see the wrong one. A remaining non-await for-of is fatal.

Destructuring covers declarators, catches, assignments, and for-loop left patterns. If parameters or for-of already rewrote the program, semantics are rebuilt first. An object rest with no excluded keys is a copy through the extend helper, which snapshots keys once before getters run. A numeric or bigint computed key is excluded as a string, so the rest helper compares strings.

Symbol block scoping runs after those passes, because they introduce bindings. An earlier plan is reused only when none of them ran.

Class helper names are reserved before parameters, for-of, and destructuring. RegExp helper names are included in the block-scoping plan and reserved again before for-of is planned. The reservation has to happen before the pass that allocates UIDs, not after the pass that emits the call.

## The Oxc visit

One visit covers the remaining ES, TypeScript, JSX, Refresh, and React Compiler work. These repairs stay inside it because a later plugin in the same visit has to see the syntax they generate:

- Logical assignment, including private targets, so the nullish pass sees the generated nullish expression. A separate pass after the visit could not do that, and the host post-pass was removed.
- Optional chaining: mutable receivers, the parameter scope, and a parenthesized delete or call. When both optional chaining and nullish coalescing are on, their loose settings match or the phase throws. Loose optional chaining sets the assumption that `document.all` is ordinary, and only then. Optional chaining and the private-field chains inside class lowering read that assumption. Nullish coalescing does not.
- Exponentiation assignment captures computed receivers and keys while the reference is built.
- Constructor parameter properties are initialized after a super call that sits in a try or a conditional.
- Legacy decorators keep member grouping, setter metadata, rest adapters, private-environment placement, and legal auto-accessor names.
- Async lowering keeps method parameters, directives, for-await labels, and iterator binding identity. Oxc visits Refresh before async-to-generator. Refresh replaces a hook-using async function after the inner awaits have already become yields, which leaves a bare yield in a function that is still async. Babel avoids that by re-queuing the node. Here, async lowering moves to a second visit on the scoping the first returned. Refresh stays in the first visit so it can see JSX.
- Explicit resource management keeps hoisted functions inside disposal scopes, and executable top-level enums run before resource statements are split apart.
- TypeScript enum initializers keep their effects, import aliases keep their order, and JSX fragment factories keep their roots.
- JSX comment directives and escaped pragmas are honored, and the runtime that was actually used is reported back. The host does not parse directives again.
- The React Compiler runs first in the visit, on the AST that visit was given. The panic policy decides whether a compiler diagnostic aborts that visit. Refresh reset comments are captured before the compiler rebuilds the function.

The panic policy defaults to leaving an uncompiled function as written. JSX and the rest of the file still run. Aborting on critical errors treats a preserved manual memo as a warning even though it is displayed as an error, so that setting leaves it alone. Aborting on every diagnostic includes warnings. A configuration error aborts on all three settings. The abort stops the rest of this visit and comes back as a transform error.

A file that already has a value import of the compiler's cache helper from the compiler runtime is left uncompiled. The other plugins in the visit still run. A blocklisted import skips compilation of the whole file. That diagnostic is advice, so the two looser policies continue and only the strictest aborts.

Custom opt-out directives are appended to the two built-in directives. The compiler uses the list it is given in place of that built-in pair, so those two are placed in front. A custom directive that repeats either of them is left out.

Export-namespace attributes are captured before the visit and restored after it. JSX spread positions are recorded before the visit and applied only when the runtime that comes back is classic.

A mutable namespace export is returned only when every diagnostic from this visit is Oxc's namespaces-exporting-non-const message. One other diagnostic in that list keeps the failure fatal.

## After the visit

Iterator bindings the async pass reported are checked.

Object spreads that are the props of a classic createElement call are lowered. Oxc ignores Babel's option to keep those spreads. Development and automatic runtimes leave those objects alone. The match is by AST identity. Another transform can emit a call that starts at the same JSX position, so a source prefix is the wrong key.

Loose mode rewrites the spec object-rest helper to the loose helper. Private-method or private-in syntax still present is fatal.

Block scoping runs again when the visit introduced lexical bindings. TypeScript enums and namespaces are the usual source. Babel's TypeScript plugin emits var, so a Babel comparison skips this round. Only a file that would fail the postcondition pays for the extra work.

Constant folding and dead-code elimination follow Metro's conservative rules. Unary and binary operations fold to null, a boolean, a finite number, or a string. A lone surrogate is left alone. A logical or conditional operand that is a reference, a function, a class, or an optional chain is wrapped so the selection still performs GetValue. Non-finite numbers stay. An if whose branch is a function declaration is left as written. So is one whose discarded branch contains a block function. Dropping that branch would drop the binding. Elimination removes an unused function declaration, and an unused binding whose initializer is a function, including a block-scoped var. A plain unused value stays. Direct eval skips that removal. A binding inside with, and a sloppy block-level function, stay. With module context, a script's top-level function bindings can be removed when nothing in the file reads them. Parsing stays script semantics. A checked scope is reused only when folding did not run, because folding invalidates it.

## Helpers

Oxc's helper requests map onto the pinned Babel helper metadata: where the helper lives, how old the runtime must be, and how it is exported. Runtime mode accepts the Babel runtime only. Another module name declines. An empty or unparsable version declines. An omitted version is read as the oldest beta this table knows. Only major version 7 at or above a helper's minimum loads from the runtime. Any other major, inline mode, and a runtime older than that minimum emit the generated fragment. An Oxc helper with no fragment here declines. The table matches the helpers this pass knows how to load. `setFunctionName` is not in it. Static blocks with the class pass off can ask Oxc for that helper, and helper selection then has no row for it.

In-tree passes record their own helper names where they emit the reference. Those exact names are inserted into an orphan scope before later UID allocation, so a generated binding cannot collide with a helper. The scan that decides whether a fragment's own binding is free is separate: it decodes unicode escapes and then splits the source, including strings and comments, so an escaped spelling of a helper still counts as taken.
