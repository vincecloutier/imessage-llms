import { AppSidebar } from '@/components/custom/app-sidebar';
import { PersonaForm } from '@/components/custom/form-persona';
import { ProfileForm } from '@/components/custom/form-profile';
import { getCachedUser,getCachedPersonas, getCachedUserProfile, getCachedConversations } from '@/lib/supabase/server';

export default async function DefaultPersonas() {
  const user = await getCachedUser();
  if (!user || user.is_anonymous) return <AppSidebar personas={[]} chats={[]} />
  
  const profile = await getCachedUserProfile(user.id);
  if (!profile) return <ProfileForm user={user} profile={null} />;
  
  const personas = await getCachedPersonas(user.id);
  if (personas.length === 0) return <PersonaForm persona={null} showButton={false} freshProfile={true}/>;

  const conversations = await getCachedConversations(user.id);

  return <AppSidebar personas={personas} chats={conversations} />
}