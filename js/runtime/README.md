# Transform runtime

`transform` is the synchronous public entry. The three outcomes are in the [root README](../../README.md).

The definition scope closes first, so phases created at load stay outside the intern budget. The file is classified. Flow erasure or a parser adapter may replace the working source. Erasure runs only when the file is Flow and no adapter was named. A named adapter wins.

Native phases and visitor phases then share one resident source. A native phase uses the same entry as a standalone preflight call. A visitor phase collects the nodes the surviving contracts asked for and delivers them. Edits commit together at the end of the phase. The next phase sees the printed result.

The React Compiler after an adapter or an erasure map bails. The compiler reads the caller's original file, and that file is gone once an adapter or erasure has replaced it.

A function map is collected from the input parse, before lowering, and that parse is reused. An earlier bug collected the map after the file had already been rewritten.

A bailout is the signal for a plugin that declines the file, a native decline, an analysis result of unsupported, and a visitor that subscribed to every node. The source on that result is the string the caller passed, including when erasure or an adapter had already produced a working buffer.

A native parse failure is recognized by a prefix on the error message, with a JSON payload after it. The check reads the message, so an error that arrived from another realm still converts. A payload that matches becomes a syntax error, and the prefix is removed from the message callers see. The native column is zero-based. The message and the code frame print the column people count from one. The location stored on the error keeps the native column.

Syntax rejection removes a plugin before state is created, so that plugin has no cleanup. Analysis that finds the plugin irrelevant still runs the post hook. Cleanup runs for every prepared plugin on success, bailout, and failure, even when an earlier cleanup throws. The first cleanup error is reported. It promotes a bailout and leaves an already-fatal error in place. On a file the parser rejects before any phase runs, a throw from state creation is reported as that value. A cleanup throw while handling that failure is dropped. A cleanup throw after those plugins were prepared becomes a fatal transform error.

Pattern matching checks the declared fields and reads native member facts. Skip ranges reset between traversals. Identical ranged edits are collapsed only after the native commit rejects the batch, and only when they cover the same span. A zero-width edit is kept. Identical edits on different spans stay, because that commit already succeeded. An overlap that remains is attributed to the plugins that own the two edits.

After a visitor phase, a plugin or phase that promised not to edit, and then did, fails.

Rename rewrites the local binding. An unbound name fails, and so does a replacement that is not an identifier. Shorthand keeps the name outside the binding: a property, an import, and an export keep the original exported or property name and change the local one. An exported declaration loses the export keyword on the declaration and gains one export clause after it. Plugins in the same phase append to that clause, and to the same scope wrapper, instead of emitting a second copy.

Pushing a statement into a class goes to the nearest scope that has a statement list. Pushing into a switch goes to the enclosing function, static block, or program. A class body has no statement list, and neither does a statement sitting before the first case. When nothing above can take the statement, the push fails.

Two capture requests for the same function that disagree on which program bindings to close over are a conflict.

Replace emits one edit per match. A global expression starts at the beginning. When that expression is also sticky, the scan stops as soon as a match does not begin on the cursor, so a later match that is not anchored there stays. A sticky expression that is not global resumes at the expression's cursor, and stops if the next match is not on that cursor. A non-numeric or negative cursor becomes zero. A positive cursor truncates toward zero. Past the end of the text, nothing matches. The length check uses the full number, before the cursor is stored as an offset, which keeps a huge cursor from wrapping into a small index. A plain string is escaped before search. Unicode flags decode the pattern as Unicode and leave an unpaired surrogate as an unpaired code unit.

A program insertion has to stay its own statement and its own line. It always ends with a newline. Plain text that is not already a terminated statement, or that contains a slash, also gets a semicolon, so it cannot glue to the next statement or open a comment or a regex. A composite is treated as terminated only when its last part is a string that already ends as a statement. A slash in a part forces the semicolon only once the composite is otherwise terminated. The first insertion at an offset also gets a prefix: a leading newline when the offset is past the start and the previous unit is not a line break, and a semicolon when the directive above a prologue, or the statement above an append, is unterminated. An append whose file ends in a trailing line comment also inserts a newline at the end of the source, so the comment does not swallow the insertion.

A provenance fragment keeps its source range so the piece table can map it. Coercing it to a string fails. Ask for the text.

Queries are reused when the request is unchanged. Each immutable buffer the scheduler holds has an identity. A phase that emits no edits keeps that identity, and with it the retained index. Asking for fresh semantics or for printed input builds a new semantic index or a rendered buffer instead.
