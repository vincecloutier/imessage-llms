
import { PersonaForm } from '@/components/custom/persona-form';
import { ProfileForm } from '@/components/custom/profile-form';
import { getCachedUser,getCachedPersonas, getCachedUserProfile, getCachedConversations } from '@/lib/supabase/server';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/custom/app-sidebar';

export default async function DefaultPersonas() {
  const user = await getCachedUser();
  if (!user || user.is_anonymous) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Personas</SidebarGroupLabel>
        <div className="px-2 py-1 text-xs text-muted-foreground/50">Login to save and edit your personas!</div>
      </SidebarGroup>
    );
  }
  const profile = await getCachedUserProfile(user.id);
  if (!profile) return <ProfileForm user={user} profile={null} />;

  const personas = await getCachedPersonas(user.id);
  if (personas.length === 0) return <PersonaForm persona={null} freshProfile={true}/>;

  const conversations = await getCachedConversations(user.id);

  return <AppSidebar personas={personas} chats={conversations} />
}