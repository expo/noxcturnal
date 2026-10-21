# `@noxcturnal/noxcturnal-linux-arm64-musl`

Optional native binary for [`noxcturnal`](https://github.com/expo/noxcturnal) on musl Linux
(`linux` / `arm64`, Rust target `aarch64-unknown-linux-musl`).

Application code depends on `noxcturnal`; its loader selects the matching native package. The JavaScript package and all eight native packages are released at the same version so the binding and binary stay compatible. This package has no JavaScript API.
