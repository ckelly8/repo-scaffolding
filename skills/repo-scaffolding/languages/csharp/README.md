# C# language layer — reserved slot

This is an **honest reserved slot**, not a finished layer. The portable concern modules in
`../../references/` apply to a C# repo **unchanged** — the principles (load-bearing CLAUDE.md,
enforced boundaries, one build graph behind a single verify gate, code intelligence + structural
rules, supply-chain hygiene, mutation testing) are language-agnostic. What is missing is the
per-language *instantiation*: the concrete templates and tool wiring that the TypeScript layer
already provides. Until those are filled in, a C# target gets **principles-only** treatment — assess
and advise from each module's `## Principle`, but apply no templates, because there are none yet.

## What needs a C# answer

Each item below is the C# analogue of something the TypeScript layer already ships:

- **Solution / project structure convention** — the C# equivalent of the pnpm workspace +
  `packages/*` / `apps/*` layout: a `.sln` and per-project `.csproj` arrangement, and the convention
  for which projects are leaves (apps) vs. foundation libraries.
- **Boundary-enforcement tool** — the dependency-cruiser analogue. Candidates: `.editorconfig`
  analyzers, or **NetArchTest** / a Roslyn analyzer that fails the build on a disallowed
  project-to-project reference (the `no-app-imports` rule, expressed for C#).
- **The verify-gate command set** — the C# composition of `dotnet build` / `dotnet test` / analyzers
  / format check into one `verify` equivalent that is the sole source of truth for "is the tree
  green."
- **C# LSP wiring** — the C# language server (the `LSP`-tool analogue), plus a C# version of
  `lsp-tools.md` documenting its preferred operations and any loaded-projects / warm-before-query
  caveats. This is the primary deferred piece behind the slot.

## Fill-in checklist

When you next scaffold a C# repo, mirror the TypeScript layer's file set:

- [ ] `templates/` — create it (the TS layer has ten template files; C# has none yet).
- [ ] `templates/CLAUDE.md` — C# CLAUDE.md skeleton (architecture, project-dependency table, Do/Do-NOT, entry points).
- [ ] Boundary-enforcement config (NetArchTest test project or analyzer ruleset) + its `verify` wiring.
- [ ] The `verify`-gate command set (`dotnet build` / `dotnet test` / format / analyzers).
- [ ] Supply-chain hardening — the NuGet analogue of pin-exact + lockfile + `--locked-mode`.
- [ ] `lsp-tools.md` — write the C# language-server reference.
- [ ] A worked `README.md` tying the C# templates together (like the TS layer's).

**No templates yet** — this slot is deliberately empty rather than a misleading stub.
