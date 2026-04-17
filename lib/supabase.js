import { createClient } from '@supabase/supabase-js';

// Usa a service role key — apenas no servidor, nunca exposta ao browser
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
