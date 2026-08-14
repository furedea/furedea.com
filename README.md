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

## Article authoring

Create a Japanese article with a permanent Zenn slug and preview it in a browser:

```sh
pnpm article:new -- example-article-slug
pnpm article:preview
```

Run `pnpm dev` in another terminal to preview the same Markdown on the website. Drafts with
`published: false` appear only in the local website preview. Store article images under
`images/<slug>/` and reference them as `/images/<slug>/<file>`.

Inspect the esa API payload without publishing it:

```sh
pnpm article:export:esa -- example-article-slug
```

Merge the article into `main` to publish it. Zenn and Cloudflare consume the repository source,
while GitHub Actions reconciles every article with esa after all quality gates pass. An article
with `published: false` remains a Zenn and website draft and is synchronized to esa as WIP;
changing it to `true` publishes the website and Zenn copies and ships the esa copy.

The esa reconciler searches by the canonical furedea.com URL embedded in each esa copy. It
creates a missing post, updates a different post, and leaves an identical post unchanged.

## Content

- `articles/`: Zenn-compatible Japanese articles
- `article_config.json`: non-secret publishing destination settings
- `images/`: images shared by Zenn, esa exports, and the website
- `content/news/`: standalone bilingual news records
- `content/publications/`: bilingual publication records and their optional News announcements
- `src/data/`: typed profile, research, education, and content transformation code
- `public/`: files copied directly into the production build

## Deployment

Cloudflare Pages builds the `main` branch with `pnpm build` and serves `dist/` at `furedea.com`.
Pull requests are validated by GitHub Actions before merging.

Automatic esa publishing requires a GitHub environment named `production`, restricted to the
`main` branch, with an environment secret named `ESA_ACCESS_TOKEN`. Use a dedicated esa PAT v2
with only `read:post` and `write:post`; the team and category are committed in
`article_config.json`. The secret is exposed only to the esa publishing step after CI succeeds.

Zenn publishing requires this repository to be connected through Zenn's GitHub integration.

## License

Source code is licensed under the [MIT License](LICENSE). Original written content and media are excluded from the MIT License; see [CONTENT_LICENSE.md](CONTENT_LICENSE.md).
