//! Builds Hermes' parser and the erasure shim, then tells Cargo how to link
//! them. Only runs when the `noxcturnal/flow_parser` feature is on.

use std::env;
use std::path::{Path, PathBuf};
use std::process::Command;

/// The pinned Hermes submodule, relative to this crate.
const VENDORED: &str = "hermes";

fn main() {
    println!("cargo::rerun-if-env-changed=HERMES_SOURCE_DIR");
    println!("cargo::rerun-if-changed=cpp");

    let source = hermes_source_dir();

    let mut config = cmake::Config::new("cpp");
    config
        .define("HERMES_SOURCE_DIR", &source)
        // Hermes refuses to configure without one, and a debug Hermes is both
        // enormous and slow enough to distort any measurement taken against it.
        .profile("Release");
    // LLVH tests lseek64 with _LARGEFILE64_SOURCE but does not retain that
    // feature macro when compiling. Musl already gives lseek a 64-bit offset,
    // so bypass the false-positive probe and use the portable branch.
    if env::var("TARGET").is_ok_and(|target| target.contains("musl")) {
        config.define("HAVE_LSEEK64", "0");
    }
    if let Some(generator) = preferred_generator() {
        config.generator(generator);
    }
    let install = config.build();

    println!(
        "cargo::rustc-link-search=native={}",
        install.join("lib").display()
    );
    // `hermes_flow_shim` archives the shim together with every Hermes object
    // library it needs, so the only ordering that matters is that it precedes
    // the three leaf archives.
    for library in ["hermes_flow_shim", "LLVHSupport", "LLVHDemangle", "dtoa"] {
        println!("cargo::rustc-link-lib=static={library}");
    }
    link_cxx_runtime(&install);
}

/// Rust links the C runtime but not the C++ one, and the shim is C++.
///
/// The names come from `CMAKE_CXX_IMPLICIT_LINK_LIBRARIES`, which CMake derives
/// by running the C++ driver's own link line. That is worth the indirection: a
/// guess from the target triple picks libstdc++ for every musl target, and a
/// musl target cross-built with a clang-based toolchain wants libc++.
///
/// Libraries rustc already links for the target are dropped, so this contributes
/// the C++ half and nothing else.
fn link_cxx_runtime(install: &Path) {
    const ALREADY_LINKED: [&str; 8] = ["c", "m", "dl", "rt", "util", "pthread", "gcc", "gcc_s"];

    let share = install.join("share");
    for directory in read_list(&share.join("cxx-link-directories.txt")) {
        println!("cargo::rustc-link-search=native={directory}");
    }
    for library in read_list(&share.join("cxx-link-libraries.txt")) {
        if ALREADY_LINKED.contains(&library.as_str()) {
            continue;
        }
        // Some toolchains report a full archive path rather than a `-l` name.
        // `rustc-link-arg` does not propagate out of a dependency's build
        // script, so split the path instead of passing it through.
        let path = Path::new(&library);
        if path.is_absolute() {
            let (Some(parent), Some(stem)) = (path.parent(), path.file_stem()) else {
                continue;
            };
            let stem = stem.to_string_lossy();
            let name = stem.strip_prefix("lib").unwrap_or(&stem);
            println!("cargo::rustc-link-search=native={}", parent.display());
            println!("cargo::rustc-link-lib=static={name}");
        } else {
            println!("cargo::rustc-link-lib={library}");
        }
    }
}

fn read_list(path: &Path) -> Vec<String> {
    std::fs::read_to_string(path)
        .unwrap_or_default()
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .map(str::to_owned)
        .collect()
}

/// Resolves the Hermes checkout: an explicit override first, then the pinned
/// submodule. The override exists so a contributor with a Hermes tree already
/// on disk can build against it without initializing the submodule.
fn hermes_source_dir() -> PathBuf {
    if let Ok(dir) = env::var("HERMES_SOURCE_DIR") {
        let dir = PathBuf::from(dir);
        assert!(
            dir.join("include/hermes/AST/ESTree.def").is_file(),
            "HERMES_SOURCE_DIR={} does not look like a Hermes checkout",
            dir.display()
        );
        return dir;
    }

    let vendored = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join(VENDORED);
    assert!(
        vendored.join("include/hermes/AST/ESTree.def").is_file(),
        "Hermes submodule is not initialized at {}.\n\
         Run `git submodule update --init crates/hermes-parser-sys/hermes`,\n\
         or point HERMES_SOURCE_DIR at a Hermes checkout.",
        vendored.display(),
    );
    vendored
}

/// Ninja when it is available. Hermes' parser half is ~150 compilation units;
/// the difference against Make is minutes across eight release targets.
fn preferred_generator() -> Option<&'static str> {
    let found = Command::new("ninja")
        .arg("--version")
        .output()
        .is_ok_and(|output| output.status.success());
    found.then_some("Ninja")
}
