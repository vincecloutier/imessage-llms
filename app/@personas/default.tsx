import { getCachedUser,getCachedUserPersonas, getCachedUserProfile } from '@/lib/data';
import Link from 'next/link';
import { Plus, UserRound} from 'lucide-react';
import { SidebarGroup, SidebarGroupAction, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { PersonaForm } from '@/components/custom/persona-form';
import { ProfileForm } from '@/components/custom/profile-form';

export default async function DefaultPersonas() {
  const user = await getCachedUser();
  if (!user || user.is_anonymous) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Personas</SidebarGroupLabel>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Login to save and edit your personas!</div>
      </SidebarGroup>
    );
  }
  const profile = await getCachedUserProfile(user.id);
  if (!profile) return <ProfileForm user={user} profile={null} />;

  const personas = await getCachedUserPersonas(user.id);
  if (personas.length === 0) return <PersonaForm persona={null} freshProfile={true}/>;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Personas</SidebarGroupLabel>
      <SidebarMenu>
        <PersonaForm persona={null} />
        {personas.map((persona) => {
          return (
            <SidebarMenuItem key={persona.id}>
              <SidebarMenuButton asChild>
                <Link href={`/chat/${persona.id}`}>
                  <UserRound />
                  <span>{(persona.attributes.name || 'Unnamed Persona').toString()}</span>
                </Link>
              </SidebarMenuButton>
              <PersonaForm persona={persona} />
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

