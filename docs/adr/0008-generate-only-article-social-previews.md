# ADR-0008: Generate only article social previews

- Status: Accepted
- Date: 2026-08-10
- Supersedes: ADR-0007

In the context of adding distinctive article previews without changing the visible website,
facing the need to preserve the established profile and blog card presentation, we decided for
metadata-derived build-time PNGs used only by Open Graph and Twitter metadata and against rendering
the generated covers inside website cards, to achieve automatic social previews without UI drift,
accepting a separate Sharp renderer that is not reused by visible page components.
