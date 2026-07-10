# Concern: project references + a single verify gate

## Principle

**One build graph.** A solution-style root `tsconfig.json` that references every package as a
`composite` project gives the whole repo a single `tsc -b` build: cross-package type-checking in
dependency order, with each package emitting declaration-only output. This one graph is also what
makes cross-package LSP `findReferences` work — the language server resolves symbol identity across
packages because the project graph tells it how they connect (see
[lsp-and-astgrep.md](lsp-and-astgrep.md)). The package `references[]` arrays must mirror each
package's workspace dependencies; a `check:refs`-style script keeps them in sync so the graph never
silently drifts from the real dependency edges.

**One verify gate.** A single `verify` script is the **sole source of truth** for "is the tree
green." It composes the full set — lint, typecheck (`tsc -b`), structural rules (ast-grep), boundary
check (dep:check), project-ref sync (check:refs), dead-code (knip), and tests — into one command an
agent or a pre-push hook runs. No partial "I ran the tests" green: if `verify` passes, the tree is
good; if any composing tool fails, `verify` fails. This is what lets every other concern hang its
enforcement off one gate.

**An enforced gate.** A gate that only runs when someone *remembers* to run it is not a gate — it is
a suggestion with extra steps. Entrusting "run `verify` before you push" to an agent or a human is
precisely the failure mode this concern exists to remove: the enforcement must be **mechanical and
committed to the repo**, so it installs itself on clone and blocks a red push without anyone opting
in. Three mechanisms qualify — the choice is the team's, but *that one exists* is not optional:

- **native git hook** — a committed `.githooks/pre-push` that runs `verify`, with `core.hooksPath`
  pointed at it (self-installed via a `prepare` script). Zero dependencies; git's own feature. This
  is the default, and the mechanism the C# layer already ships.
- **husky** — an npm dev-dependency that manages the same `core.hooksPath` machinery under a
  conventional `.husky/` layout. Choose it if the team already runs husky or wants lint-staged.
- **CI** — a hosted workflow (e.g. GitHub Actions) that runs `verify` on every push/PR. Server-side
  rather than local; pairs with either hook or stands alone.

At least one must be present and committed. Which one is taste; leaving the gate un-enforced is not.

## Assess

- `present` — a `verify` script exists **and** a root `tsconfig.json` with a `references[]` array
  exists **and** a `check:refs`-style sync check is part of `verify` **and** a committed enforcement
  mechanism runs `verify` (a `.githooks/pre-push` with `core.hooksPath` set, a `.husky/` hook, or a
  CI workflow).
- `partial` — a `verify` script exists but is missing one of the composing tools (no typecheck, no
  dep:check, no check:refs, etc.), **or** the gate is complete but nothing enforces it — it runs only
  when invoked by hand (no hook, no CI). An un-enforced gate is a `partial`, not a `present`.
- `absent` — no `verify` script.

Literal checks:

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('package.json','utf8')).scripts?.verify ?? 'NO verify SCRIPT')"
grep -E '"references"' tsconfig.json          # solution-style root references[] present?
git config --get core.hooksPath               # native hook or husky wired?
ls .husky/pre-push .githooks/pre-push 2>/dev/null   # a committed local hook?
ls .github/workflows/*.y*ml 2>/dev/null       # …or a CI workflow that runs verify?
```

**C#:**

- `present` — `Directory.Build.props` + `global.json` exist **and** a `.githooks/pre-push` gate exists
  (and `core.hooksPath` points at it) chaining format + build + test.
- `partial` — the props/`global.json` exist but there is no committed gate (or vice-versa).
- `absent` — none of the substrate is present.

```bash
ls global.json Directory.Build.props .githooks/pre-push 2>/dev/null
git config --get core.hooksPath   # expect: .githooks
```

## Apply

1. Copy `languages/typescript/templates/tsconfig.base.json` (the root solution) and
   `languages/typescript/templates/tsconfig.package.json` (the per-package composite template), and
   point the root `references[]` at the target's real packages.
2. Copy `languages/typescript/templates/check-refs.mjs` to the target root.
3. Merge the script block from `languages/typescript/templates/package.verify-scripts.json` into the
   target `package.json`. The `verify` script chains:
   `lint → typecheck (tsc -b) → ast-grep → dep:check → check:refs → knip → test`.
4. **Wire enforcement** so the gate runs without anyone remembering to. Offer the user the choice
   (default to the native hook — it adds nothing to the dependency tree):
   - **native hook (default, zero-dep):** copy `languages/typescript/templates/.githooks/pre-push`
     to the target's `.githooks/`, and add a `prepare` script —
     `"prepare": "git config core.hooksPath .githooks"` — so the hook self-installs on the next
     `pnpm install`. Run it once now to enable it in the current clone.
   - **husky:** `pnpm add -D husky`, add `"prepare": "husky"`, run it once, then write `pnpm verify`
     into `.husky/pre-push`. Husky manages `core.hooksPath` itself. (One dev-dependency; it sits in
     the `minimumReleaseAge` quarantine on first install.)
   - **CI:** add a workflow that runs `pnpm install --frozen-lockfile && pnpm verify` on push/PR.
   Whichever they pick, the gate is enforced by the repo, not by discipline. This is what makes the
   verify concern `present` rather than `partial`.

**Brownfield:** show a diff before editing `package.json` or `tsconfig.json` — never clobber an
existing `verify` script or `tsconfig` silently. Merge the missing composing steps into whatever gate
already exists. If a `prepare` script already exists, extend it rather than replacing it.

**C# Apply:** copy `languages/csharp/templates/global.json`, `Directory.Build.props`, and
`.editorconfig` to the repo root, and `languages/csharp/templates/.githooks/pre-push` to `.githooks/`.
Enable the gate once per clone: `git config core.hooksPath .githooks`. The gate
(`dotnet format --verify-no-changes` → `dotnet restore --locked-mode` → `dotnet build` →
`dotnet test` → `ast-grep scan`) is the C# `verify` equivalent — the sole source of truth for "is the
tree green." There is **no `check-refs` analogue**: C#'s `.sln` + `ProjectReference` graph is
compiler-enforced, so tsconfig-style reference drift cannot occur.
