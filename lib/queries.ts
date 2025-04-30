import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const getUser = async () => {
  const supabase = await createClient();
  const {data: { user }, error} = await supabase.auth.getUser();
  if (!user) return null;
  if (error) {console.error(error); return null;}
  return user;
};

export const getProfile = async (id: string) => {
  const supabase = await createClient();
  const { data: profile, error } = await supabase.from('profiles').select().eq('id', id).maybeSingle();
  if (error) {console.error(error); return null;}
  return profile;
};

export const getPersonas = async (userId: string, personaId?: string) => {
  const supabase = await createClient();
  const { data: personas, error } = await supabase.from('personas').select().eq('user_id', userId); 
  if (personaId) {
    return personas?.find((persona) => persona.id === personaId);
  }
  if (error) {console.error(error); return [];}
  return personas;
};

export const getMessagesByPersonaId = async (personaId: string) => {
  const supabase = await createClient();
  const { data: messages, error } = await supabase.from('messages').select().eq('persona_id', personaId).order('created_at', { ascending: true }).limit(20);
  if (error) {console.error(error); return [];}
  return messages;
};

export async function handleAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase.from('profiles').select().eq('id', user.id).maybeSingle();
  if (!profile) redirect('/profile');

  const { data: personas } = await supabase.from('personas').select().eq('user_id', user.id);
  if (!personas || personas.length === 0) redirect('/persona/new');

  return { supabase, user, profile, personas };
}