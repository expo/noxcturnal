---
'noxcturnal': patch
---

Remove the optional `maxNativeMemoryBytes` and `maxFollowUpBatches` transform settings and their session enforcement. Native sessions continue to close at phase and transform lifecycle boundaries.
