# Concern: mutation testing (opt-in)

## Principle

**Mutation score is the strongest available signal of real test quality.** Line coverage tells you a
line ran during a test; it says nothing about whether any assertion would notice if that line were
wrong. A mutation testing tool (Stryker) injects deliberate defects — flips a `<` to `<=`, deletes a
statement, negates a condition — and reruns the suite. A mutant that survives is a real defect your
tests would not catch. The surviving-mutant report is therefore a concrete, prioritized list of where
the suite is blind, far more actionable than a coverage percentage.

It belongs in the kit, but it is **opt-in** because it is slow — tens of minutes on a non-trivial
repo, since the suite reruns once per mutant. Gate it to an explicit "heavy" run; it must **never** be
part of the default `verify` loop, which has to stay fast enough to run on every change.

> **Footnote (carried forward from the ledger):** this is the install-time mutation signal. A broader
> **deps recency-audit** (auditing dependency *choices* against the ecosystem) is a separate, heavier
> opt-in phase that also belongs in the "full"/heavy tier — see the footnote in
> [supply-chain.md](supply-chain.md). Both are deliberately kept out of the fast gate.

## Assess

This concern is **only assessed or applied when the user opts in** — the orchestrator skips it in the
default loop.

- `present` — a Stryker config (`stryker.config.*`) exists **and** a `test:mutate` script is wired.
- `absent` — otherwise.

Literal checks:

```bash
ls stryker.config.* 2>/dev/null && echo "stryker config present" || echo "absent"
grep -E "test:mutate|stryker" package.json
```

## Apply

1. Copy `languages/typescript/templates/stryker.config.mjs` to the target root.
2. Add a `test:mutate` script (`stryker run`). Optionally add a `test:mutate:evidence` aggregator
   script that post-processes the Stryker JSON report into a structured survivor block a
   test-quality review pass can interpret.
3. Do **not** add `test:mutate` to `verify` — it is a separate command, run on demand. State the
   runtime expectation up front: **tens of minutes**, so it is a set-and-forget run, not part of the
   inner loop.
