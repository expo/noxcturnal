# Engine

The engine holds a parsed program while JavaScript chooses plugins, asks for the nodes those plugins declared, and keeps one source for the whole transform.

Syntax checks and the function map read the input parse. Both can be read again. Materializing the tape, validating the program, or closing it consumes that parse. A later read fails. Selection and the first visitor phase share the parse, so a function map describes the file the caller passed.

The rest of the call keeps one resident source. Native phases and visitor commits update it in place and append a map layer. Finishing returns the code and the composed map. An all-native pipeline can do this in one call. Each phase that completed is returned. A phase that declined or failed its postcondition stops the run, and the code and map are absent. A parse or internal failure throws and returns no results. That phase has already taken the resident source, so a later read of the text or a finish fails. Every change goes through preflight or the edit commit, so the resident path and a direct call print the same output.

A failed visitor commit leaves the resident source intact. The source is replaced only when the code changed. A map layer is appended when the code or the map changed. Finish copies the resident source. The all-native entry takes it as it returns.

Map layers fold from the earliest phase to the latest, and VLQ is encoded once. A malformed layer fails. Either source-map budget throws. Callers leave both as throws.

## What a session keeps

The session answers binding queries, call queries, child batches, rename plans, and UID allocation. Scope parents and program-body offsets are collected once. Closing the session makes a later use fail.

Retention is opt-in. The manifest asks for identifiers, constants, calls, children, inspection, module facts, or any combination. Those are the only facts the session builds. Comment collection is separate: a visitor can ask for inner comments, and comment retention is its own capability. Declare every field the visitor reads. A field that is not valid on the route's node types is rejected when the pipeline is defined. A field that is valid and left out of the contract is absent on the node. Inspection with no scalar fields is a capability that was never declared.

UID allocation returns nothing from the native side when the identifier index was not retained. JavaScript then scans the source. A session that did retain identifiers answers from that index and remembers names it has already issued, including across a phase that did not edit. Allocation is a lookup.

A binding query with a name returns that binding. A query that omits the name returns every binding in the requested scope. An unknown name returns nothing. Asking only for reads or only for writes narrows that binding's reference list. The binding still comes back when the filter removes every reference. Nested traversal walks a bounded range. With nothing retained and no initial route, the session skips the parse and fills body offsets on the first request.

## The tape

A record identifies a node and its span. Parent and scope are added when the manifest asked for them, so JavaScript can walk without another native call. The first whole-file read takes the precompiled tape. Later reads rebuild it from the retained index. A manifest that does not match the one that tape was compiled for fails. A read that supplies a root start or a root end does not consume that tape and does not check the manifest: it is a bounded walk, not a claim on the whole-file plan. Replaying a route reads the index. The strings stay in the slab already built.

Semantic facts cover whether a reference is global, whether it reads or writes, which scope binds it, and the same questions for a callee or a member root. A write on an identifier needs the semantic build. A write on a member, including a private field, is filled from the shape of the expression. On any other node the fact is absent. Bools and small integers stay out of the string slab.

A static member chain rooted at an identifier is one string, with dots and backslashes escaped in the property names. A computed member counts when its key is a string literal. `this`, `super`, `import.meta`, an optional chain, a private field, and any other computed key have no member path.

A phase that emits no edits reuses the retained index. The pipeline's demand is what makes that safe.
