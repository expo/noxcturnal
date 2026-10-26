# Block scoping

This directory lowers `let` and `const` during [native preflight](../README.md), using semantic bindings to preserve which variable each reference reads.

Loop bindings captured by closures need a separate binding for each iteration. Replacing `let` with `var` alone would make callbacks from different iterations share one binding. Uncaptured lexical bindings can be renamed to avoid collisions when their declarations become function-scoped.

Captured-loop rewriting runs before renaming. Both steps share the capture classification, and renaming must reject captured bindings that were not successfully rewritten.

Use ancestry to associate declarations with loops, and node IDs to identify mutation roots and loop targets. Generated code can reuse source anchors, so spans alone do not reliably identify the owning loop. Extracted loop bodies must preserve exits, labels, `arguments`, and async or generator behavior.

Rebuild semantics after rewriting before planning renames. Earlier preflight passes and Oxc's TypeScript lowering can introduce bindings, so a rename plan cannot survive those changes unchanged. Helper names must already be reserved when names are allocated. Apply binding and reference renames and read-only write protection by their semantic IDs: generated nodes can share both a source span and a name while referring to different bindings. Apply the plan before rebuilding semantics again, since that rebuild can reassign IDs.

Private method and getter-only stores also need runtime write errors here when private syntax is retained. Keeping the syntax does not preserve that error by itself.

Rename priority preserves function-scoped bindings first, then the shallowest
lexical binding. Equal-depth ties follow the current semantic scope traversal.
Do not sort bindings by source anchors: moving declarations or sharing their
spans must not change which binding keeps its name.
