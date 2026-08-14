# ADR-0012: Stabilize performance measurements

- Status: Accepted
- Date: 2026-08-15
- Supersedes: ADR-0011

In the context of enforcing browser performance budgets on variable GitHub-hosted runners,
facing a paint-time outlier consistent with runtime network variability while resource and
execution metrics remained stable, we decided for self-hosted rendering assets and adaptive
Playwright sampling against fixed three-run sampling, generic test retries, relaxed budgets, and
Lighthouse CI: measure three fresh browser contexts, add two confirmation measurements only when
the initial median exceeds a timing or layout budget, and evaluate the median of all samples. We
retain every sample, mark recovered results as unstable, and report ranges and sample counts,
accepting two additional measurements for suspicious pages and larger report artifacts in exchange
for fewer false positives without hiding the original failure evidence.
