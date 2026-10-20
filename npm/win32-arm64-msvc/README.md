# `@noxcturnal/noxcturnal-win32-arm64-msvc`

Optional native binary for [`noxcturnal`](https://github.com/expo/noxcturnal) on 64-bit Windows
ARM (`win32` / `arm64`, Rust target `aarch64-pc-windows-msvc`).

Application code depends on `noxcturnal`. This package is one of the eight optional dependencies
that package selects, published in the same fixed version group. It has no JavaScript API. The
loader tries a colocated `noxcturnal.win32-arm64-msvc.node`, then requires this package. Node.js
18 or later. The `os` and `cpu` fields limit installation to this target.
