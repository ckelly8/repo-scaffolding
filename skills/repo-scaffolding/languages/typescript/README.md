# TypeScript language layer

This layer is the fully built, ready-to-apply instantiation of the agent-primary standard for a
TypeScript monorepo. The concern modules in `../../references/` carry the portable *why*; the files in
`templates/` are the concrete *what*. This README is the worked example that ties them together.

## How the templates compose

A coherent TS monorepo falls out of the templates in a single dependency chain — each layer rests on
the one before it:

1. **pnpm workspace** (`pnpm-workspace.yaml`) defines where packages and apps live
   (`packages/*`, `apps/*`) and turns on supply-chain hardening (`minimumReleaseAge`). `.npmrc` adds
   `save-exact=true`. Now every install is pinned and quarantined.
2. **Composite tsconfigs** (`tsconfig.base.json` root solution + `tsconfig.package.json` per package)
   make the whole repo one `tsc -b` build graph. Each package emits declaration-only output; the root
   solution references every package. This one graph is also what makes cross-package LSP
   `findReferences` resolve.
3. **`check-refs.mjs`** keeps each package's `references[]` in sync with its workspace dependencies,
   so the build graph never silently drifts from the real import edges.
4. **dependency-cruiser boundaries** (`.dependency-cruiser.cjs`) encode the dependency-chain table
   from `CLAUDE.md` as enforced rules — `no-app-imports`, `no-circular`, and one rule per disallowed
   edge — failing the build on an illegal import.
5. **The verify gate** (`package.verify-scripts.json`) chains everything into one command:
   `lint → typecheck (tsc -b) → ast-grep → dep:check → check:refs → knip → test`. This is the sole
   source of truth for "is the tree green." A committed **`.githooks/pre-push`** (enabled by a
   `prepare` script that sets `core.hooksPath`) runs that gate on every push, so it is enforced by
   the repo rather than by anyone remembering — husky or CI are interchangeable alternatives (see
   `project-refs-verify.md`).
6. **LSP + ast-grep** add code intelligence on top: the `typescript-lsp` plugin (driven via the `LSP`
   tool, see `lsp-tools.md`) for symbol-level reasoning, and `rules/no-floating-promise.yml` as the
   seed of a growing structural-rule set.

## Putting it together — which module applies each file

| Template file                  | Applied by concern module                |
| ------------------------------ | ---------------------------------------- |
| `CLAUDE.md`                    | `claude-md.md`                           |
| `.dependency-cruiser.cjs`      | `package-boundaries.md`                  |
| `tsconfig.base.json`           | `project-refs-verify.md`                 |
| `tsconfig.package.json`        | `project-refs-verify.md`                 |
| `check-refs.mjs`               | `project-refs-verify.md`                 |
| `package.verify-scripts.json`  | `project-refs-verify.md`                 |
| `.githooks/pre-push`           | `project-refs-verify.md`                 |
| `.npmrc`                       | `supply-chain.md`                        |
| `pnpm-workspace.yaml`          | `supply-chain.md`                        |
| `rules/no-floating-promise.yml`| `lsp-and-astgrep.md`                     |
| `stryker.config.mjs`           | `mutation-testing.md` (opt-in)           |

All templates use the placeholder packages `@scope/core` (foundation) and `@scope/app` (leaf app).
The apply recipes replace these with the target's real packages.

For the LSP-tool reference an agent uses while working in a scaffolded repo, see
[`lsp-tools.md`](lsp-tools.md).
