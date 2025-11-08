// resources/js/supabase.js
// Initialize Supabase client for use in React components.
// Note: Expose VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY via your Vite environment.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
