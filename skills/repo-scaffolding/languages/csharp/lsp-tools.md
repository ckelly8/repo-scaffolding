# Codebase Intelligence (C# LSP) — Reference

This file says which structural-analysis operations to prefer over Glob/Grep/Read in a C# solution,
and the cross-project technique you must use because of how a Roslyn-backed language server loads
projects. Copy it into a target repo's docs as the agent-facing LSP reference.

> **The tool.** Code intelligence comes from a Roslyn-based C# language server driven through Claude
> Code's built-in **`LSP`** tool. `LSP` is a **deferred** tool — before your first call, load its
> schema with **`ToolSearch` query `select:LSP`**. One persistent server is shared across the whole
> session (and across subagents), so it warms once, not per-agent.

## The LSP tool — operations

`LSP` takes `{ operation, filePath, line, character }` (line/character are **1-based**, as shown in
the editor gutter). `workspaceSymbol` also takes `query`.

| Question | Operation |
| --- | --- |
| "What symbols / shape does this file have?" | `documentSymbol` |
| "Where is symbol `X` defined?" | `goToDefinition` |
| "What's the type / XML-doc of the symbol here?" | `hover` |
| "Who references `X`?" (see the limitation below) | `findReferences` |
| "Find a symbol by name across loaded projects" | `workspaceSymbol` (pass `query`) |
| "What implements this interface / overrides this member?" | `goToImplementation` |
| "Who calls / is called by this method?" | `prepareCallHierarchy` → `incomingCalls` / `outgoingCalls` |
| "Where does this string/identifier appear **across the whole repo**?" | **Grep** (then confirm with `LSP`) |
| List files by glob; read a non-code file or known span | Glob / Read |

**Rule of thumb:** `LSP` answers "what does the compiler say about this symbol *in the projects the
server has loaded*". Grep answers "where does this text appear *across all files on disk*". You need
**both** — see the cross-project pattern below.

## Warm before cross-project findReferences (load-bearing)

A Roslyn-backed server resolves symbols across `ProjectReference` edges in the solution — but it only
searches the projects it has **already loaded this session**. A *cold* `findReferences` under-reports:
it returns only the defining project's own usages until the consuming projects are loaded.

- `findReferences` on a `Scope.Core` type returns only `Scope.Core`'s usages until `Scope.App`'s
  project is loaded; once loaded, the same query returns the cross-project consumers too.
- `goToDefinition` / `hover` resolve a single definition across projects fine, cold — it is
  *references* that are load-scoped.
- **Leaf apps load last.** Their usages appear only after that app's project is opened (issue one
  `documentSymbol` against a file in it).

So before any cross-project / whole-repo `findReferences` claim, **warm** the relevant projects first:

1. **Warm** — issue one `documentSymbol` (or any `LSP` call) against a file in each project that might
   consume the symbol. This force-loads those projects into the server.
2. **Query** — now `findReferences` on the definition returns cross-project consumers reliably.
3. **Cross-check with grep** — e.g. `grep -rn "MyType" src --include='*.cs'`. Grep sees every file on
   disk regardless of what is loaded; if grep finds a consumer `findReferences` missed, you did not
   warm that project (or it is a dynamic/reflection reference). Reconcile the two.
4. Cite both — the warmed `findReferences` result AND the grep cross-check.

`findReferences` without warming is reliable only for "usages **within** an already-loaded project."
Do not claim a solution-wide caller count from a cold query.

## structural_evidence discipline

When a finding's plausibility depends on cross-file behavior — caller count, "this is dead", "this is
the only place that does X", a boundary leak — the finding **must** cite the specific `LSP` / grep
calls and what they returned. A cross-cutting claim without `structural_evidence:` is low-confidence;
a purely-local finding (one file, no cross-file reasoning) does not need it.

## Cost model

The first `LSP` call that touches a project warms the server for it (a few seconds); subsequent calls
in that project are fast, and the server persists across the session and subagents. Prefer **serial**
use of the one shared server over hammering it from parallel agents.
