import { Chat } from '@/components/custom/chat-main';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  let { user } = (await supabase.auth.getUser()).data;
  if (!user || user.is_anonymous) {
    user = (await supabase.auth.signInAnonymously()).data.user;
  }
  if (!user) return null;

  return (
    <Chat
      user_id={user.id}
      persona_id="new"
      persona_name="April"
      initialMessages={[]}
    />
  );
}