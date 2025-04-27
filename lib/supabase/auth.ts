import { createClient } from '@/lib/supabase/client';

export async function anonymousSignIn() {
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (session) {
    return session;
  }
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function signIn(email: string) {
  const supabase = createClient();
  await supabase.auth.signOut(); // in case there's an anon token
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