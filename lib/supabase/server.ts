import { cache } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { Persona, Conversation } from '@/lib/types';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {console.error("Error fetching user:", error.message); return null;}
  return user;
});

export const getCachedPersonas = cache(async (userId: string): Promise<Persona[]> => {
    if (!userId) return [];
    const supabase = await createClient();
    const { data: personas, error } = await supabase.from('personas').select('*').eq('user_id', userId).order('attributes->name');    
    if (error) {console.error('Error fetching personas:', error); return [];}
    return personas || [];
});

export const getCachedUserProfile = cache(async (userId: string) => {
    if (!userId) return null;
    const supabase = await createClient();
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {console.error('Error fetching profile:', error); return null;}
    return profile;
});

export const getCachedMessages = cache(async (userId: string) => {
    if (!userId) return [];
    const supabase = await createClient();
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .eq('channel', 'web')
        .order('created_at', { ascending: false })
        .limit(20);
    if (error) {console.error('Error fetching messages:', error); return [];}
    return messages || [];
});

export const getCachedConversations = cache(async (userId: string) => {
    if (!userId) return [];
    const supabase = await createClient();
    
    // this query uses a window function to get the latest message for each persona
    const { data: conversations, error } = await supabase
        .from('messages')
        .select(`
            *,
            personas:persona_id (
                id,
                attributes
            )
        `)
        .eq('user_id', userId)
        .eq('channel', 'web')
        .order('created_at', { ascending: false })
        .limit(1000); // Get a reasonable number of messages to work with

    if (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }

    // group messages by persona_id and get the latest message for each
    const latestMessages = conversations.reduce((acc, message) => {
        const personaId = message.persona_id;
        if (!acc[personaId]) {
            acc[personaId] = {
                id: personaId,
                name: message.personas?.attributes?.name || 'Unknown',
                lastMessage: message.content,
                lastMessageTime: message.created_at,
                is_unread: false
            } as Conversation;
        }
        return acc;
    }, {} as Record<string, Conversation>);

    // Convert to array and sort by lastMessageTime
    return (Object.values(latestMessages) as Conversation[]).sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
}); 