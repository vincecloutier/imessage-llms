import { createClient } from '@/lib/supabase/client';

export async function anonymousSignIn() {
  const supabase = createClient();
  
  // First try to get the existing session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // If session exists and is valid, return it
  if (session && !sessionError) {
    try {
      // Verify the session is still valid by getting the user
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        return session;
      }
      // If error or no user, sign out to clear the invalid session
      await supabase.auth.signOut();
    } catch (e) {
      // Handle any errors by signing out
      await supabase.auth.signOut();
    }
  }
  
  // Create a new anonymous user
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function signIn(email: string) {
  const supabase = createClient();
  await supabase.auth.signOut(); // in case there's an anon token
  const url = (process.env.NODE_ENV === 'production') ? 'https://april-nextjs.vercel.app/' : 'http://localhost:3000/';
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: `${url}/auth/callback`,
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