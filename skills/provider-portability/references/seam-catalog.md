# Seam catalog (reference)

Common infrastructure seams and what a good interface over each looks like. These are **reference
examples, not a required set** — a given app has some subset, named for its own domain. Use them to
recognize what a clean seam looks like, then apply the interface-first heuristic from
[doctrine.md](doctrine.md) to whatever infra your app actually has.

Every interface sketch is illustrative pseudocode, not a shipped API.

### Data store

- **Abstracts:** persistence over a SQL/Postgres host.
- **Interface sketch:** `interface StorageAdapter { getUser(id): Promise<User>; putSurface(s): Promise<void>; /* ... */ }`
- **Makes swappable:** any host of the same engine — a managed serverless Postgres, a cloud RDS
  instance, a self-hosted cluster.
- **Do NOT abstract here:** the engine's load-bearing features (JSON columns, triggers, window
  functions). Abstract the *host*, not the *engine*. Going cross-engine is a separate, explicit
  decision.

### Auth / identity

- **Abstracts:** verifying identity and minting the app's own session.
- **Interface sketch:** `interface AuthProvider { verify(token): Promise<Principal>; }`
- **Makes swappable:** the upstream identity provider (hosted auth service, an OAuth issuer, a
  self-hosted IdP).
- **Do NOT abstract here:** the app's own session lifecycle. The app owns the session; only the
  *upstream* identity source is pluggable, so clients never depend on a specific provider's tokens.

### Realtime broadcast

- **Abstracts:** pushing change notifications to subscribed clients.
- **Interface sketch:** `interface RealtimeBroker { publish(channel, event): Promise<void>; subscribe(channel, cb): Unsub; }`
- **Makes swappable:** the transport — a database notify channel, a hosted realtime service, a
  message bus.
- **Do NOT abstract here:** the event *shape* clients consume — that is a wire contract, kept stable
  behind the broker.

### Event bus

- **Abstracts:** dispatching work for out-of-process or fan-out handling.
- **Interface sketch:** `interface EventBus { emit(event): Promise<void>; on(type, handler): void; }`
- **Makes swappable:** an in-process implementation, a hosted queue, a pub/sub broker — chosen by how
  many workers must see each event.
- **Do NOT abstract here:** ordering/delivery guarantees your handlers actually rely on; make them
  explicit in the interface contract rather than assuming a specific broker's semantics.

### HTTP runtime

- **Abstracts:** where the HTTP entry point runs.
- **Interface sketch:** keep the app a runtime-agnostic handler — `app.fetch(request): Promise<Response>`
  — with a thin per-target entry (`server.listen` for a long-running process; a handler export for a
  serverless function or edge worker).
- **Makes swappable:** the deployment target — a Node/Bun/Deno process, a serverless function, an
  edge worker — by writing a new entry point, not by changing the app.
- **Do NOT abstract here:** genuinely platform-specific capabilities you deliberately depend on; if
  you use one, that is a load-bearing choice to name, not to hide.
