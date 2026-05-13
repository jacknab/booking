import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BusinessHours = {
  id: string;
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
};
