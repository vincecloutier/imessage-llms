import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  PostgrestError,
  type Client,
  type Message,
} from '@/lib/supabase/types';

const getSupabase = async () => createClient();

async function mutateQuery<T extends any[]>(
  queryFn: (client: Client, ...args: T) => Promise<void>,
  args: T,
  tags: string[]
) {
  const supabase = await getSupabase();
  try {
    await queryFn(supabase, ...args);
    tags.forEach((tag) => revalidateTag(tag));
  } catch (error) {
    handleDatabaseError(error as PostgrestError);
  }
}

export async function savePersona({
  id,
  userId,
  name,
}: {
  id: string;
  userId: string;
  name: string;
}) {
  await mutateQuery(
    async (client, { id, userId, name }) => {
      const now = new Date().toISOString();
      const { error } = await client.from('personas').insert({
        id,
        user_id: userId,
        name,
        created_at: now,
        updated_at: now,
      });
      if (error) throw error;
    },
    [{ id, userId, name }],
    [`user_${userId}_personas`, `persona_${id}`, 'personas']
  );
}

export async function deletePersonaById(personaId: string, userId: string) {
  await mutateQuery(
    async (client, id) => {
      // Messages will be automatically deleted due to CASCADE
      const { error } = await client.from('personas').delete().eq('id', id);
      if (error) throw error;
    },
    [personaId],
    [
      `persona_${personaId}`, // Invalidate specific persona
      `user_${userId}_personas`, // Invalidate user's persona list
      `persona_${personaId}_messages`, // Invalidate persona messages
      'personas', // Invalidate all personas cache
    ]
  );
}

export async function saveMessages({
  personaId,
  messages,
}: {
  personaId: string;
  messages: Message[];
}) {
  await mutateQuery(
    async (client, { personaId, messages }) => {
      const formattedMessages = messages.map((message) => {
        // Handle tool invocations and content
        let content = message.content;

        // If message has tool invocations, save them as part of the content
        if (message?.toolInvocations && message?.toolInvocations?.length > 0) {
          content = JSON.stringify({
            content: message.content,
            toolInvocations: message.toolInvocations,
          });
        } else if (typeof content === 'object') {
          content = JSON.stringify(content);
        }

        // Handle annotations if present
        if (message.annotations && message.annotations?.length > 0) {
          content = JSON.stringify({
            content: content,
            annotations: message.annotations,
          });
        }

        return {
          id: message.id,
          persona_id: personaId,
          role: message.role,
          content: content,
          created_at: message.created_at || new Date().toISOString(),
        };
      });

      const { error } = await client.from('messages').insert(formattedMessages);
      if (error) throw error;
    },
    [{ personaId, messages }],
    [`persona_${personaId}_messages`, `persona_${personaId}`]
  );
}