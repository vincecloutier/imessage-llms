import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.SB_NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SB_NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
