# Concern: load-bearing CLAUDE.md

## Principle

A load-bearing, agent-primary `CLAUDE.md` is the highest-leverage artifact in the repo. It is the
first thing an agent reads and the thing that lets it reach correct behavior without spelunking the
source. To carry that weight it must state, concretely:

- the **architecture** — the shape of the system in a few bullets (what the top-level pieces are and
  how they relate), not a marketing paragraph;
- the **dependency-chain table** — who-may-import-whom, one row per package, with an explicit
  "May import" and "Must NOT import" column. This is the boundary contract the agent navigates by,
  and the same table the boundary-enforcement tool encodes (see
  [package-boundaries.md](package-boundaries.md));
- the **Do / Do-NOT rules** — the short, sharp list of what to do and what never to do in this repo
  (e.g. "import types from the contract package"; "never start dev servers on the user's behalf").
  Rules state *what*, not *how*;
- the **key entry points** — a table mapping each concern to the file that owns it, so an agent
  starting cold knows where to land.

Keep it portable in spirit: it describes *this* repo's structure, but the discipline — architecture +
boundary table + Do/Do-NOT + entry points — applies to any stack. A CLAUDE.md that is merely a
friendly description, with none of these four load-bearing sections, is decorative, not load-bearing.

## Assess

Predicate over the target repo root:

- `present` — a root `CLAUDE.md` exists **and** contains an architecture summary, a
  dependency/boundary section, and a Do/Do-NOT section.
- `partial` — `CLAUDE.md` exists but is missing one of those three.
- `absent` — no root `CLAUDE.md`.

Literal checks:

```bash
test -f CLAUDE.md && echo "exists" || echo "absent"
grep -iE "architecture" CLAUDE.md      # architecture summary present?
grep -iE "import|boundary|depend"  CLAUDE.md   # dependency/boundary section present?
grep -iE "do not|don't|must not"  CLAUDE.md    # Do/Do-NOT section present?
```

Cite the file and which checks passed/failed as the evidence in the gap report.

## Apply

1. Copy `languages/typescript/templates/CLAUDE.md` to the target root.
2. Fill the three placeholder regions from what Detect/Assess learned about the target:
   - the **architecture summary** (the real top-level pieces);
   - the **dependency-chain table** (the real packages and their allowed/forbidden import edges —
     this table is the source of truth that [package-boundaries.md](package-boundaries.md) then
     encodes into the dependency-cruiser config);
   - the **key entry points** table (the real owning files).
3. Write the **Do / Do-NOT** rules from the conventions the repo already follows.

**Brownfield:** if a `CLAUDE.md` already exists, do **not** overwrite it. Merge — show a diff of the
sections you would add (e.g. a missing dependency-chain table), and only apply with confirmation.
Preserve any existing rules the maintainer wrote.

**C# Apply:** copy `languages/csharp/templates/CLAUDE.md` and fill the dependency-chain table with the
target's real projects (`.sln`/`.csproj` vocabulary). The table is the boundary contract the
`ArchitectureTests` guard (see `package-boundaries.md`) enforces.
