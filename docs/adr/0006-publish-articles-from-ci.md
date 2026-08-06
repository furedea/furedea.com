# ADR-0006: Publish articles from CI

- Status: Accepted
- Date: 2026-08-06

In the context of publishing repository-authored articles to esa after merging into `main`,
facing the need for unattended, repeatable updates without committing remote post identifiers
or exposing credentials to local processes, we decided for a GitHub Actions reconciliation job
that discovers esa posts by canonical furedea.com URL and reads a dedicated PAT v2 from a
branch-restricted `production` environment secret and against a committed post-number mapping,
macOS Keychain lookup, or a repository-wide secret, to achieve automatic idempotent publishing
and narrow credential exposure, accepting `read:post` in addition to `write:post`, a long-lived
provider token because esa does not support GitHub OIDC, and one search request per article.
