import { cache } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { Persona } from '@/lib/types';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

export const getCachedUser = cache(async () => {
  console.log("Attempting to fetch user...");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {console.error("Error fetching user:", error.message); return null;}
  console.log("User fetched successfully");
  return user;
});

export const getCachedPersonas = cache(async (userId: string): Promise<Persona[]> => {
    if (!userId) return [];
    console.log(`Attempting to fetch personas for user ${userId}...`);
    const supabase = await createClient();
    const { data: personas, error } = await supabase.from('personas').select('*').eq('user_id', userId);
    if (error) {console.error('Error fetching personas:', error); return [];}
    console.log("Personas fetched successfully:", personas);
    return personas || [];
});

export const getCachedUserProfile = cache(async (userId: string) => {
    if (!userId) return null;
    console.log(`Attempting to fetch profile for user ${userId}...`);
    const supabase = await createClient();
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {console.error('Error fetching profile:', error); return null;}
    console.log("Profile fetched successfully:", profile);
    return profile;
}); 