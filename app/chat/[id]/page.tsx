import { notFound, redirect } from 'next/navigation';

import { Chat } from '@/components/custom/chat-main';
import { AppHeader } from '@/components/custom/app-header';
import { createClient } from '@/lib/supabase/server';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) redirect('/');

  const {data: profile} = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

  if (!profile || !profile.attributes.name) {
    return <AppHeader personaName='Unnamed Persona' user={user} profile={profile} />
  }

  const {data: personas} = await supabase.from('personas').select('*').eq('user_id', user.id);

  if (!personas || personas.length === 0) {
    return <div className="flex h-dvh items-center justify-center">Please create a persona if you want to chat.</div>;
  }

  const persona = personas.find((p) => p.id === id) || personas[0];

  const {data: messages} = await supabase.from('messages').select('*').eq('persona_id', persona.id).eq('user_id', user.id).order('created_at', { ascending: true }).limit(20);

  return (
    <>
    <AppHeader personaName={persona.attributes.name || 'Unnamed Persona'} user={user} profile={profile} />
    <Chat
      user_id={user.id}
      persona_id={persona.id}
      persona_name={persona.attributes.name || 'Unnamed Persona'}
      initialMessages={messages || []}
      user={user}
      profile={profile}
    />
    </>
  );
}
