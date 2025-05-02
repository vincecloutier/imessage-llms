import { cache } from 'react';
import { createClient } from '@/lib/supabase/server'; // Use server client here
import { Persona } from '@/lib/types'; // Assuming you have this type

export const getCachedUser = cache(async () => {
  console.log("Attempting to fetch user..."); // Add log for debugging deduplication
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }
  return user;
});

export const getCachedUserPersonas = cache(async (userId: string): Promise<Persona[]> => {
    if (!userId) return [];
    console.log(`Attempting to fetch personas for user ${userId}...`); // Add log
    const supabase = await createClient();
    const { data: personas, error } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching personas:', error);
        return [];
    }
    return personas || [];
});

// Optional: Cache profile fetching if needed elsewhere too
export const getCachedUserProfile = cache(async (userId: string) => {
    if (!userId) return null;
    console.log(`Attempting to fetch profile for user ${userId}...`); // Add log
    const supabase = await createClient();
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return profile;
}); 