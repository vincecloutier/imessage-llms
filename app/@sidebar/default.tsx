import { AppSidebar } from '@/components/custom/app-sidebar';
import { PersonaForm } from '@/components/custom/persona-form';
import { ProfileForm } from '@/components/custom/profile-form';
import { getCachedUser,getCachedPersonas, getCachedUserProfile, getCachedConversations } from '@/lib/supabase/server';

export default async function DefaultPersonas() {
  const user = await getCachedUser();
  if (!user || user.is_anonymous) return <AppSidebar personas={[]} chats={[]} isLoggedIn={false} />
  
  const profile = await getCachedUserProfile(user.id);
  if (!profile) return <ProfileForm user={user} profile={null} />;

  const personas = await getCachedPersonas(user.id);
  if (personas.length === 0) return <PersonaForm persona={null} freshProfile={true}/>;

  const conversations = await getCachedConversations(user.id);

  return <AppSidebar personas={personas} chats={conversations} isLoggedIn={true} />
}