import Link from 'next/link';

import { PersonaForm } from '@/components/custom/persona-form';
import { ProfileForm } from '@/components/custom/profile-form';
import { getCachedUser,getCachedPersonas, getCachedUserProfile, getCachedConversations, Conversation } from '@/lib/supabase/server';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
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

  const conversations = await getCachedConversations(user.id);

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
    <SidebarHeader className="gap-5 border-b py-3 px-4">
    <div className="flex w-full items-center justify-between">
      <div className="text-foreground text-base font-medium">
        Inbox
      </div>
      <Label className="flex items-center gap-2 text-sm">
        <span>Unread</span>
        <Switch className="shadow-none" />
      </Label>
    </div>
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup className="p-0">
      <SidebarGroupContent>
        {conversations.map((conversation) => (
            <Link href={`/chat/${conversation.id}`} key={conversation.id} className={commonStyles.mailItem}>
            <div className="flex w-full items-center gap-2">
              <span>{conversation.name}</span>{" "}
              <span className="ml-auto text-xs">{new Date(conversation.lastMessageTime).toLocaleDateString()}</span>
            </div>
            <span className={commonStyles.mailTeaser}> {conversation.lastMessage}</span>
          </Link>
        ))}
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
  </Sidebar>
  );
}

const commonStyles = {
  sidebarWidth: "w-[calc(var(--sidebar-width-icon)+1px)]!",
  menuButton: "px-2.5 md:px-2",
  mailItem: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap",
  mailTeaser: "line-clamp-2 w-[260px] text-xs whitespace-break-spaces"
}