import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import {
  getPersonaByIdQuery,
  getUserQuery,
  getPersonasByUserIdQuery,
  getMessagesByPersonaIdQuery,
  getSessionQuery,
  getUserByIdQuery,
  getPersonaWithMessagesQuery,
} from '@/db/queries';

const getSupabase = cache(() => createClient());

export const getSession = async () => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getSessionQuery(supabase);
    },
    ['session'],
    {
      tags: [`session`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getUserById = async (id: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getUserByIdQuery(supabase, id);
    },
    [`user_by_id`, id.slice(2, 12)],
    {
      tags: [`user_by_id_${id.slice(2, 12)}`],

      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getUser = async (email: string) => {
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


export const getPersonaWithMessages = async (personaId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getPersonaWithMessagesQuery(supabase, { id: personaId });
    },
    ['persona_with_messages', personaId],
    {
      tags: [`persona_${personaId}`, `persona_${personaId}_messages`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};
