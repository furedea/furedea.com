# ADR-0015: List separately deployed works under furedea.com paths

- Status: Accepted
- Date: 2026-10-19

In the context of a works section that links to projects served under this domain, such as
`/effort-or-luck/`, by their own deployments rather than by this site's build, facing an
internal-link check that resolves every same-origin link against the local preview, we decided
for listing works in `src/data/works.ts` and skipping the paths of same-origin works in that
check, and against copying their builds into this site or serving them from subdomains, to keep
each project deploying from its own repository while linking from the home page, accepting that
those links are checked only after the projects deploy.
