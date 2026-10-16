---
'noxcturnal': patch
---

Improve function-map generation performance by interning frame names and reusing integer IDs at mapping boundaries. Infer callee names directly from the AST so anonymous IIFE bodies cannot become names, and correctly handle parentheses, comments, and escaped string member keys.
