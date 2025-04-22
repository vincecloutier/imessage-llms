import { Chat as PreviewChat } from '@/components/custom/chat-main';

export default async function Home() {  
  return (
      <PreviewChat
      user_id={null}
      id={null}
      initialMessages={[]}
    />
  );
}