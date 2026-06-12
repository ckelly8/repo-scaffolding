# Codebase Intelligence (typescript-lsp plugin) — Reference

This file says which structural-analysis operations to prefer over Glob/Grep/Read, and the
cross-package technique you must use because of how a project-references monorepo resolves types.
Copy it into a target repo's docs as the agent-facing LSP reference.

> **The tool.** Code intelligence comes from the official `typescript-lsp` Claude Code plugin, which
> drives `typescript-language-server` through Claude Code's built-in **`LSP`** tool. `LSP` is a
> **deferred** tool — before your first call, load its schema with **`ToolSearch` query
> `select:LSP`**. One persistent server is shared across the whole session (and across subagents), so
> it warms once, not per-agent.

## The LSP tool — operations

`LSP` takes `{ operation, filePath, line, character }` (line/character are **1-based**, as shown in
the editor gutter). `workspaceSymbol` also takes `query`.

| Question | Operation |
| --- | --- |
| "What symbols / shape does this file have?" | `documentSymbol` |
| "Where is symbol `X` defined?" | `goToDefinition` |
| "What's the type / JSDoc of the symbol here?" | `hover` |
| "Who references `X`?" (see the limitation below) | `findReferences` |
| "Find a symbol by name across loaded projects" | `workspaceSymbol` (pass `query`) |
| "What implements this interface?" | `goToImplementation` |
| "Who calls / is called by this function?" | `prepareCallHierarchy` → `incomingCalls` / `outgoingCalls` |
| "Where does this string/identifier appear **across the whole repo**?" | **Grep** (then confirm with `LSP`) |
| List files by glob; read a non-code file or known span | Glob / Read |

**Rule of thumb:** `LSP` answers "what does the type system say about this symbol *in the projects
tsserver has loaded*". Grep answers "where does this text appear *across all files on disk*". You need
**both** — see the cross-package pattern below.

## Warm before cross-package findReferences (load-bearing)

With a solution-style root `tsconfig.json` + a TS project-references graph (every `packages/*` is a
`composite` project referenced by the root solution), `findReferences` **does** traverse package
boundaries — but tsserver only searches the projects it has **already loaded this session**. A *cold*
query under-reports:

- `findReferences` on the `MyType` *definition* in `packages/core` returns only `core`'s own usages
  until `packages/app`'s project is loaded; once loaded, the same query returns the cross-package
  consumers too.
- `goToDefinition` / `hover` resolve a single definition across packages fine, cold — it is
  *references* that are load-scoped.
- **Apps are leaves — NOT in the solution.** Their usages appear only after that app's project is
  explicitly loaded (open / `documentSymbol` a file in it).

So before any cross-package / whole-repo `findReferences` claim, **warm** the relevant projects first:

1. **Warm** — issue one `documentSymbol` (or any `LSP` call) against a file in each package/app that
   might consume the symbol. This force-loads those projects into tsserver.
2. **Query** — now `findReferences` on the definition returns cross-package consumers reliably.
3. **Cross-check with grep** — e.g. `grep -rn "MyType" apps packages --include='*.ts*'`. Grep sees
   every file on disk regardless of what is loaded; if grep finds a consumer that `findReferences`
   missed, you did not warm that project (or it is a non-TS / dynamic reference). Reconcile the two.
4. Cite both — the warmed `findReferences` result AND the grep cross-check.

`findReferences` without warming is reliable only for "usages **within** an already-loaded project."
Do not claim a monorepo-wide caller count from a cold query. Grep+confirm remains the robust fallback
and needs no warm-up — but with the project graph, warmed `findReferences` is the precise primary tool
(it resolves symbol identity, where grep matches text).

## structural_evidence discipline

When a finding's plausibility depends on cross-file behavior — caller count, "this is dead", "this is
the only place that does X", a boundary leak, type propagation across packages — the finding **must**
cite the specific `LSP` / grep calls and what they returned. Example:

```
structural_evidence: grep found `MyType` in apps/app/src/handler.ts and packages/app/src/index.ts;
goToDefinition on each resolves to packages/core/src/types.ts:14 (same export), so the type is
reached from both consumers — boundary-relevant.
```

A finding that makes a cross-cutting claim **without** `structural_evidence:` should be treated as
low-confidence. A purely-local finding (one file, no cross-file reasoning) does not need it.

## Cost model

The first `LSP` call that touches a given project warms `typescript-language-server` for that project
(a few seconds); subsequent calls in the same project are fast, and the server persists across the
session and subagents. A `findReferences` issued before the relevant project is loaded
**under-reports** — which is exactly why you warm the consuming projects first and cross-check with
grep. Prefer **serial** use of the one shared server over hammering it from parallel agents.
