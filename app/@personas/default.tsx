import { getCachedUser,getCachedUserPersonas } from '@/lib/data';
import Link from 'next/link';
import { Plus, UserRound} from 'lucide-react';
import { SidebarGroup, SidebarGroupAction, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export default async function DefaultPersonas() {
  const user = await getCachedUser();
  if (!user || user.is_anonymous) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Personas</SidebarGroupLabel>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Login required.</div>
      </SidebarGroup>
    );
  }
  const personas = await getCachedUserPersonas(user.id);
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Personas</SidebarGroupLabel>
      <SidebarMenu>
        {personas.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/@personas/new"> <Plus /> <span>Create New Persona</span> </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          <SidebarGroupAction asChild>
            <Link href="/@personas/new"> <Plus /> </Link>
          </SidebarGroupAction>
        )}
        {personas.map((persona) => {
          return (
            <SidebarMenuItem key={persona.id}>
              <SidebarMenuButton asChild>
                {/* Link navigation works fine in Server Components */}
                <Link href={`/chat/${persona.id}`}>
                  <UserRound />
                  <span>{(persona.attributes.name || 'Unnamed Persona').toString()}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

