{
  description = "Native development environment for Noxcturnal";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
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
          platformPackages =
            pkgs.lib.optionals pkgs.stdenv.isDarwin [ pkgs.libiconv ]
            ++ pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.stdenv.cc.cc.lib ];
        in
        {
          default = pkgs.mkShell {
            packages =
              with pkgs;
              [
                cargo
                rustc
                rustfmt
                clippy
                pkg-config
                nodejs_22
                pnpm
              ]
              # Only `--features flow_parser` needs these: that feature builds
              # Hermes through its own CMake, and Hermes' generator scripts are
              # Python. The default build stays Rust and Node, so a shell
              # without a C++ toolchain still builds, tests, and releases the
              # package unchanged.
              ++ [
                cmake
                ninja
                python3
                stdenv.cc
              ]
              ++ platformPackages;

            RUST_BACKTRACE = "1";
          };
        }
      );

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt);
    };
}
