import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export async function signIn(email: string) {
  const supabase = createClient();
  const url = (process.env.NODE_ENV === 'production') ? 'https://april-nextjs.vercel.app' : 'http://localhost:3000';
  const { data, error } = await supabase.auth.signInWithOtp({email: email, options: {emailRedirectTo: `${url}/auth/callback`}})
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}