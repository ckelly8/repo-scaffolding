# Concern: LSP + ast-grep code intelligence

## Principle

**A language-server bridge is the capability that lifts agentic work above grep/glob.** Where pattern
matching sees text, a language server sees *symbols*: definitions, references, type signatures, and
call hierarchy. For an agent, this is the difference between "the string `foo` appears in these
files" and "this exact symbol is defined here, referenced by these callers, and has this type." Any
finding whose plausibility depends on cross-file behavior — caller count, "this is dead", "this is
the only place that does X", a boundary leak — should cite the specific language-server queries that
established it, not a guess from a grep.

**Push every structurally-catchable pattern down into an ast-grep rule.** The dividing line is:
deterministic where possible, semantic where necessary. If a bad pattern can be caught by structure
alone, it belongs in a `rules/` ast-grep rule that fails at commit-time — reserve scarce LLM review
passes for judgment that genuinely needs semantics. Every rule that graduates from "the reviewer
keeps flagging this" to a structural rule moves the catch earlier and cuts future review noise.

## Assess

Two sub-checks.

**LSP:**

- `present` — the official `typescript-lsp` Claude Code plugin is installed/available **and** a
  genericized `lsp-tools.md` (or equivalent) is referenced in the repo's docs so agents know to use
  the `LSP` tool and the warm-before-`findReferences` discipline.
- `absent` — otherwise.

**ast-grep:**

- `present` — a `rules/` directory with `.yml` rules exists **and** an `ast-grep` / `sg scan` script
  is part of `verify`.
- `partial` — rules exist but nothing in the gate runs them, or a script exists with no rules.
- `absent` — neither.

Literal checks:

```bash
ls rules/*.yml 2>/dev/null && echo "rules present" || echo "no rules"
grep -E "ast-grep|sg scan" package.json   # wired into the gate?
```

## Apply

1. **LSP:** instruct installing the `typescript-lsp` Claude Code plugin, and copy
   `languages/typescript/lsp-tools.md` into the target's docs. Note the two load-bearing caveats it
   documents: the **`LSP` tool is deferred** (load it with `ToolSearch` query `select:LSP` before the
   first call), and **warm the consuming projects before any cross-package `findReferences`** (a cold
   query under-reports). This module does **not** restate `lsp-tools.md` — it points to it.
2. **ast-grep:** copy `languages/typescript/templates/rules/no-floating-promise.yml` as a starter
   rule into the target's `rules/`, add an `ast-grep` script (`ast-grep scan -c sgconfig.yml`, or
   `sg scan`), and wire it into `verify`. The starter is deliberately minimal — grow `rules/` over
   time as the reviewer surfaces recurring structurally-catchable patterns.

**Brownfield:** merge into an existing `rules/` and gate; do not clobber rules the maintainer wrote.

**C# Apply:** for LSP, instruct using the Roslyn-based C# language server via the `LSP` tool and copy
`languages/csharp/lsp-tools.md` into the target's docs (same two caveats: the `LSP` tool is **deferred**
— load it with `ToolSearch` `select:LSP`; and **warm the consuming projects before any cross-project
`findReferences`**). For ast-grep, copy `languages/csharp/templates/sgconfig.yml` and
`languages/csharp/templates/rules/no-empty-catch.yml` (with its `__fixtures__/`), and wire
`ast-grep scan` into the pre-push gate (already present in the shipped hook). Grow `rules/` over time.
