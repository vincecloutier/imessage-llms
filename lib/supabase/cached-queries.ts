import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import type { Client } from './types';

const getSupabase = cache(() => createClient());

export const getUser = async () => {
  const supabase = await getSupabase();
  const {data: { user }, error} = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  if (error) {
    console.error(error);
    return null;
  }
  return user;
};

export const getUserByEmail = async (email: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getUserQuery(supabase, email);
    },
    ['user', email],
    {
      tags: [`user_${email}`],
      revalidate: 3600, // Cache for 1 hour
    }
  )();
};

export const getPersonaById = async (personaId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getPersonaByIdQuery(supabase, { id: personaId });
    },
    ['persona', personaId],
    {
      tags: [`persona_${personaId}`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getPersonasByUserId = async (userId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getPersonasByUserIdQuery(supabase, { id: userId });
    },
    ['personas', userId],
    {
      tags: [`user_${userId}_personas`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getMessagesByPersonaId = async (personaId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getMessagesByPersonaIdQuery(supabase, { id: personaId });
    },
    ['messages', personaId],
    {
      tags: [`persona_${personaId}_messages`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};




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