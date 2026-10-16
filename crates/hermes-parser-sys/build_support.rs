use std::path::Path;

/// CMake can report runtime libraries as names or absolute archive paths. Both
/// forms must leave C runtime selection to rustc: embedding Zig's libc.a in a
/// Node addon introduces a second musl runtime alongside the host's libc.
pub fn is_rust_runtime(library: &str) -> bool {
    let path = Path::new(library);
    let name = if path.is_absolute() {
        path.file_stem()
            .and_then(|stem| stem.to_str())
            .and_then(|stem| stem.strip_prefix("lib"))
            .unwrap_or(library)
    } else {
        library
    };
    matches!(
        name,
        "c" | "m" | "dl" | "rt" | "util" | "pthread" | "gcc" | "gcc_s"
    )
}
