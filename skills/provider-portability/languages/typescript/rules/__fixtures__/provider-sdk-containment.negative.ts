// CLEAN: business logic depends only on the owned seam interface, never on a provider SDK.
// The containment rule must NOT flag this file.
import type { StorageAdapter } from '../ports/storage';

export function loadUser(store: StorageAdapter, id: string) {
  return store.getUser(id);
}
