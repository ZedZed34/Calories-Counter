import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.\n' +
    'Guest mode will work, but auth and data persistence require a Supabase project.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'http://placeholder',
  supabaseAnonKey || 'placeholder'
);
