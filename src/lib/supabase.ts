// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

export const createSupabaseServer = (access_token?: string) => {
  return createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: access_token ? { Authorization: `Bearer ${access_token}` } : {},
      },
    }
  );
};

// Mantenemos este para el cliente (browser)
export const supabase = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);