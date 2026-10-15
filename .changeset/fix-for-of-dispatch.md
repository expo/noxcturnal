---
'noxcturnal': patch
---

Lower for-of loops with Babel's standard createForOfIteratorHelper in inline and runtime modes. Preserve complete label chains and collision-free generated bindings while removing custom iterator dispatch, validation, and Symbol-binding rewrites. Adopt Babel's iterator lookup and cleanup semantics; inline helpers bail out with pristine input when root bindings shadow required globals.
