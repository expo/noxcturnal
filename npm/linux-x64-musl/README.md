# `@noxcturnal/noxcturnal-linux-x64-musl`

Optional native binary for [`noxcturnal`](https://github.com/expo/noxcturnal) on musl Linux
(`linux` / `x64`, Rust target `x86_64-unknown-linux-musl`).

Application code depends on `noxcturnal`. This package is one of the eight optional dependencies
that package selects, published in the same fixed version group. It has no JavaScript API. The
loader tries a colocated `noxcturnal.linux-x64-musl.node`, then requires this package. On Linux it
chooses `musl` when the process report has no glibc version. Node.js 18 or later. The `os` and
`cpu` fields limit installation to this target.
