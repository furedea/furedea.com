{
  description = "Development environment for furedea.com";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-25.11-darwin";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { nixpkgs, nixpkgs-unstable, ... }:
    let
      system = "aarch64-darwin";
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          commitlint
          deadnix
          # lefthook before 2.1.6 runs hooks under a pty, which agent sandboxes deny.
          nixpkgs-unstable.legacyPackages.${system}.lefthook
          ls-lint
          nixfmt-rfc-style
          nodejs_22
          pnpm
          statix
        ];
      };
    };
}
