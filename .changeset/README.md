# Changesets

Add a changeset for every user-visible change:

```sh
pnpm changeset
```

The root package and its eight native platform packages form one fixed release group. A change to
any package therefore versions all nine packages together so that optional native dependencies
cannot drift from the JavaScript loader.

On `main`, the release workflow maintains a version PR. Merging that PR builds every native target
and publishes the complete workspace through npm trusted publishing. Provenance remains disabled
while the source repository is private.
