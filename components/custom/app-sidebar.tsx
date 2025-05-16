"use client"

import * as React from "react"
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

// Common styles
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
const MenuItem = ({ item, isActive, onClick, asChild = false }: { item: { title: string; icon: React.ElementType; url: string }; isActive: boolean; onClick: () => void; asChild: boolean }) => (
  <SidebarMenuItem key={item.title}>
    <SidebarMenuButton
      tooltip={{children: item.title, hidden: false}}
      onClick={onClick}
      isActive={isActive}
      asChild={asChild}
      className={commonStyles.menuButton}
    >
    <a href={item.url}> 
      <item.icon /> 
      <span>{item.title}</span>
    </a>
    </SidebarMenuButton>
  </SidebarMenuItem>
)

export function AppSidebar({personas, chats, ...props }: {personas: React.ReactNode, chats: React.ReactNode}) {
  const [activeItem, setActiveItem] = React.useState<NavItem>(navMain[0])
  const { setOpen } = useSidebar()

  const handleItemClick = (item: NavItem) => {
    setActiveItem(item)
    setOpen(true)
  }

  return (
    <Sidebar collapsible="icon" className="overflow-hidden *:data-[sidebar=sidebar]:flex-row border-t border-b border-l" {...props}>
      <Sidebar collapsible="none" className={`${commonStyles.sidebarWidth} border-r`}>
        <SidebarHeader>
          <SidebarMenu>
            <MenuItem 
              item={{
                title: "April Intelligence",
                icon: Command,
                url: "#",
              }}
              isActive={false}
              onClick={() => {}}
              asChild
            />
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
                    asChild
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {items.map((item) => (<MenuItem key={item.title} item={item} isActive={false} onClick={() => {}} asChild />))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      {activeItem.title === "Inbox" && chats}
      {activeItem.title === "Contacts" && personas}
    </Sidebar>
  )
}