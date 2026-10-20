# Parser adapters

This is how a file Oxc will not parse becomes plain JavaScript or JSX before the native pipeline. Classification and Flow erasure run in Rust. Naming an adapter pins that implementation. Native Flow erasure leaves a named adapter alone.

The file is classified first. The parser option may rewrite the extension before that, so a declaration file can be forced without renaming the caller's path. An automatic or omitted parser keeps the filename.

When the file is Flow and the caller did not name an adapter, native erasure runs first. Success replaces the working source and forces JSX classification, so the `@flow` comment does not send the file back through classification as Flow. A decline records a diagnostic and continues to adapter selection. A binary built without Flow erasure is that kind of decline. A throw from erasure propagates. A rejected construct, a malformed buffer, or a cover-grammar node stays a throw.

Otherwise the named adapter runs, or the first registered adapter that accepts the classification. After erasure or a successful adapter, the file is treated as Oxc-supported JavaScript or JSX. Later phases trust the syntax the adapter declared, even when an `@flow` comment is still in the text.

Registration is one process-global map. A second registration of the same name throws. The function returned from a successful registration removes it. Cache identity includes a registered adapter's name, version, and options. The pipeline key sees only an adapter the caller named. The classification key also sees the adapter selected for that file, including one chosen because it accepted the classification. Change the version when the adapter's output changes, or a previous result will be reused.

An unsupported adapter result is a bailout of the string passed to `transform`, including a buffer erasure had already produced. An unknown name is an error only when the file is unsupported. A supported file never consults it. That error is raised before the transform's own handling, so it stays a plain failure.
