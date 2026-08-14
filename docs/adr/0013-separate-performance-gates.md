# ADR-0013: Separate performance gates

- Status: Accepted
- Date: 2026-08-15
- Supersedes: ADR-0012

In the context of protecting site performance without delaying every merge, facing deterministic
resource limits and variable rendering timings combined in one long required check, we decided to
make a single-pass asset budget required and run sampled lab measurements in a separate
non-blocking workflow, against keeping one sampled workflow required or removing automated
performance checks, to preserve fast regression protection and rendering visibility, accepting that
a lab timing regression can be merged while its independent check is investigated.
