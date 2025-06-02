"use client"

import * as React from "react"
import Link from 'next/link';
import { Inbox, Send, Contact, BookOpen, LifeBuoy, LogOut } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { Persona, Conversation, User, Profile } from '@/lib/types';
import { cn } from "@/lib/utils";
import { PersonaForm } from "./form-persona";
import { Button } from "../ui/button";
import { ProfileForm } from "./form-profile";
import { ThemeToggle } from "./theme-provider";

const commonStyles = {
  sidebarWidth: "w-[calc(var(--sidebar-width-icon)+1px)]!",
  menuButton: "px-2.5 md:px-2",
  mailItem: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col gap-2 border-b p-4 text-sm",
  mailTeaser: "line-clamp-2 w-full text-xs whitespace-break-spaces"
}

export function AppSidebar({personas, chats, user, profile, ...props }: {personas: Persona[], chats: Conversation[], user: User, profile: Profile}) {
  const [chatStates, setChatStates] = React.useState<Conversation[]>(chats);
  const { isMobile, setOpenMobile } = useSidebar();

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

  // ensure one entry per persona
  const combinedChats = personas.map(persona => {
    const existingChat = chatStates.find(chat => chat.id === persona.id);
    if (existingChat) {
      return existingChat;
    } else {
      return {id: persona.id, name: persona.attributes.name, lastMessage: "Send a message to start a conversation", lastMessageTime: null, is_unread: false};
    }
  });

  return (
    <Sidebar className="overflow-hidden border-t border-b border-l" {...props}>
      <SidebarHeader className="gap-5 py-3 px-4 border-b">
        <div className="flex w-full items-center justify-between">
          <div className="text-foreground text-base font-medium">
            Contacts
          </div>
          <div className="pr-0">
            <PersonaForm persona={null} />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        {/* Contacts Section */}
        <div className="p-0 pb-2">
          {combinedChats.map((chat) => {
            let displayDateOrStatus = "New";
            if (chat.lastMessageTime) {
              const messageDate = new Date(chat.lastMessageTime);
              const isToday = messageDate.toDateString() === new Date().toDateString();
              displayDateOrStatus = isToday
                ? messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : messageDate.toLocaleDateString();
            }
            const currentPersona = personas.find(p => p.id === chat.id);

            return (
              <div key={chat.id} className="flex items-stretch justify-start">
                <Link
                  href={`/chat/${chat.id}`}
                  key={chat.id}
                  className={cn(commonStyles.mailItem, "flex-grow")}
                  onClick={() => {if (isMobile) {setOpenMobile(false);}}}
                >
                  <div className="flex items-start gap-3">
                    {currentPersona && (
                      <div
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <PersonaForm persona={currentPersona} />
                      </div>
                    )}
                    <div className="flex flex-col w-full">
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="flex items-center gap-2 font-medium">
                          {chat.name as string}
                          {chat.is_unread && <span className="block h-2 w-2 rounded-full bg-primary" />}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">{displayDateOrStatus}</span>
                      </div>
                      <span className={cn(commonStyles.mailTeaser, "w-full mt-1")}>{chat.lastMessage.trim()}</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </SidebarContent>
      <SidebarFooter className="p-0 border-t">
        <ProfileForm profile={profile} user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}