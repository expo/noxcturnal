#[path = "../build_support.rs"]
mod build_support;

#[test]
fn leaves_c_runtime_selection_to_rustc_for_names_and_archive_paths() {
    for name in ["c", "m", "dl", "rt", "util", "pthread", "gcc", "gcc_s"] {
        assert!(build_support::is_rust_runtime(name), "{name}");
        let archive = format!("/zig-cache/o/target/lib{name}.a");
        assert!(build_support::is_rust_runtime(&archive), "{archive}");
    }
}

#[test]
fn preserves_cxx_runtime_libraries() {
    for library in [
        "stdc++",
        "c++",
        "c++abi",
        "/zig-cache/o/target/libc++.a",
        "/zig-cache/o/target/libc++abi.a",
        "/zig-cache/o/target/libunwind.a",
    ] {
        assert!(!build_support::is_rust_runtime(library), "{library}");
    }
}
