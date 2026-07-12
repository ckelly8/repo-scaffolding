---
name: provider-portability
description: Use when hardening an app-with-infrastructure so any external host is swappable behind an owned interface — every provider SDK (Postgres host, object storage, auth, realtime, queue, HTTP runtime) lives behind a single composition root, enforced by a provider-SDK-containment rule. Discipline-first, TypeScript-first. Not for libraries/CLIs with no external infrastructure. Composes with repo-scaffolding.
---

# Provider Portability

This skill hardens a deployable app so that **swapping any external infrastructure host is a new
adapter, not a user-data migration**. It is discipline-first: it teaches one doctrine (see
[references/doctrine.md](references/doctrine.md)) and enforces the single mechanically-checkable part
of it — provider-SDK containment. Interface design and refactors are guided worklists, not
auto-applied.

It composes with `repo-scaffolding` and **reuses that skill's boundaries machinery**
(`dependency-cruiser` / `ast-grep`). If the target has no `.dependency-cruiser.cjs`, run
`repo-scaffolding`'s package-boundaries concern first, then return here.

## When this does NOT apply

If the target has no external infrastructure dependencies — a library, a CLI, a pure-logic package —
there is nothing to make portable. Detect will report **not applicable** and stop. Portability is
never a gap for a repo with nothing to swap.

## The loop

Run these five phases in order.

1. **Detect** — identify the external infra dependencies the target ACTUALLY has. Match its
   `package.json` dependencies and import specifiers against the known SDK families in
   [languages/typescript/provider-sdk-families.json](languages/typescript/provider-sdk-families.json).
   If none match, report **not applicable** and stop.

2. **Assess** — for each detected dependency, classify containment and emit a gap-report table (one
   row per dependency, plus a `doctrine` row and an `enforcement` row):
   - `contained` — the SDK is imported only inside a designated `adapter-*` / ports package.
   - `leaking` — the SDK is imported in business logic, in multiple places, or in a client bundle.
   - `no-seam` — the dependency is present but no interface owns it.
   Also record: is an `Infrastructure portability` section present in `CLAUDE.md`? Is a
   `provider-sdk-containment` rule present in the boundaries config? See
   [references/enforcement.md](references/enforcement.md) for how to decide each.

3. **Propose** — present the gap report plus an ordered plan: (a) author the doctrine section in
   `CLAUDE.md`; (b) for each `leaking` / `no-seam` dependency, name the interface (interface-first);
   (c) install the containment rule. Per-item approval. Skip items already present.

4. **Apply**
   - **Doctrine:** insert the `Infrastructure portability` section into `CLAUDE.md` from
     [languages/typescript/CLAUDE.md](languages/typescript/CLAUDE.md). Pre-fill the seam list from
     what Detect found; leave the "what we do NOT abstract" list as a prompt for the user.
   - **Enforcement:** add the `provider-sdk-containment` rule to the existing `.dependency-cruiser.cjs`
     (fragment: [languages/typescript/dependency-cruiser.rule.cjs](languages/typescript/dependency-cruiser.rule.cjs))
     and, optionally, the ast-grep rule
     ([languages/typescript/rules/provider-sdk-containment.yml](languages/typescript/rules/provider-sdk-containment.yml)).
     Fill the adapter path and SDK list from Detect. Never overwrite an existing config without
     showing a diff first.
   - **Refactor guidance (not auto-fix):** for each `leaking` / `no-seam` dependency, emit a
     worklist — name the interface → create the `adapter-*` package → move the SDK import behind it →
     wire it in the composition root. Do not auto-refactor; that is judgment work.

5. **Verify** — run the target's verify gate. The containment rule passes, or it lists the exact
   leaking import sites to fix.

## Idempotency

Re-running on a repo that already contains every seam behind an adapter, the doctrine section, and
the containment rule is a no-op: the gap report is all-`contained`/`present` and the apply plan is
empty. Safe to re-run as the app grows.
