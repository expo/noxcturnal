# `@noxcturnal/noxcturnal-linux-arm64-gnu`

Optional native binary for [`noxcturnal`](https://github.com/expo/noxcturnal) on glibc Linux
(`linux` / `arm64`, Rust target `aarch64-unknown-linux-gnu`).

Application code depends on `noxcturnal`. This package is one of the eight optional dependencies
that package selects, published in the same fixed version group. It has no JavaScript API. The
loader tries a colocated `noxcturnal.linux-arm64-gnu.node`, then requires this package. On Linux
it chooses `gnu` when the process report includes a glibc version. Node.js 18 or later. The `os`
and `cpu` fields limit installation to this target.
