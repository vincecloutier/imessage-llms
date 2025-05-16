import Link from 'next/link';

import { Plus, UserRound} from 'lucide-react';
import { PersonaForm } from '@/components/custom/persona-form';
import { ProfileForm } from '@/components/custom/profile-form';
import { getCachedUser,getCachedPersonas, getCachedUserProfile } from '@/lib/supabase/server';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
    <SidebarHeader className="gap-5 border-b py-3 px-4">
    <div className="flex w-full items-center justify-between">
      <div className="text-foreground text-base font-medium">
        Contacts
      </div>
      <Label className="flex items-center gap-2 text-sm">
        <span>Add Contact</span>
        <PersonaForm persona={null}/>
      </Label>
    </div>
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup className="p-0">
      <SidebarGroupContent>
        {personas.map((persona) => (<PersonaForm key={persona.id} persona={persona} />))}
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
  </Sidebar>
  );
}