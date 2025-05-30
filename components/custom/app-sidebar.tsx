"use client"

import * as React from "react"
import Link from 'next/link';
import { Inbox, Send, Contact, BookOpen, LifeBuoy } from "lucide-react"

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
import { cn } from "@/lib/utils";
import { PersonaForm } from "./form-persona";
import Image from "next/image";

const commonStyles = {
  sidebarWidth: "w-[calc(var(--sidebar-width-icon)+1px)]!",
  menuButton: "px-2.5 md:px-2",
  mailItem: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col gap-2 border-b p-4 text-sm",
  mailTeaser: "line-clamp-2 w-full text-xs whitespace-break-spaces"
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
  const { isMobile, setOpenMobile } = useSidebar();
  const isNextLink = item.url.startsWith("/");
  const isExternalNewTab = item.url.startsWith("http");
  const isHashLink = item.url === "#";

  const handlePress = () => {
    onClick();
    if (isMobile && !isHashLink) {
      setOpenMobile(false);
    }
  };

  const linkContent = (
    <item.icon className="size-5 shrink-0" />
  );

  return (
    <SidebarMenuItem key={item.title} className="text-muted-foreground hover:text-foreground">
      <SidebarMenuButton
        tooltip={{ children: item.title, hidden: false }}
        onClick={handlePress}
        isActive={isActive}
        asChild={true}
        className="p-2 flex items-center justify-center"
      >
        {isNextLink 
        ? (<Link href={item.url}>{linkContent}</Link>) 
        : (<a href={item.url} target={isExternalNewTab ? "_blank" : undefined} rel={isExternalNewTab ? "noopener noreferrer" : undefined}>{linkContent}</a>)}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const ContentPanel = ({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) => {
  const { isMobile } = useSidebar();
  return (
    <Sidebar collapsible="none" className={cn("w-80 md:w-80", isMobile && "w-full")}>
      <SidebarHeader className="gap-5 border-b py-3 px-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-foreground text-base font-medium">
            {title}
          </div>
          {actions}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            {children}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export function AppSidebar({personas, chats, ...props }: {personas: Persona[], chats: Conversation[]}) {
  const [activeItem, setActiveItem] = React.useState<NavItem>(navMain[0])
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false);
  const [chatStates, setChatStates] = React.useState<Conversation[]>(chats);
  const { setOpen, isMobile, setOpenMobile } = useSidebar()

  // compute unread status based on localStorage
  React.useEffect(() => {
    const compute = () => {
      const updated = chats.map(chat => {
        try {
          const readAt = localStorage.getItem(`read-${chat.id}`);
          const lastRead = readAt ? new Date(readAt).getTime() : 0;
          const lastMsg = chat.lastMessageTime ? new Date(chat.lastMessageTime).getTime() : 0;
          return { ...chat, is_unread: lastMsg > lastRead } as Conversation;
        } catch {
          return { ...chat };
        }
      });
      setChatStates(updated);
    };

    compute();
    window.addEventListener('chat-read', compute);
    window.addEventListener('storage', compute);
    return () => {
      window.removeEventListener('chat-read', compute);
      window.removeEventListener('storage', compute);
    };
  }, [chats]);

  const handleItemClick = (item: NavItem) => {
    setActiveItem(item)
    if (isMobile) {
      setOpenMobile(true);
    } else {
      setOpen(true);
    }
  }

  // ensure one entry per persona
  const combinedChats = personas.map(persona => {
    const existingChat = chatStates.find(chat => chat.id === persona.id);
    if (existingChat) {
      return existingChat;
    } else {
      return {id: persona.id, name: persona.attributes.name, lastMessage: "Send a message to start a conversation", lastMessageTime: null, is_unread: false};
    }
  });

  const filteredChatsToDisplay = showUnreadOnly ? combinedChats.filter(chat => chat.is_unread) : combinedChats;
  
  return (
  <Sidebar collapsible="icon" className="overflow-hidden border-t border-b border-l data-[state=open]:w-auto" {...props}>
    <div className="flex flex-row h-full w-full">
      <Sidebar collapsible="none" className={`${commonStyles.sidebarWidth} border-r`}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/">
                <Image src="/logo.svg" alt="April Intelligence" width={32} height={32} />
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
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
            <SidebarGroupContent>
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
      >
        {filteredChatsToDisplay.length === 0 && showUnreadOnly && (
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
            <Link 
              href={`/chat/${chat.id}`} 
              key={chat.id} 
              className={commonStyles.mailItem}
              onClick={() => {if (isMobile) {setOpenMobile(false);}}}
            >
              <div className="flex w-full items-center gap-2">
                <span className="flex items-center gap-2">
                  {chat.name as string}
                  {chat.is_unread && <span className="block h-2 w-2 rounded-full bg-primary" />}
                </span>
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
      >
      {personas.map((persona) => (<PersonaForm key={persona.id} persona={persona} /> ))}
      </ContentPanel>
    )}
  </div>
</Sidebar>
  )
}