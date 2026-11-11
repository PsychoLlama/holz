{
  description = "Development environment";

  inputs = {
    systems.url = "github:nix-systems/default";
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    {
      self,
      nixpkgs,
      systems,
    }:

    let
      inherit (nixpkgs) lib;

      eachSystem = lib.flip lib.mapAttrs (
        lib.genAttrs (import systems) (system: import nixpkgs { inherit system; })
      );
    in

    {
      devShells = eachSystem (
        system: pkgs: rec {
          default = pkgs.mkShell {
            packages = [
              pkgs.just
              pkgs.nixfmt
              pkgs.nodejs
              pkgs.pnpm
              pkgs.treefmt
            ];
          };

          nixos = pkgs.mkShell {
            inputsFrom = [ default ];

            # Playwright ships its own Chromium, but the prebuilt binary can't
            # run on NixOS. Consumed by Vitest configs using the Playwright
            # browser provider.
            CHROMIUM_PATH = "${pkgs.chromium}/bin/chromium";
          };
        }
      );
    };
}
