# Concern: enforced package boundaries

## Principle

Prefer **many small, single-purpose packages** over a few that accrete responsibilities. When new
code only "kind of fits" an existing package, that awkward fit is the signal to **split**, not to
extend — that is how layers blur and the boundary graph erodes. Granular packages with honest names
also serve agents directly: a subagent deciding where new code goes reads the package layout and gets
an unambiguous answer, instead of navigating internal structure that isn't in its context. Package
granularity and agent granularity mirror each other.

Boundaries must be **enforced, not conventional**. A convention in a doc is a suggestion; a
dependency-graph tool (e.g. dependency-cruiser) that **fails the build** on an illegal import is a
contract. The rules encode the dependency-chain table from `CLAUDE.md`: each package's allowed
"May import" edges and forbidden "Must NOT import" edges become `forbidden` rules. Two rules are
near-universal:

- **`no-app-imports`** — apps are leaves; a package must never import an app. Apps are composition
  roots that wire packages together, so an inward edge from a package to an app is always a layering
  violation.
- **`no-circular`** — no cycles between packages.

## Assess

- `present` — a dependency-cruiser config exists (`.dependency-cruiser.cjs` / `.js` / `.json`)
  **and** a `dep:check`-style script runs it as part of the gate.
- `partial` — the config exists but nothing in the scripts runs it (a rule file no build consults).
- `absent` — no dependency-cruiser config.

Literal checks:

```bash
ls .dependency-cruiser.* 2>/dev/null && echo "config present" || echo "no config"
grep -E "depcruise|dependency-cruiser|dep:check" package.json   # is it wired into a script?
```

## Apply

1. Copy `languages/typescript/templates/.dependency-cruiser.cjs` to the target root.
2. Replace the placeholder package rows with the target's **real** packages and the allowed-import
   edges derived from the `CLAUDE.md` dependency-chain table — add one `forbidden` rule per
   disallowed edge in that table. Keep the `no-app-imports` and `no-circular` rules.
3. Add a `dep:check` script — `depcruise --config .dependency-cruiser.cjs apps packages` — and wire
   it into the `verify` gate. (The `verify` script itself is owned by
   [project-refs-verify.md](project-refs-verify.md); this concern just contributes the `dep:check`
   step.)

**Brownfield:** if a config already exists, show a diff of the added/changed rules before writing,
and keep any project-specific rules the maintainer wrote.
