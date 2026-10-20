---
'noxcturnal': patch
---

Include filenames, source locations, and Babel-style code frames in native transform errors. Trace error locations through earlier transform phases so Metro can identify the input file and line.

Resolve diagnostic filenames against the new `projectRoot` transform option, defaulting to the current working directory.
