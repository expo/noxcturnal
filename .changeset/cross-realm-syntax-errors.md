---
'noxcturnal': patch
---

Preserve syntax error classification for native parse failures across JavaScript realms, including Jest and VM contexts. Invalid input now throws `TransformSyntaxError` with its error code, location, filename, and code frame in these environments.
