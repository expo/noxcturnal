# `@noxcturnal/noxcturnal-darwin-x64`

Optional native binary for [`noxcturnal`](https://github.com/expo/noxcturnal) on macOS Intel
(`darwin` / `x64`, Rust target `x86_64-apple-darwin`).

Application code depends on `noxcturnal`. This package is one of the eight optional dependencies
that package selects, published in the same fixed version group. It has no JavaScript API. The
loader tries a colocated `noxcturnal.darwin-x64.node`, then requires this package. Node.js 18 or
later. The `os` and `cpu` fields limit installation to this target.
