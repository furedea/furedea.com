# Repository Guide

This repository contains the Astro source for `furedea.com`.

## Navigation

- `src/pages/`: file-based routes for Japanese and English pages
- `src/components/`: reusable Astro components
- `src/content/`: localized blog posts
- `src/data/`: structured website content
- `src/i18n/`: localization helpers and labels
- `tests/e2e/`: browser-level behavior specifications
- `docs/adr/`: durable architecture decisions

## Workflow

Use Test-Spec Driven Development. Add or change an executable specification before the implementation, then run `pnpm check` and `pnpm check:e2e`. Record broad architectural rationale in an ADR instead of duplicating behavior in prose.

Keep public documentation, code comments, and commit messages in English. Use Conventional Commits.
