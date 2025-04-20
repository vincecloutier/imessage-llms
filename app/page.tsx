import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Chat as PreviewChat } from '@/components/custom/chat';
import {
  getPersonaById,
  getMessagesByPersonaId,
  getSession,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';

export default async function Home({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams.id || null;

  if (!id) {
    return (
      <div>
        <h1>No persona id provided</h1>
        <p>Here we will handle the creation of a new persona</p>
      </div>
    )
  }

  const persona = await getPersonaById(id);

  if (!persona) {
    notFound();
  }

  const user = await getSession();

  if (!user) {
    return notFound();
  }

  if (user.id !== persona.user_id) {
    return notFound();
  }

  const messagesFromDb = id ? await getMessagesByPersonaId(id) : [];

  console.log(convertToUIMessages(messagesFromDb));

  return (
    <PreviewChat
      id={persona.id}
      initialMessages={convertToUIMessages(messagesFromDb)}
    />
  );
}
