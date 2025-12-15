// resources/js/supabase.js
// Initialize Supabase client for use in React components.
// Note: Expose VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY via your Vite environment.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if env vars are missing
const createMockClient = () => ({
    channel: () => ({
        on: () => ({ subscribe: () => {} }),
        subscribe: (cb) => { if (cb) cb('SUBSCRIBED'); return { unsubscribe: () => {} }; },
        unsubscribe: () => {},
        track: () => {},
        presenceState: () => ({}),
    }),
    from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
});

// Only create real client if both URL and key are available
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : createMockClient();

export default supabase;
