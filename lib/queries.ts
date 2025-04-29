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
  const { data: users, error } = await supabase.from('profiles').select().eq('id', id).maybeSingle();
  if (error) {console.error(error); return null;}
  return users;
};

export const getPersonaById = async (personaId: string) => {
  const supabase = await createClient();
  const { data: persona, error } = await supabase.from('personas').select().eq('id', personaId).single();
  if (error) {console.error(error); return null;}
  return persona;
};

export const getPersonasByUserId = async (userId: string) => {
  const supabase = await createClient();
  const { data: personas, error } = await supabase.from('personas').select().eq('user_id', userId);
  if (error) {console.error(error); return [];}
  return personas;
};

export const getMessagesByPersonaId = async (personaId: string) => {
  const supabase = await createClient();
  const { data: messages, error } = await supabase.from('messages').select().eq('persona_id', personaId).order('created_at', { ascending: true }).limit(20);
  if (error) {console.error(error); return [];}
  return messages;
};