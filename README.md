# furedea.com

Source for [furedea.com](https://furedea.com), Kaito Shigyo's personal website and blog. The static bilingual site is built with Astro and deployed through Cloudflare Pages.

## Development

The project uses Node.js 22 and pnpm. A Nix development shell is also available.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Run the complete local quality gate with:

```sh
pnpm check
pnpm exec playwright install chromium
pnpm check:e2e
```

The production build is written to `dist/`.

## Content

- `src/content/blog/ja/`: Japanese blog posts
- `src/content/blog/en/`: English blog posts
- `src/data/`: profile, research, publication, and site data
- `public/`: files copied directly into the production build

## Deployment

Cloudflare Pages builds the `main` branch with `pnpm build` and serves `dist/` at `furedea.com`. Pull requests are validated by GitHub Actions before merging.

## License

Source code is licensed under the [MIT License](LICENSE). Original written content and media are excluded from the MIT License; see [CONTENT_LICENSE.md](CONTENT_LICENSE.md).
