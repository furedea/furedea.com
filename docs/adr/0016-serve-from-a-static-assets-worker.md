# ADR-0016: Serve from a static-assets Worker

- Status: Accepted
- Date: 2026-11-04
- Supersedes: [ADR-0002](0002-deploy-with-cloudflare-pages.md)

In the context of hosting `furedea.com` next to `furedea.com/effort-or-luck/`, which is already a
Worker of static assets, facing a Pages project whose settings live only in the dashboard and a
test server (`astro preview`) that ignores `_headers`, `html_handling`, and the 404 rules, we
decided for a Worker of static assets configured by `wrangler.jsonc`, built and deployed by
Workers Builds, routed with the route `furedea.com/*`, tested against `wrangler dev`, and with the
Web Analytics beacon written explicitly in the shared layout, and against staying on Pages, against
a custom domain, and against the `cf` CLI, to keep both sites on one hosting model with their
configuration in the repository and the CSP verified by tests, accepting a dashboard cut-over and
dependence on `wrangler`.

- The route is not a custom domain: a custom domain takes precedence over the more specific
  `furedea.com/effort-or-luck*` route and would shadow that Worker.
- Branch previews are served from workers.dev (`preview_urls`), so `public/_headers` sends
  `X-Robots-Tag: noindex` for `*.workers.dev` and never for `furedea.com`.
- Pages injected the beacon automatically, outside the source. It is now in the layout, so the e2e
  suite checks it together with the CSP, and the automatic injection is disabled in the dashboard
  to avoid double counting.
- The `cf` CLI is out of scope while it is beta.
