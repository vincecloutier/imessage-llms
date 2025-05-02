import { notFound, redirect } from 'next/navigation';
import { Chat } from '@/components/custom/chat-main';
import { getCachedUser, getCachedUserPersonas, getCachedUserProfile } from '@/lib/data';
import { AppHeader } from '@/components/custom/app-header';
import { createClient } from '@/lib/supabase/server';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getCachedUser();
  if (!user || user.is_anonymous) redirect('/');

  const profile = await getCachedUserProfile(user.id);

  if (!profile) {
    return <div className="flex h-dvh items-center justify-center">Please complete your profile first.</div>;
  }

  const personas = await getCachedUserPersonas(user.id);

  if (!personas || personas.length === 0) { return <div className="flex h-dvh items-center justify-center">Please create a persona first.</div>;}

  // Find the specific persona for this chat page
  // Handle the 'new' case if you intend to support it via URL directly
  const persona = personas.find((p) => p.id === id) || personas[0];

  // Fetch messages specifically for this persona - this is unique to the page
  const supabase = await createClient();
  const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('persona_id', persona.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(20);


  return (
    <>
    <AppHeader personaName={(persona.attributes.name || 'Unnamed Persona').toString()} user={user} profile={profile} />
    <Chat
      user_id={user.id}
      persona_id={persona.id}
      persona_name={(persona.attributes.name || 'Unnamed Persona').toString()}
      initialMessages={messages || []}
      user={user}
      profile={profile}
    />
    </>
  );
}
