---
'noxcturnal': patch
---

Load the published ESM entry by defining `require` and `__dirname` from `import.meta.url` before native initialization. CommonJS loading is unchanged. A missing colocated addon still falls back to the optional native package, and a missing package still throws.
