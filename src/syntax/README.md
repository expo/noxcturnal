# Syntax boundary

This directory classifies file syntax, validates generated code fragments, and reserves unique names. The [adapter layer](../../js/adapters/README.md) calls classification before the pipeline, and native transforms use the other checks while producing code.

Classification uses the filename and leading Flow directive. Later passes trust the syntax supplied by the runtime. Do not reclassify transformed source: an adapter or erasure pass may retain `@flow` in otherwise ordinary JavaScript.

Validate generated fragments in the phase's parser mode before committing edits. Invalid generated code is a failure, rather than a compatibility fallback.

Name reservations live with the session so reused phases cannot issue the same generated name twice. Ordinary UID allocation avoids names the program can reference. Helper reservation also scans strings, comments, and escaped spellings in helper fragments. Do not merge those scans merely because both collect names.
