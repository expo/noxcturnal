---
'noxcturnal': patch
---

Improve nested traversal performance by bounding scans to the requested source range instead of scanning the entire file for every query. Use compact, linear-time indexes to reduce setup cost and memory while preserving visitor order, enter/exit events, ancestor hydration, and dynamic subscriptions.
