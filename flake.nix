{
  description = "Reproducible development, verification, and native releases for Noxcturnal";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    hermes = {
      url = "github:facebook/hermes/73855a1475e016cec814d67578f860112ef711e1";
      flake = false;
    };
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      fenix,
      hermes,
      nixpkgs,
      self,
      ...
    }:
    let
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
      targetManifest = builtins.fromJSON (builtins.readFile ./scripts/native-targets.json);
      rustToolchainConfig = (builtins.fromTOML (builtins.readFile ./rust-toolchain.toml)).toolchain;
      rustManifestHash = "sha256-A1abGIbOtcBSdrUMhDGrER3pRM1hQP4fp9gh3Y4PKc8=";
      cleanSource = builtins.path {
        name = "noxcturnal-source";
        path = ./.;
        filter =
          path: type:
          let
            base = builtins.baseNameOf path;
          in
          !(
            builtins.elem base [
              ".git"
              "node_modules"
              "target"
              "dist"
              "coverage"
            ]
            || nixpkgs.lib.hasSuffix ".node" base
          );
      };
      nativeSource = nixpkgs.lib.fileset.toSource {
        root = ./.;
        fileset = nixpkgs.lib.fileset.unions [
          ./vendor
          ./Cargo.lock
          ./Cargo.toml
          ./build.rs
          ./crates
          ./flake.lock
          ./flake.nix
          ./src
          ./package.json
          ./pnpm-lock.yaml
          ./pnpm-workspace.yaml
          ./npm/darwin-arm64/package.json
          ./npm/darwin-x64/package.json
          ./npm/linux-arm64-gnu/package.json
          ./npm/linux-arm64-musl/package.json
          ./npm/linux-x64-gnu/package.json
          ./npm/linux-x64-musl/package.json
          ./npm/win32-arm64-msvc/package.json
          ./npm/win32-x64-msvc/package.json
          ./scripts/native-lib.mjs
          ./scripts/native.mjs
          ./scripts/native-targets.json
        ];
      };
      sourceHash = builtins.hashString "sha256" (toString nativeSource);
      mkSystem =
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            config = {
              microsoftVisualStudioLicenseAccepted = true;
              allowUnfreePredicate =
                package:
                builtins.elem (nixpkgs.lib.getName package) [
                  "win-sdk"
                  "xwin-fetch-msvc"
                ];
            };
          };
          fenixPkgs = fenix.packages.${system};
          hostRustToolchain = fenixPkgs.fromToolchainFile {
            file = ./rust-toolchain.toml;
            sha256 = rustManifestHash;
          };
          releaseRustToolchain = fenixPkgs.combine (
            [ hostRustToolchain ]
            ++ map (
              target:
              (fenixPkgs.targets.${target.rustTarget}.toolchainOf {
                channel = rustToolchainConfig.channel;
                sha256 = rustManifestHash;
              }).rust-std
            ) targetManifest
          );
          pnpm = pkgs.pnpm_10.override { nodejs-slim = pkgs.nodejs_22; };
          baseTools =
            with pkgs;
            [
              nodejs_22
              pnpm
              pkg-config
              cmake
              ninja
              python3
            ]
            ++ pkgs.lib.optionals pkgs.stdenv.isDarwin [ pkgs.libiconv ]
            ++ pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.stdenv.cc.cc.lib ];
          commonTools = [ hostRustToolchain ] ++ baseTools;
          releaseTools = [ releaseRustToolchain ] ++ baseTools;
          linuxLibraryPath = pkgs.lib.optionalString pkgs.stdenv.isLinux (
            pkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc.lib ]
          );
          crossTools = with pkgs; [
            patchelf
            cargo-zigbuild
            cargo-xwin
            llvmPackages.clang
            llvmPackages.lld
            llvmPackages.llvm
            zig
          ];
          pnpmDeps = pkgs.fetchPnpmDeps {
            pname = "noxcturnal-pnpm-deps";
            version = "0.1.0";
            src = nativeSource;
            inherit pnpm;
            fetcherVersion = 3;
            hash = "sha256-mdQ0bnjrNLeyRZLqsfGMu4bWaMwmHa89WipUXDjOkZQ=";
          };
          cargoDeps = pkgs.rustPlatform.fetchCargoVendor {
            name = "noxcturnal-cargo-deps";
            src = nativeSource;
            hash = "sha256-rs/r43HWNLRP41oZ4aePvEKiclHosZQsDTJ3wdpXmkk=";
          };
          pnpmStoreKey = builtins.hashString "sha256" (toString pnpmDeps);
          pnpmStoreShellHook = ''
            export npm_config_store_dir="$PWD/target/nix-pnpm-store"
            marker="$npm_config_store_dir/.noxcturnal-ready-${pnpmStoreKey}"
            if [ ! -e "$marker" ]; then
              if [ -e "$npm_config_store_dir" ]; then
                chmod -R u+w "$npm_config_store_dir"
                rm -rf "$npm_config_store_dir"
              fi
              mkdir -p "$npm_config_store_dir"
              tar --zstd -xf ${pnpmDeps}/pnpm-store.tar.zst -C "$npm_config_store_dir"
              chmod -R u+w "$npm_config_store_dir"
              touch "$marker"
            fi
          '';
          verify = pkgs.stdenv.mkDerivation {
            pname = "noxcturnal-check";
            version = "0.1.0";
            src = cleanSource;
            inherit cargoDeps pnpmDeps;
            nativeBuildInputs = commonTools ++ [
              pkgs.pnpmConfigHook
              pkgs.rustPlatform.cargoSetupHook
            ];
            dontUseCmakeConfigure = true;
            HERMES_SOURCE_DIR = hermes;
            LD_LIBRARY_PATH = linuxLibraryPath;
            pnpmInstallFlags = [
              "--child-concurrency=1"
              "--network-concurrency=1"
            ];
            buildPhase = ''
              runHook preBuild
              node scripts/check.mjs
              runHook postBuild
            '';
            installPhase = ''
              mkdir -p "$out"
              echo verified > "$out/result"
            '';
          };
        in
        {
          inherit
            pkgs
            hostRustToolchain
            releaseRustToolchain
            pnpm
            commonTools
            releaseTools
            crossTools
            pnpmDeps
            cargoDeps
            verify
            ;
          shells = {
            default = pkgs.mkShell {
              packages = commonTools ++ [ pkgs.zstd ];
              CI = "true";
              LD_LIBRARY_PATH = linuxLibraryPath;
              RUST_BACKTRACE = "1";
              shellHook = pnpmStoreShellHook;
            };
            ci = pkgs.mkShell {
              packages = commonTools ++ [ pkgs.zstd ];
              CI = "true";
              LD_LIBRARY_PATH = linuxLibraryPath;
              shellHook = pnpmStoreShellHook;
            };
            release = pkgs.mkShell {
              packages =
                releaseTools
                ++ [ pkgs.zstd ]
                ++ pkgs.lib.optionals (builtins.elem system [
                  "aarch64-darwin"
                  "x86_64-linux"
                ]) crossTools;
              CI = "true";
              LD_LIBRARY_PATH = linuxLibraryPath;
              shellHook = pnpmStoreShellHook;
            };
          };
        };
      perSystem = forAllSystems mkSystem;
      mkRelease =
        releaseHost:
        let
          releaseSystem = perSystem.${releaseHost};
          # The processed nixpkgs SDK is a Darwin stdenv input. Its fixed-output
          # source is the extracted SDK itself, which cargo-zigbuild accepts as
          # SDKROOT on Linux without globally enabling unsupported packages.
          linuxAppleSdk = if releaseHost == "x86_64-linux" then releaseSystem.pkgs.apple-sdk_15.src else null;
          nativeInputFingerprint =
            releaseSystem.pkgs.runCommand "noxcturnal-native-input-fingerprint"
              {
                nativeBuildInputs = [ releaseSystem.pkgs.nodejs_22 ];
              }
              ''
                cd ${nativeSource}
                node -e "import('./scripts/native-lib.mjs').then(module => process.stdout.write(module.nativeInputHash()))" > "$out"
              '';
          mkNative =
            target:
            let
              windowsSdk =
                if target.rustTarget == "aarch64-pc-windows-msvc" then
                  releaseSystem.pkgs.pkgsCross.aarch64-multiplatform.windows.sdk
                else
                  releaseSystem.pkgs.pkgsCross.mingwW64.windows.sdk;
              windowsRustArch = if target.rustTarget == "aarch64-pc-windows-msvc" then "aarch64" else "x86_64";
              windowsSdkArch = if target.rustTarget == "aarch64-pc-windows-msvc" then "arm64" else "x64";
              cargoXwinSdk = releaseSystem.pkgs.runCommand "noxcturnal-cargo-xwin-sdk-${windowsRustArch}" { } ''
                mkdir -p "$out/xwin"
                cp -R ${windowsSdk}/. "$out/xwin"
                chmod -R u+w "$out/xwin"
                test -d "$out/xwin/crt/lib/${windowsSdkArch}"
                test -d "$out/xwin/sdk/lib/um/${windowsSdkArch}"
                test -d "$out/xwin/sdk/lib/ucrt/${windowsSdkArch}"
                ln -s ${windowsSdkArch} "$out/xwin/crt/lib/${windowsRustArch}"
                ln -s ${windowsSdkArch} "$out/xwin/sdk/lib/um/${windowsRustArch}"
                ln -s ${windowsSdkArch} "$out/xwin/sdk/lib/ucrt/${windowsRustArch}"
                printf '%s\n' ${windowsRustArch} > "$out/xwin/DONE"
              '';
              windowsEnvironment = nixpkgs.lib.optionalString (target.os == "win32") ''
                export XWIN_CACHE_DIR="$TMPDIR/xwin-cache"
                mkdir -p "$XWIN_CACHE_DIR"
                cp -R ${cargoXwinSdk}/. "$XWIN_CACHE_DIR"
                chmod -R u+w "$XWIN_CACHE_DIR"
                export XWIN_ARCH=${windowsRustArch}
                export XWIN_VERSION=17
              '';
              darwinEnvironment = nixpkgs.lib.optionalString (target.os == "darwin" && linuxAppleSdk != null) ''
                export SDKROOT=${linuxAppleSdk}
              '';
            in
            releaseSystem.pkgs.stdenv.mkDerivation {
              pname = "noxcturnal-native-${target.rustTarget}";
              version = "0.1.0";
              src = nativeSource;
              inherit (releaseSystem) cargoDeps pnpmDeps;
              nativeBuildInputs =
                releaseSystem.releaseTools
                ++ releaseSystem.crossTools
                ++ [
                  releaseSystem.pkgs.pnpmConfigHook
                  releaseSystem.pkgs.rustPlatform.cargoSetupHook
                ];
              SOURCE_DATE_EPOCH = "1";
              HERMES_SOURCE_DIR = hermes;
              dontUseCmakeConfigure = true;
              pnpmInstallFlags = [
                "--child-concurrency=1"
                "--network-concurrency=1"
              ];
              buildPhase = ''
                runHook preBuild
                export NOXCTURNAL_TARGET=${nixpkgs.lib.escapeShellArg target.rustTarget}
                export NOXCTURNAL_OUTPUT="$out"
                export NOXCTURNAL_TARGET_DIR="$TMPDIR/native-target"
                export NOXCTURNAL_SOURCE_HASH=${nixpkgs.lib.escapeShellArg sourceHash}
                export NOXCTURNAL_NATIVE_INPUT_HASH="$(cat ${nativeInputFingerprint})"
                export NOXCTURNAL_CARGO_VENDOR_HASH=sha256-rs/r43HWNLRP41oZ4aePvEKiclHosZQsDTJ3wdpXmkk=
                export NOXCTURNAL_PNPM_STORE_HASH=sha256-mdQ0bnjrNLeyRZLqsfGMu4bWaMwmHa89WipUXDjOkZQ=
                export RUSTFLAGS="''${RUSTFLAGS:+$RUSTFLAGS }--remap-path-prefix=$NIX_BUILD_TOP=/build"
                export CFLAGS="''${CFLAGS:+$CFLAGS }-ffile-prefix-map=$NIX_BUILD_TOP=/build -fdebug-prefix-map=$NIX_BUILD_TOP=/build"
                export CXXFLAGS="''${CXXFLAGS:+$CXXFLAGS }-ffile-prefix-map=$NIX_BUILD_TOP=/build -fdebug-prefix-map=$NIX_BUILD_TOP=/build"
                ${windowsEnvironment}
                ${darwinEnvironment}
                node scripts/native.mjs build-target
                runHook postBuild
              '';
              dontInstall = true;
            };
          nativePackages = builtins.listToAttrs (
            map (target: {
              name = "native-${target.rustTarget}";
              value = mkNative target;
            }) targetManifest
          );
          mkNativeArtifacts =
            name: targets:
            releaseSystem.pkgs.linkFarm name (
              map (target: {
                name = target.rustTarget;
                path = nativePackages."native-${target.rustTarget}";
              }) targets
            );
          nativeArtifacts = mkNativeArtifacts "noxcturnal-native-artifacts" targetManifest;
          nativeArtifactShards = builtins.listToAttrs (
            map
              (
                architecture:
                let
                  targets = builtins.filter (
                    target: nixpkgs.lib.hasPrefix "${architecture}-" target.rustTarget
                  ) targetManifest;
                in
                {
                  name = "native-artifacts-${architecture}";
                  value = mkNativeArtifacts "noxcturnal-native-artifacts-${architecture}" targets;
                }
              )
              [
                "aarch64"
                "x86_64"
              ]
          );
          outputsFile = releaseSystem.pkgs.writeText "noxcturnal-native-outputs.json" (
            builtins.toJSON (
              builtins.listToAttrs (
                map (target: {
                  name = target.rustTarget;
                  value = toString nativePackages."native-${target.rustTarget}";
                }) targetManifest
              )
            )
          );
          prepareReleaseProgram = releaseSystem.pkgs.writeShellApplication {
            name = "prepare-release-packages";
            runtimeInputs = [ releaseSystem.pkgs.nodejs_22 ];
            text = ''
              node ${cleanSource}/scripts/native.mjs materialize \
                --workspace-root "$PWD" \
                --outputs-file ${outputsFile}
            '';
          };
        in
        {
          inherit
            nativeArtifacts
            nativeArtifactShards
            nativePackages
            prepareReleaseProgram
            ;
        };
      releaseGraphs = nixpkgs.lib.genAttrs [ "aarch64-darwin" "x86_64-linux" ] mkRelease;
    in
    {
      devShells = forAllSystems (system: perSystem.${system}.shells);
      checks = forAllSystems (system: {
        verify = perSystem.${system}.verify;
      });
      packages =
        forAllSystems (system: {
          check = perSystem.${system}.verify;
        })
        // nixpkgs.lib.mapAttrs (
          system: release:
          {
            check = perSystem.${system}.verify;
            native-artifacts = release.nativeArtifacts;
          }
          // release.nativeArtifactShards
          // release.nativePackages
        ) releaseGraphs;
      apps = nixpkgs.lib.mapAttrs (_: release: {
        prepare-release-packages = {
          type = "app";
          program = "${release.prepareReleaseProgram}/bin/prepare-release-packages";
        };
      }) releaseGraphs;
      formatter = forAllSystems (system: perSystem.${system}.pkgs.nixfmt);
    };
}
