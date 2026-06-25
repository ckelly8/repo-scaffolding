# C# language layer

This layer is the fully built, ready-to-apply instantiation of the agent-primary standard for a C#
solution. The concern modules in `../../references/` carry the portable *why*; the files in
`templates/` are the concrete *what*. This README is the worked example that ties them together.

All templates use the placeholder projects `Scope.Core` (foundation library) and `Scope.App` (leaf
app) — the C# analogue of the TypeScript layer's `@scope/core` / `@scope/app`. The apply recipes
replace these with the target's real projects.

## How the templates compose

A coherent C# repo falls out of the templates in one dependency chain — each layer rests on the prior:

1. **Reproducible build substrate** — `global.json` pins the SDK; `Directory.Build.props` turns on
   nullable, analyzers, code-style-in-build, and warnings-as-errors across every project at once.
   `.editorconfig` tunes individual rule severities (baseline-and-ratchet) so a brownfield build stays
   green today while new code meets the full bar.
2. **Pinned, locked dependencies** — `Directory.Packages.props` centralizes and pins exact NuGet
   versions; `nuget.config` clears inherited sources down to one locked feed. With
   `RestorePackagesWithLockFile` (set in the props), every restore writes/honors a committed
   `packages.lock.json`, and the gate restores with `--locked-mode`. The bytes you reviewed are the
   bytes you install.
3. **One build graph** — the `.sln` plus `ProjectReference` edges form a single `dotnet build` graph,
   compiler-enforced.
4. **Enforced boundaries** — `ArchitectureTests` (NetArchTest, in `BoundaryTests.cs`) encodes the
   CLAUDE.md dependency table as assertions that fail `dotnet test` on an illegal project reference.
5. **The verify gate** — `.githooks/pre-push` chains `dotnet format --verify-no-changes` →
   `dotnet restore --locked-mode` → `dotnet build` → `dotnet test` → `ast-grep scan` into one
   authoritative local gate. No hosted CI: it runs on the developer's machine and blocks the push on
   failure. Enable once per clone: `git config core.hooksPath .githooks`.
6. **Code intelligence** — the C# LSP (via the `LSP` tool, see [`lsp-tools.md`](lsp-tools.md)) for
   symbol-level reasoning, and `rules/no-empty-catch.yml` as the seed of a growing ast-grep
   structural-rule set (`sgconfig.yml` points `ast-grep scan` at `rules/`).

## Putting it together — which module applies each file

| Template file                       | Applied by concern module                |
| ----------------------------------- | ---------------------------------------- |
| `CLAUDE.md`                         | `claude-md.md`                           |
| `Directory.Build.props`             | `project-refs-verify.md`                 |
| `.editorconfig`                     | `project-refs-verify.md`                 |
| `global.json`                       | `project-refs-verify.md`                 |
| `.githooks/pre-push`                | `project-refs-verify.md`                 |
| `ArchitectureTests.csproj`          | `package-boundaries.md`                  |
| `BoundaryTests.cs`                  | `package-boundaries.md`                  |
| `Directory.Packages.props`          | `supply-chain.md`                        |
| `nuget.config`                      | `supply-chain.md`                        |
| `rules/no-empty-catch.yml`          | `lsp-and-astgrep.md`                     |
| `sgconfig.yml`                      | `lsp-and-astgrep.md`                     |
| `stryker-config.json`               | `mutation-testing.md` (opt-in)           |

For the LSP-tool reference an agent uses while working in a scaffolded C# repo, see
[`lsp-tools.md`](lsp-tools.md).

## Two deliberate non-ports

1. **No `check-refs` analogue.** The TypeScript layer's `check-refs.mjs` keeps each package's tsconfig
   `references[]` in sync with its real imports because tsconfig references can silently drift. C#'s
   build graph is the `.sln` + `ProjectReference`s, compiler-enforced: a missing reference is a
   compile error, an extra one is dead but harmless. There is no silent-drift failure mode to guard,
   so no guard is shipped.
2. **Test-parallelism mitigation is advice, not a shipped `.runsettings`.** If timing-sensitive tests
   flake under parallel load, constrain `dotnet test` parallelism (add
   `-- RunConfiguration.MaxCpuCount=1` to the gate's test line). This is a per-repo fix, not a generic
   default, so the layer documents it (here and in the hook comment) but ships no `.runsettings`.
