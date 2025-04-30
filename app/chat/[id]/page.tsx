import { notFound, redirect } from 'next/navigation';

import { Chat } from '@/components/custom/chat-main';
import { getMessagesByPersonaId, getUser, getPersonas } from '@/lib/queries';

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  const user = await getUser();
  if (!user || user.is_anonymous) redirect('/');

  const persona = await getPersonas(user.id, id);

  if (!persona) {
    return notFound();
  }

  const messagesFromDb = await getMessagesByPersonaId(id); 
  
  return (
    <Chat
      user_id={user.id}
      persona_id={persona.id}
      persona_name={persona.attributes.name}
      initialMessages={messagesFromDb}
    />
  );
}
