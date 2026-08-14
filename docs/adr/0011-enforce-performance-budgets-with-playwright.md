# ADR-0011: Enforce performance budgets with Playwright

- Status: Accepted
- Date: 2026-08-14

In the context of guarding the static Astro site's performance as published pages increase,
facing the need for repeatable pre-deployment measurements without adding a dependency affected
by an unpatched high-severity vulnerability, we decided for Playwright and browser Performance
APIs against Lighthouse CI, PageSpeed Insights, and bundle-size-only checks, to discover built
pages automatically and gate changes on page-type-specific paint, layout stability, main-thread,
and resource budgets, accepting synthetic measurements, three throttled audits per page, longer
CI runs, and the need to ratchet thresholds as performance improves.
