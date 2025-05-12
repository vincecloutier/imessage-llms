import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export async function signIn(email: string) {
  const supabase = createClient();
  const url = (process.env.NODE_ENV === 'production') ? 'https://app.aprilintelligence.com' : 'http://localhost:3000';
  const { data, error } = await supabase.auth.signInWithOtp({email: email, options: {emailRedirectTo: `${url}`}})
  if (error) throw new Error(error.message);
  return data;
}

export async function verifyOTP(email: string, otp: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.verifyOtp({email: email, token: otp, type: 'email'});
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}