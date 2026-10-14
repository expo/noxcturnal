---
'noxcturnal': patch
---

Preserve complete iteration-label chains when lowering for-of loops, avoid capturing external names and shadowed Symbol bindings, and invoke cached iterator methods without consulting their own call properties. Keep iterator receivers, single method lookup, and cleanup error precedence intact.
