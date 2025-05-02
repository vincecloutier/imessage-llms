import { redirect, notFound } from 'next/navigation';
import { getCachedUser } from '@/lib/data'; // Use cached functions
import { Chat } from '@/components/custom/chat-main';
import { AppHeader } from '@/components/custom/app-header';

export default async function Home() {
  const user = await getCachedUser();

  if (user && !user.is_anonymous) redirect('/chat/0');

  // if there is still no user, give up
  if (!user) return notFound();

  return (
    <>
    <AppHeader personaName={"April (Unsaved Persona"} user={user} profile={null} />
    <Chat 
      user_id={user.id} 
      persona_id="new" 
      initialMessages={[]} 
      persona_name="April (Unsaved Persona)" 
      user={user} 
      profile={null} 
    />
    </>
  );
}