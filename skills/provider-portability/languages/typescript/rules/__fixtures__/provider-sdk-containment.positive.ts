// VIOLATION: a provider SDK imported directly in business logic, outside any adapter package.
// The containment rule must flag this line.
import { createClient } from '@supabase/supabase-js';

export function loadUser(id: string) {
  const db = createClient(process.env.URL!, process.env.KEY!);
  return db.from('users').select().eq('id', id);
}
