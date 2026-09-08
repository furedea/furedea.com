# ADR-0014: Complete esa discovery before publishing

- Status: Accepted
- Date: 2026-09-08
- Supersedes: ADR-0006

In the context of repeatable esa publishing, retaining the CI publishing and credential
model from [ADR-0006](0006-publish-articles-from-ci.md), facing canonical-URL search results
that can span multiple pages, we decided for complete paginated discovery before reconciling
an article and against a single-page lookup or committed remote post identifiers, to preserve
idempotent publishing regardless of a matching post's position, accepting one request per
search page and a failed synchronization when discovery cannot complete. This replaces the
previous assumption of one search request per article.
