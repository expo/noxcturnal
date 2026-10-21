# `@noxcturnal/noxcturnal-win32-x64-msvc`

Optional native binary for [`noxcturnal`](https://github.com/expo/noxcturnal) on 64-bit Windows
(`win32` / `x64`, Rust target `x86_64-pc-windows-msvc`).

Application code depends on `noxcturnal`; its loader selects the matching native package. The JavaScript package and all eight native packages are released at the same version so the binding and binary stay compatible. This package has no JavaScript API.
