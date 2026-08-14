# ADR-0010: Publish identity and article structured data

- Status: Accepted
- Date: 2026-08-14

In the context of a personal academic website with articles and publicly displayed social links,
facing the need for search engines to associate the author, affiliation, articles, and external
profiles reliably, we decided for schema.org `ProfilePage`, `Person`, and `BlogPosting` JSON-LD
derived from existing site metadata with every displayed social profile included as `sameAs` and
against omitting structured data or maintaining a separate metadata source, to achieve one
machine-readable identity and authorship graph without duplicating facts, accepting that the
relationship between the real identity and pseudonymous social accounts becomes explicit to
automated consumers.
