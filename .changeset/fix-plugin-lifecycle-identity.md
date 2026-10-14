---
'noxcturnal': patch
---

Preserve plugin cleanup failures and clean every prepared state once, including unsupported-input bailouts. Keep editor and metadata ownership separate for same-name plugin definitions, store special metadata keys as own properties, and compare keyed intents against their registration source and phase occurrence. Reject duplicate plugin definitions within one phase before lifecycle hooks run; reuse across phases remains supported.
