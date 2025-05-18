"use client"

import * as React from "react"
import Link from 'next/link';
import { Command, Inbox, Send, Contact, BookOpen, LifeBuoy } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Persona, Conversation } from '@/lib/types';
import { PersonaForm } from "./persona-form";

const commonStyles = {
  sidebarWidth: "w-[calc(var(--sidebar-width-icon)+1px)]!",
  menuButton: "px-2.5 md:px-2",
  mailItem: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap",
  mailTeaser: "line-clamp-2 w-[260px] text-xs whitespace-break-spaces"
}

const navMain = [
    {title: "Inbox", url: "#", icon: Inbox, isActive: true},
    {title: "Contacts", url: "#", icon: Contact, isActive: false},
]
const items = [
  { title: "Support", url: "mailto:support@aprilintelligence.com", icon: LifeBuoy },
  { title: "Feedback", url: "mailto:info@aprilintelligence.com", icon: Send },
  { title: "Privacy Policy", url: "/privacy", icon: BookOpen },
]

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  isActive: boolean;
}

// sidebar item component
const MenuItem = ({ item, isActive, onClick }: { item: { title: string; icon: React.ElementType; url: string }; isActive: boolean; onClick: () => void; }) => {
  const isNextLink = item.url.startsWith("/");
  const isExternalNewTab = item.url.startsWith("http"); // mailto links handle themselves, http/https will be new tab

  const linkContent = (<> <item.icon /> <span>{item.title}</span> </>)

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        tooltip={{ children: item.title, hidden: false }}
        onClick={onClick} // Handles internal state like active item
        isActive={isActive}
        asChild={true} // SidebarMenuButton will use its child as the component
        className={commonStyles.menuButton}
      >
        {isNextLink ? (
          <Link href={item.url}>
            {linkContent}
          </Link>
        ) : (
          <a
            href={item.url}
            target={isExternalNewTab ? "_blank" : undefined}
            rel={isExternalNewTab ? "noopener noreferrer" : undefined}
          >
            {linkContent}
          </a>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const ContentPanel = ({ title, actions, isLoggedIn, children }: { title: string; actions?: React.ReactNode; isLoggedIn: boolean; children: React.ReactNode }) => {
  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarHeader className="gap-5 border-b py-3 px-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-foreground text-base font-medium">
            {title}
          </div>
          {isLoggedIn && actions}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            {isLoggedIn ? children : <div className="p-4">Login to view this content!</div>}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export function AppSidebar({personas, chats, isLoggedIn, ...props }: {personas: Persona[], chats: Conversation[], isLoggedIn: boolean}) {
  const [activeItem, setActiveItem] = React.useState<NavItem>(navMain[0])
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false);
  const { setOpen } = useSidebar()

  const handleItemClick = (item: NavItem) => {
    setActiveItem(item)
    setOpen(true)
  }

  // ensure one entry per persona
  const combinedChats = personas.map(persona => {
    const existingChat = chats.find(chat => chat.id === persona.id);
    if (existingChat) {
      return existingChat;
    } else {
      return {id: persona.id, name: persona.attributes.name, lastMessage: "Send a message to start a conversation", lastMessageTime: null, is_unread: false};
    }
  });

  const filteredChatsToDisplay = showUnreadOnly ? combinedChats.filter(chat => chat.is_unread) : combinedChats;
  
  return (
    <Sidebar collapsible="icon" className="overflow-hidden *:data-[sidebar=sidebar]:flex-row border-t border-b border-l" {...props}>
      <Sidebar collapsible="none" className={`${commonStyles.sidebarWidth} border-r`}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">April Intelligence</span>
                    <span className="truncate text-xs">v1.0.0</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <MenuItem
                    key={item.title}
                    item={item}
                    isActive={activeItem?.title === item.title}
                    onClick={() => handleItemClick(item)}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {items.map((item) => (<MenuItem key={item.title} item={item} isActive={false} onClick={() => {}} />))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>


    {activeItem.title === "Inbox" && (
      <ContentPanel
        title="Inbox"
        actions={
          <Label className="flex items-center gap-2 text-sm cursor-pointer">
            <span>Unread</span>
            <Switch className="shadow-none cursor-pointer" checked={showUnreadOnly} onCheckedChange={setShowUnreadOnly} />
          </Label>
        }
        isLoggedIn={isLoggedIn}
      >
        {isLoggedIn && filteredChatsToDisplay.length === 0 && !showUnreadOnly && (
          <div className="p-4 text-sm text-muted-foreground">No messages in your inbox. Create a contact to start chatting.</div>
        )}
        {isLoggedIn && filteredChatsToDisplay.length === 0 && showUnreadOnly && (
          <div className="p-4 text-sm text-muted-foreground">No unread messages.</div>
        )}
        {filteredChatsToDisplay.map((chat) => {
          let displayDateOrStatus = "New";
          if (chat.lastMessageTime) {
            const messageDate = new Date(chat.lastMessageTime);
            const isToday = messageDate.toDateString() === new Date().toDateString();
            displayDateOrStatus = isToday
              ? messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : messageDate.toLocaleDateString();
          }
          return (
            <Link href={`/chat/${chat.id}`} key={chat.id} className={commonStyles.mailItem}>
              <div className="flex w-full items-center gap-2">
                <span>{chat.name as string}</span>
                <span className="ml-auto text-xs">{displayDateOrStatus}</span>
              </div>
              <span className={commonStyles.mailTeaser}>{chat.lastMessage.trim()}</span>
            </Link>
          );
        })}
      </ContentPanel>
      )}
      {activeItem.title === "Contacts" && (
        <ContentPanel
          title="Contacts"
          actions={<PersonaForm persona={null}/>}
          isLoggedIn={isLoggedIn}
        >
          {personas.map((persona) => (<PersonaForm key={persona.id} persona={persona} />))}
        </ContentPanel>
      )}
    </Sidebar>
  )
}