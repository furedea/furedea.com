# ADR-0005: Author articles as Zenn-compatible Markdown

- Status: Accepted
- Date: 2026-08-04

In the context of publishing the same Japanese article on furedea.com, Zenn, and esa,
facing incompatible previews, metadata, and image locations across those platforms, we
decided for Zenn-compatible Markdown under `articles/` and repository-owned media under
`images/` as the canonical sources and against esa-first authoring or duplicated per-platform
documents, to achieve local preview, portable images, and one reviewable history, accepting
small deterministic adapters for website rendering and esa publishing.
