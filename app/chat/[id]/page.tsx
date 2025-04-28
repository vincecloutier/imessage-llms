import { notFound } from 'next/navigation';

import { Chat } from '@/components/custom/chat-main';
import { getPersonaById, getMessagesByPersonaId, getUser } from '@/lib/queries';

export default async function Page(props: { params: Promise<any> }) {
  const { id } = await props.params;

  const user = await getUser();

  if (!user) {
    return notFound();
  }

  const persona = await getPersonaById(id);

  if (!persona || user.id !== persona.user_id) {
    return notFound();
  }

  const messagesFromDb = id ? await getMessagesByPersonaId(id) : [];
  
  return (
    <Chat
      user_id={user.id}
      persona_id={persona.id}
      persona_name={persona.attributes.name}
      initialMessages={messagesFromDb}
    />
  );
}
