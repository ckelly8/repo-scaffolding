<!-- Agent-primary — Claude is a primary reader of this file. Keep it load-bearing, not decorative. -->

# <project>

<One-line description of what this project is.>

## Architecture

<1–3 bullets describing the top-level shape of the system — the main pieces and how they relate.>

- <piece A — what it is>
- <piece B — what it is>

## Project structure & package dependency chain

This table is the boundary contract. Each row is a package; the import columns are what the
dependency-graph tool (`.dependency-cruiser.cjs`) enforces. Apps are leaves — no package may import
an app.

| Package        | May import        | Must NOT import     |
| -------------- | ----------------- | ------------------- |
| `@scope/core`  | (none — foundation) | everything else (it is the deepest layer) |
| `@scope/app`   | `@scope/core`     | —                   |

## Rules

**Do:** <the short list of what to do in this repo — e.g. import types from the core package; run the
verify gate before pushing; put shared logic in the explicit backend packages.>

**Do NOT:** <the short list of what never to do — e.g. duplicate types across apps; import an app
from a package; bypass the typed client with raw fetch.>

## Development

- `pnpm verify` — the full gate: lint + typecheck + ast-grep + dep:check + check:refs + knip + test.
  This is the sole source of truth for "is the tree green."

## Key entry points

| Concern              | File                          |
| -------------------- | ----------------------------- |
| <wire contracts/SSOT>| <path>                        |
| <app entry>          | <path>                        |
