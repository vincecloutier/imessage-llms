import { createClient } from '@/lib/supabase/client';

export async function signIn(email: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: `${location.origin}/auth/callback`,
    }
  })
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw {
      message: error.message,
      status: error.status || 500,
    };
  }
}