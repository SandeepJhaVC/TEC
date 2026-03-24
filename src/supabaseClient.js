import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Guard: createClient throws if either value is undefined/empty.
// App will still render; Supabase features degrade gracefully.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : {
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured.' } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase not configured.' } }),
        signOut: async () => {},
      },
      from: () => ({
        select: () => ({ order: () => ({ data: [], error: null }) }),
        insert: async () => ({ error: null }),
        update: () => ({ eq: async () => ({ error: null }) }),
        delete: () => ({ eq: async () => ({ error: null }) }),
      }),
    };

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);
