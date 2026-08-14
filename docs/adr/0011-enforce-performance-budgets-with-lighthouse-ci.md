# ADR-0011: Enforce performance budgets with Lighthouse CI

- Status: Accepted
- Date: 2026-08-14

In the context of guarding the static Astro site's performance as published pages increase,
facing the need for repeatable pre-deployment measurements without depending on production
availability or publishing reports externally, we decided for Lighthouse CI against PageSpeed
Insights and bundle-size-only checks, to discover built pages automatically and gate changes on
page-type-specific lab metrics and resource budgets, accepting runner variability, three audits
per page, longer CI runs, and the need to ratchet thresholds as performance improves.
