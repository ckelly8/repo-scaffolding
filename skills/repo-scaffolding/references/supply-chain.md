# Concern: dependency supply-chain hardening

## Principle

Two near-zero-cost, strictly-protective defaults that together close the most common dependency
supply-chain attack window:

- **Pin exact versions.** Write `1.2.3`, not `^1.2.3`, with a committed lockfile and
  `--frozen-lockfile` in CI. A range lets a compromised patch slip in on the next install without any
  change to your repo; an exact pin plus a frozen lockfile means the bytes you reviewed are the bytes
  you install.
- **Quarantine freshly-published versions.** Never install a package version younger than 48 hours.
  The typical npm-compromise pattern is: an attacker publishes a malicious version, it is detected and
  yanked within hours to a couple of days, and only installs during that window are poisoned. A
  cooldown of 48h (`minimumReleaseAge: 2880` minutes in pnpm) makes your installs step over that
  window entirely, at the cost of not getting brand-new releases for two days — almost never a real
  cost.

Both are core because they are cheap, always-on, and purely protective: no workflow change, no
per-package decision, just safer defaults.

> **Footnote (carried forward from the ledger):** this hardens the dependency supply chain at
> *install* time. It is distinct from a **deps recency-audit** — auditing your runtime dependency
> *choices* against the current ecosystem state (are these the right packages, are they maintained,
> are they majors behind). That choice-auditing phase is heavier and deferred; the quarantine here
> does not replace it.

## Assess

- `present` — `pnpm-workspace.yaml` sets `minimumReleaseAge` (≥ 2880) **and** `.npmrc` sets
  `save-exact=true`.
- `partial` — exactly one of the two is present.
- `absent` — neither.

Literal checks:

```bash
grep -E "minimumReleaseAge" pnpm-workspace.yaml
grep -E "save-exact" .npmrc
```

## Apply

1. Copy `languages/typescript/templates/.npmrc` and
   `languages/typescript/templates/pnpm-workspace.yaml` to the target root.
2. If those files already exist, **merge the two keys in** (show a diff first) rather than
   overwriting — preserve the maintainer's existing workspace globs and npmrc settings.
3. Note the pnpm version requirement: `minimumReleaseAge` needs **pnpm v10+**. If the target is on an
   older pnpm, flag it — the key is inert below v10.
4. Mention the `minimumReleaseAgeExclude` escape hatch: list internal/first-party package names there
   to bypass the cooldown for the repo's *own* publishes (you don't want to wait 48h to consume a
   package you just published in the same workspace).
