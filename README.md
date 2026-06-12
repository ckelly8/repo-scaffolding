# repo-scaffolding

## What this is

`repo-scaffolding` is a plugin-style Claude Code skill that bootstraps a repository to an
**agent-primary** engineering standard — a codebase shaped so that an LLM agent and a human reach
correct behavior through the same enforced structure. It runs an **assess → propose → apply** loop:
it detects the target's language and stack, assesses each concern to produce a gap report, proposes
an ordered apply plan, and applies the approved concerns from ready-to-use templates. It works
greenfield (a new, empty repo) or brownfield (retrofitting an existing one) and is idempotent —
re-running on an already-scaffolded repo yields an all-`present` report and a no-op plan. TypeScript
is fully built; other languages degrade gracefully to principles-only advice.

## Install

```
/plugin marketplace add <path-to-this-repo>
/plugin install repo-scaffolding
```

Then start a conversation about setting up or retrofitting a repository and the `repo-scaffolding`
skill will route the work.

## The standard it encodes

Six concerns, each a reference module with a `Principle / Assess / Apply` shape:

- **Load-bearing CLAUDE.md** — architecture summary, dependency-chain table, Do/Do-NOT rules, and
  key entry points, so agents reach correct behavior without spelunking.
- **Enforced package boundaries** — many small single-purpose packages with illegal imports failed
  at build time by a dependency-graph tool (apps are leaves).
- **Project-references + a single verify gate** — one `tsc -b` build graph and one `verify` script
  that is the sole source of truth for "is the tree green."
- **LSP + ast-grep code intelligence** — a language-server bridge for symbol-level reasoning, plus
  pushing every structurally-catchable pattern down into an ast-grep rule.
- **Supply-chain hardening** — pin exact versions and quarantine freshly-published package versions
  (pnpm `minimumReleaseAge`) to defeat the typical npm-compromise window.
- **Mutation testing** (opt-in) — mutation score as the strongest available signal of real test
  quality, gated to an explicit heavy run.

## Validation

See Task 13.
