import { AuthError } from '@supabase/supabase-js';
import type { Client, Database } from '../lib/supabase/types';

type Tables = Database['public']['Tables'];

export async function getUserQuery(client: Client, email: string) {
  const { data: users, error } = await client
    .from('users')
    .select()
    .eq('email', email)
    .single();

  if (error) throw error;
  return users;
}

export async function getPersonasByUserIdQuery(
  client: Client,
  { id }: { id: string }
) {
  const { data: personas, error } = await client
    .from('personas')
    .select()
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return personas;
}

export async function getPersonaByIdQuery(client: Client, { id }: { id: string }) {
  const { data: persona, error } = await client
    .from('personas')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return persona;
}

export async function getMessagesByPersonaIdQuery(
  client: Client,
  { id }: { id: string }
) {
  const { data: messages, error } = await client
    .from('messages')
    .select()
    .eq('persona_id', id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return messages;
}

type PostgrestError = {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
};

export function handleSupabaseError(error: PostgrestError | null) {
  if (!error) return null;

  if (error.code === 'PGRST116') {
    return null;
  }

  throw error;
}
