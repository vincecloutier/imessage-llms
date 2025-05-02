import { redirect, notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { Chat } from '@/components/custom/chat-main';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // if user is signed in, redirect to chat
  if (user && !user.is_anonymous) redirect('/chat/0');

  // if there is still no user, give up
  if (!user) return notFound();

  return (
    <Chat 
      user_id={user.id} 
      persona_id="new" 
      initialMessages={[]} 
      persona_name="April (Unsaved Persona)" 
      user={user} 
      profile={null} 
    />
  );
}