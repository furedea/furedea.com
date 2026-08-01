{
  description = "";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-25.11-darwin";
  };

  outputs =
    { nixpkgs, ... }:
    let
      system = "aarch64-darwin";
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          commitlint
          deadnix
          lefthook
          ls-lint
          nixfmt-rfc-style
          nodejs_22
          pnpm
          statix
        ];
      };
    };
}
