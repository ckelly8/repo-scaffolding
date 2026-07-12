/**
 * provider-sdk-containment — merge this object into the `forbidden` array of the target's
 * `.dependency-cruiser.cjs`. It enforces the one mechanical part of the portability doctrine:
 * an external provider SDK may be imported ONLY from the adapter/ports package (the single
 * composition root). Importing it from business logic or a client bundle fails the verify gate,
 * because that is exactly what makes a host swap leak into user-facing code.
 *
 * Fill both constants from what Detect found in the target:
 *  - ADAPTER_PATH: the one path prefix where provider SDKs are allowed to live.
 *  - PROVIDER_SDKS: an alternation of the SDK prefixes actually present (see
 *    provider-sdk-families.json).
 */
const ADAPTER_PATH = '^(packages|src)/adapter-'; // the ONLY place a provider SDK may be imported
const PROVIDER_SDKS = '^(pg|postgres|@neondatabase/|@vercel/postgres|@supabase/|@aws-sdk/|@clerk/|firebase-admin)';

module.exports = {
  name: 'provider-sdk-containment',
  severity: 'error',
  comment:
    'External provider SDKs may be imported only from the adapter/ports package (the single ' +
    'composition root). A leak here means swapping the host would touch business logic — the ' +
    'expensive, user-visible failure the portability doctrine exists to prevent.',
  from: { pathNot: ADAPTER_PATH },
  to: { path: PROVIDER_SDKS },
};
