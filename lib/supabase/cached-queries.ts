import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {data: { user }, error} = await supabase.auth.getUser();
  if (!user) return null;
  if (error) {console.error(error); return null;}
  return user;
});

export const getProfile = cache(async (id: string) => {
  const supabase = await createClient();
  const { data: users, error } = await supabase.from('profiles').select().eq('id', id).single();
  if (error) throw error;
  return users;
});

export const getPersonaById = cache(async (personaId: string) => {
  const supabase = await createClient();
  const { data: persona, error } = await supabase.from('personas').select().eq('id', personaId).single();
  if (error) throw error;
  return persona;
});

export const getPersonasByUserId = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: personas, error } = await supabase.from('personas').select().eq('user_id', userId);
  if (error) throw error;
  return personas;
});

export const getMessagesByPersonaId = cache(async (personaId: string) => {
  const supabase = await createClient();
  const { data: messages, error } = await supabase.from('messages').select().eq('persona_id', personaId).order('created_at', { ascending: true }).limit(20);
  if (error) throw error;
  return messages;
});