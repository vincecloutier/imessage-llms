import { Chat } from '@/components/custom/chat-main';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  let { user } = (await supabase.auth.getUser()).data;

  // if user is signed in, redirect to chat
  if (user && !user.is_anonymous) redirect('/chat');

  // if user is not signed in, sign in anonymously
  if (!user) user = (await supabase.auth.signInAnonymously()).data.user;

  // if there is still no user, give up
  if (!user) return notFound();

  return (
    <Chat
      user_id={user.id}
      persona_id="new"
      persona_name="April"
      initialMessages={[]}
    />
  );
}