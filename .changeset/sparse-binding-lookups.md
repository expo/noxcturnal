---
'noxcturnal': patch
---

Fetch binding details only for requested names instead of loading every binding in each scope. Batch uncached lookups into one native request and reuse cached results while preserving shadowing and read/write information.
