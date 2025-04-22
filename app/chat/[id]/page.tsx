import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Chat } from '@/components/custom/chat';
import {
  getPersonaById,
  getMessagesByPersonaId,
  getUser,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const { id } = params;

  const persona = await getPersonaById(id);

  if (!persona) {
    notFound();
  }

  const user = await getUser();

  if (!user) {
    return notFound();
  }

  if (user.id !== persona.user_id) {
    return notFound();
  }

  const messagesFromDb = id ? await getMessagesByPersonaId(id) : [];
  
  return (
      <Chat
      id={persona.id}
      initialMessages={convertToUIMessages(messagesFromDb)}
    />
  );
}
