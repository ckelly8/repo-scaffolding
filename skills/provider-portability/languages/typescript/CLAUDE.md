<!-- Insert this section into the target repo's root CLAUDE.md. Fill every <...> placeholder from the
     app. The seam bullets are pre-filled by Apply from what Detect found; the "do NOT abstract" list
     is authored by the maintainer. -->

## Infrastructure portability

Every external infrastructure dependency lives behind an interface this codebase owns, implemented in
a single composition root per deployment. Swapping a host means writing a new adapter, not migrating
user data — and user-data migration is the only failure mode that gets more expensive with every user,
so it is the one we keep off the post-launch path.

**Rule:** a provider SDK is imported only from its `adapter-*` package. Everything else depends on the
interface. This is enforced by the `provider-sdk-containment` rule in the verify gate.

**Seams in this app:**

- **<seam — e.g. Data store>** — `<Interface>` in `<package>`; `<adapter package>` implements it.
  Swappable to <interchangeable hosts>.
- **<seam>** — `<Interface>`; `<adapter>`. Swappable to <...>.

**What we deliberately do NOT abstract** (load-bearing, intentional):

- **<e.g. the database engine>** — <why it is load-bearing; what is an explicit non-goal>.
- **<e.g. the wire contract in `<package>`>** — stable on purpose so internal shapes change freely
  behind it.

**Adding a new infrastructure dependency:** propose the interface first. If you cannot name the
interface, the dependency does not belong yet. If the interface name is awkward, it crosses a layer
boundary to respect instead.
