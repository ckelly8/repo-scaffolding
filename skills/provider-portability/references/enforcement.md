# Enforcement — detection & the containment rule

## Detecting infra dependencies

Detect answers one question: *does this app have external infrastructure to make portable?*

1. Read the target's `package.json` dependencies + `devDependencies`.
2. Match them against the SDK families in
   [../languages/typescript/provider-sdk-families.json](../languages/typescript/provider-sdk-families.json).
   A match on any `packages` prefix means that seam is present.
3. Cross-check import specifiers in source (a dependency can be declared but unused, or used via a
   re-export). `grep` for the matched package names across `src` / `packages` / `apps`.

If **nothing** matches, the target is a library / CLI / pure-logic repo. Report **not applicable** and
stop — do not author doctrine or rules for infra that does not exist.

## Classifying containment

For each detected SDK, find where it is imported:

- `contained` — every import sits inside a single `adapter-*` / ports path. Good; no action.
- `leaking` — it is imported from business logic, from more than one package, or from a
  client/browser bundle. Needs a worklist entry.
- `no-seam` — it is imported but there is no adapter package at all; the dependency is loose. Needs a
  worklist entry (name the interface first).

The worklist for a `leaking` / `no-seam` dependency is always the same four moves: name the interface
→ create the `adapter-*` package → move the SDK import behind it → wire it in the composition root.
The skill does not perform these automatically — interface design is judgment, and mechanical
refactors across call sites are dangerous.

## The containment rule

The one mechanical check. Install whichever your target already gates with; both encode the same
invariant: *a provider SDK may be imported only from the adapter package.*

- **dependency-cruiser** — merge
  [../languages/typescript/dependency-cruiser.rule.cjs](../languages/typescript/dependency-cruiser.rule.cjs)
  into the `forbidden` array of the target's `.dependency-cruiser.cjs`. This reuses the boundaries
  machinery `repo-scaffolding` installs — if there is no `.dependency-cruiser.cjs`, run that skill's
  package-boundaries concern first.
- **ast-grep** — add
  [../languages/typescript/rules/provider-sdk-containment.yml](../languages/typescript/rules/provider-sdk-containment.yml)
  to the target's rules directory.

For either, fill two things from Detect: the **adapter path** (the one allowed location) and the
**SDK alternation** (only the families actually present). Never overwrite an existing config without
showing a diff first.

Once installed, the rule fails the verify gate on any new leak — the seam cannot silently rot as the
app grows.
