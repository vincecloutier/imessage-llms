import { redirect } from 'next/navigation';
import { Chat } from '@/components/custom/chat-main';
import { getCachedUser, getCachedPersonas, getCachedUserProfile } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // check user is logged in
  const user = await getCachedUser();
  if (!user || user.is_anonymous) redirect('/');

  // check user has a profile
  const profile = await getCachedUserProfile(user.id);
  if (!profile) return null;

  // check user has personas
  const personas = await getCachedPersonas(user.id);
  if (!personas || personas.length === 0) return null;
  const persona = personas.find((p) => p.id === id) || personas[0];

  // load messages for the persona
  const supabase = await createClient();
  const { data: messages } = await supabase.from('messages').select('*').eq('persona_id', persona.id).eq('user_id', user.id).order('created_at', { ascending: true }).limit(20);

  return <Chat user={user} persona={persona} profile={profile} initialMessages={messages || []}/>
}
