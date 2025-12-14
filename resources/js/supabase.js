// resources/js/supabase.js
// Initialize Supabase client for use in React components.
// Note: Expose VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY via your Vite environment.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client that does nothing if Supabase is not configured
// This prevents the app from crashing when env vars are missing
let supabase;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn('Supabase environment variables not configured. Real-time features will be disabled.');
    // Create a mock supabase client that returns no-op functions
    supabase = {
        channel: () => ({
            on: function() { return this; },
            subscribe: function() { return this; },
            track: () => Promise.resolve(),
            unsubscribe: () => Promise.resolve(),
        }),
        removeChannel: () => Promise.resolve(),
    };
}

export { supabase };
export default supabase;
