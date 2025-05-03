import { redirect, notFound } from 'next/navigation';
import { getCachedUser } from '@/lib/data'; 
import { Chat } from '@/components/custom/chat-main';

export default async function Home() {
  const user = await getCachedUser();

  if (user && !user.is_anonymous) redirect('/chat/0');

  // if there is still no user, give up
  if (!user) return notFound();

  // create dummy persona
  const persona = {id: 'new', attributes: {name: 'April (Unsaved Persona)'}, sender_address: ''}

  return <Chat user={user} persona={persona} profile={null} initialMessages={[]}/>
}