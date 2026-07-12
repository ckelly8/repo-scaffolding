# Infrastructure portability — the doctrine

One discipline: **every external infrastructure dependency lives behind an interface the codebase
owns, implemented in a single composition root per deployment.** Swapping a host means writing a new
adapter, not migrating user data.

## The asymmetry

This discipline is justified by one asymmetry, not by "we might switch clouds someday":

**User-data migrations are the only expensive post-launch failure mode.** Internal refactors —
rearranging packages, splitting adapters, moving calls between layers — cost the same with zero users
as with thousands. User-data migrations cost *more with every additional user*: communication,
downtime windows, schema-rewrite scripts, support load. The discipline exists to keep that one
irreversible cost out of the post-launch path. Everything else stays cheap to change, so it does not
need protecting.

This reframes portability from an aesthetic ("no lock-in") into a risk decision: isolate the one
change that gets more expensive over time; leave everything else alone.

## The rule

Every external infrastructure dependency is imported in exactly one place — an `adapter-*` / ports
package that implements an interface the app owns. The rest of the app depends on the interface, never
on the SDK. Each deployment target is a thin composition root that wires the chosen adapter into the
runtime-agnostic app.

The one mechanically-checkable part of this rule is **containment**: no provider SDK is imported
outside the adapter package. That is enforced by the `provider-sdk-containment` rule (see
[enforcement.md](enforcement.md)). The rest of the doctrine — good interface design — is judgment.

## What this does NOT abstract

Portability applied to everything is an anti-pattern. Some choices are load-bearing on purpose, and
naming them as non-goals is part of the discipline:

- **A database whose specific features are baked into the schema.** If JSON columns, triggers, window
  functions, or vector search are load-bearing, then "swap to a different database engine" is an
  explicit non-goal — even though "swap to a different host of the *same* engine" stays cheap. Abstract
  the host, not the engine.
- **The wire-format / contract surface clients depend on.** This is stable *on purpose*, so internal
  shapes can change freely behind it. Do not hide it behind an adapter; it is the thing adapters exist
  to protect.

Every adopting repo fills in its own version of this list. If you cannot name what you are refusing to
abstract, you have not finished the design.

## Adding a new infrastructure dependency

Propose the interface first.

- If you cannot name what the interface would be, the dependency probably does not belong yet.
- If the interface name is awkward, the dependency probably crosses a layer boundary you should
  respect instead of papering over.

Only after the interface has a name do you pick a provider to implement it.
