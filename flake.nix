{
  description = "Native development environment for Noxcturnal";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    { fenix, nixpkgs, ... }:
    let
      supportedSystems = [
        "aarch64-darwin"
        "x86_64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          rustToolchain = fenix.packages.${system}.combine (
            with fenix.packages.${system};
            [
              stable.cargo
              stable.clippy
              stable.rustc
              stable.rustfmt
              targets.aarch64-apple-darwin.stable.rust-std
              targets.x86_64-apple-darwin.stable.rust-std
              targets.aarch64-unknown-linux-gnu.stable.rust-std
              targets.x86_64-unknown-linux-gnu.stable.rust-std
              targets.aarch64-unknown-linux-musl.stable.rust-std
              targets.x86_64-unknown-linux-musl.stable.rust-std
              targets.aarch64-pc-windows-msvc.stable.rust-std
              targets.x86_64-pc-windows-msvc.stable.rust-std
            ]
          );
          platformPackages =
            pkgs.lib.optionals pkgs.stdenv.isDarwin [ pkgs.libiconv ]
            ++ pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.stdenv.cc.cc.lib ];
        in
        {
          default = pkgs.mkShell {
            packages =
              with pkgs;
              [
                rustToolchain
                pkg-config
                nodejs_22
                pnpm
              ]
              # The default `flow_parser` feature builds Hermes through its own
              # CMake, and Hermes' generator scripts are Python.
              ++ [
                cmake
                llvmPackages.clang
                llvmPackages.lld
                llvmPackages.llvm
                ninja
                python3
                stdenv.cc
                zig
              ]
              ++ platformPackages;

            RUST_BACKTRACE = "1";
          };
        }
      );

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt);
    };
}
