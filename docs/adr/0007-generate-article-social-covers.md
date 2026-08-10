# ADR-0007: Generate article social covers

- Status: Accepted
- Date: 2026-08-10

In the context of presenting repository-authored articles consistently on the website and in
social previews, facing the maintenance cost and visual drift of manually authored cover images,
we decided for a shared metadata-derived cover model rendered as CSS in article cards and as
build-time PNGs with Sharp and against per-article uploads, AI-generated assets, or a runtime image
service, to achieve deterministic covers from the existing Zenn frontmatter without another
authoring step, accepting a curated palette and illustration system plus build-time rendering code.
