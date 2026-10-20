# Syntax boundary

Classification, fragment checks, and UID reservation sit at the edge of a parse.

The extension decides the syntax. Declaration files, including the module and CommonJS declaration suffixes, are declaration files. TypeScript and JSX suffixes follow their names. A script, module, or CommonJS file is Flow when a leading comment, after an optional hashbang, contains `@flow` as a whole word. Flow and an unrecognized extension are unsupported here. Every other recognized extension is Oxc-supported. Classification is the extension plus that directive. A React Native codegen scan used to ride along on the result and was removed.

Classification runs once, at the public boundary. Later passes trust the source type they were given. After erasure or an adapter, the TypeScript runtime may replace that syntax. A Flow file that was erased is reclassified as JSX, because the `@flow` comment would otherwise classify it as Flow again.

An escaped regexp name that the parser rejects is the one parse case preflight returns as a decline. Other parse diagnostics throw.

Expression and statement fragments are checked before generated code is inserted. The parser mode follows the phase's source type. A fragment that fails throws before the piece table sees it.

UID reservations live on the session, separate from the source text. A reused session keeps names it has already issued, including across a phase that did not edit. A session that retained identifiers uses that index. Otherwise allocation scans the source and caches the names.

Binding identifiers, references, identifier names (including static property names), and labels reserve a UID. Comments and string literals do not. A generated name may match text that appears only inside a string.

Helper-name reservation is a separate scan, used when a preflight pass emits a helper. It decodes unicode escapes before it splits the source, and it may include strings and comments. An escaped spelling of a helper still counts as taken there. The two scans disagree on purpose: a UID is a new binding and must not collide with names the program can see, while a helper fragment is real source and must not collide with a name that source already spells.
