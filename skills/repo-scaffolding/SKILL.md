---
name: repo-scaffolding
description: Use when setting up a new repository or retrofitting an existing one to an agent-primary engineering standard. Runs an assess -> propose -> apply loop over six concerns (load-bearing CLAUDE.md, enforced package boundaries, project-references + a single verify gate, LSP + ast-grep code intelligence, pnpm supply-chain hardening, optional mutation testing). TypeScript and C# are fully built; other languages degrade to principles-only.
---

# Repo Scaffolding

This skill bootstraps a repository to an **agent-primary** engineering standard — a codebase shaped
so that an LLM agent and a human reach correct behavior through the same enforced structure, not
through tribal knowledge. The standard is six concerns: a load-bearing CLAUDE.md, enforced package
boundaries, one build graph behind a single verify gate, LSP + ast-grep code intelligence, pnpm
supply-chain hardening, and (opt-in) mutation testing. It works **greenfield** (a new, empty repo)
or **brownfield** (retrofitting an existing one), and it is **idempotent**: re-running on an
already-standard repo yields an all-`present` gap report and a no-op plan, so it is safe to run
repeatedly as a repo evolves.

## The loop

Run these five phases in order. Stay language-agnostic at the top; delegate per-concern detail to the
reference modules in `references/` and per-language concrete files to `languages/<lang>/`.

1. **Detect** — identify the target's language/stack and package manager.
   - `package.json` present → **TypeScript** (fully built). Detect: `ls package.json` and
     read its `packageManager` field; `Glob` `pnpm-workspace.yaml` / `pnpm-lock.yaml` to confirm pnpm.
   - `*.sln` or `*.csproj` present → **C#** (fully built). Detect: `Glob` `**/*.sln` and `**/*.csproj`.
     Apply from `languages/csharp/templates/` exactly as the TypeScript layer does — each concern
     module's `## Apply` has a C# recipe.
   - If neither matches, report what was found and stop — there is no language layer to apply.

2. **Assess** — run each concern module's `## Assess` predicate against the target and emit a **gap
   report table**: one row per concern, `Status` ∈ `present | partial | absent`, plus the
   **evidence** (the file or command that decided it). Do not propose anything yet — assess first.

3. **Propose** — present the gap report plus an **ordered apply plan**. Concerns have a natural
   dependency order (CLAUDE.md and boundaries are authored before the verify gate that enforces
   them). Use this fixed order:
   `claude-md → package-boundaries → project-refs-verify → supply-chain → lsp-and-astgrep → (mutation-testing if opted in)`.
   The user approves **per-concern or all-at-once**. Skip concerns already `present` unless the user
   asks to re-apply.

4. **Apply** — for each approved concern, follow its `## Apply` recipe, copying concrete files from
   `languages/<lang>/templates/`. **Brownfield rule:** never overwrite an existing config without
   showing a diff first and getting confirmation. Fill template placeholders (`@scope/core`,
   `@scope/app`) from what Detect/Assess learned about the target's real packages.

5. **Verify** — run the target's gate: `pnpm verify` if a `verify` script now exists, otherwise the
   assembled command set (lint + typecheck + ast-grep + dep:check + check:refs + knip + test).
   Report green/red. Stryker (mutation testing) runs only if the user opted into that concern — it is
   never part of the default gate.

## Routing table

| Concern                       | Module                                          | Core? | Default-applied? |
| ----------------------------- | ----------------------------------------------- | ----- | ---------------- |
| Load-bearing CLAUDE.md        | [references/claude-md.md](references/claude-md.md)                       | core   | yes |
| Enforced package boundaries   | [references/package-boundaries.md](references/package-boundaries.md)     | core   | yes |
| Project-refs + verify gate    | [references/project-refs-verify.md](references/project-refs-verify.md)   | core   | yes |
| Supply-chain hardening        | [references/supply-chain.md](references/supply-chain.md)                 | core   | yes |
| LSP + ast-grep intelligence   | [references/lsp-and-astgrep.md](references/lsp-and-astgrep.md)           | core   | yes |
| Mutation testing              | [references/mutation-testing.md](references/mutation-testing.md)         | opt-in | no  |

The five core concerns are applied by default (subject to per-concern approval in Propose).
Mutation-testing is opt-in because it is slow (tens of minutes) and is gated to an explicit heavy run.

## Idempotency

Re-running the loop on a repo that already meets the standard is a no-op: every core concern's
`## Assess` predicate returns `present`, the gap report is all-green, and Propose offers an empty
apply plan. Nothing is overwritten. This is what makes the skill safe to re-run as a repo grows —
each run only fills the gaps that have opened since the last one.

## Language layers

- **TypeScript** — `languages/typescript/` is the fully built layer: copyable templates
  (`templates/`), the genericized LSP-tool reference (`lsp-tools.md`), and a worked README tying them
  together. The `## Apply` recipes copy from here.
- **C#** — `languages/csharp/` is the second fully built layer: copyable templates (`templates/`), a
  C# LSP reference (`lsp-tools.md`), and a worked README. The verify gate is a native
  `.githooks/pre-push` hook (no hosted CI). Two deliberate non-ports vs. TypeScript: no `check-refs`
  guard (the `.sln`/`ProjectReference` graph is compiler-enforced) and no shipped `.runsettings` (test
  parallelism is per-repo advice). See `languages/csharp/README.md`.
