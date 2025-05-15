"use client"

import * as React from "react"
import { Command, Inbox, Send, Contact, BookOpen, LifeBuoy } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"

// Common styles
const commonStyles = {
  sidebarWidth: "w-[calc(var(--sidebar-width-icon)+1px)]!",
  menuButton: "px-2.5 md:px-2",
  mailItem: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap",
  mailTeaser: "line-clamp-2 w-[260px] text-xs whitespace-break-spaces"
}

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Conversations",
      url: "#",
      icon: Inbox,
      isActive: true,
    },
    {
      title: "Contacts",
      url: "#",
      icon: Contact,
      isActive: false,
    },
  ],
  mails: [
    {
      name: "William Smith",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      date: "09:34 AM",
      teaser:
        "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    },
    {
      name: "Alice Smith",
      email: "alicesmith@example.com",
      subject: "Re: Project Update",
      date: "Yesterday",
      teaser:
        "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    },
    {
      name: "Bob Johnson",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      date: "2 days ago",
      teaser:
        "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    },
    {
      name: "Emily Davis",
      email: "emilydavis@example.com",
      subject: "Re: Question about Budget",
      date: "2 days ago",
      teaser:
        "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    },
    {
      name: "Michael Wilson",
      email: "michaelwilson@example.com",
      subject: "Important Announcement",
      date: "1 week ago",
      teaser:
        "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    },
  ],
}

const items = [
  { title: "Support", url: "mailto:support@aprilintelligence.com", icon: LifeBuoy },
  { title: "Feedback", url: "mailto:info@aprilintelligence.com", icon: Send },
  { title: "Privacy Policy", url: "/privacy", icon: BookOpen },
]

// define types for our data structures
type Mail = {
  name: string;
  email: string;
  subject: string;
  date: string;
  teaser: string;
}

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

// chat item component
const MailItem = ({ mail }: { mail: Mail }) => (
  <a href="#" key={mail.email} className={commonStyles.mailItem}>
    <div className="flex w-full items-center gap-2">
      <span>{mail.name}</span>{" "}
      <span className="ml-auto text-xs">{mail.date}</span>
    </div>
    <span className={commonStyles.mailTeaser}> {mail.teaser}</span>
  </a>
)

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [activeItem, setActiveItem] = React.useState<NavItem>(data.navMain[0])
  const [mails, setMails] = React.useState<Mail[]>(data.mails)
  const { setOpen } = useSidebar()

  const handleItemClick = (item: NavItem) => {
    setActiveItem(item)
    const mail = data.mails.sort(() => Math.random() - 0.5)
    setMails(mail.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1)))
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
                {data.navMain.map((item) => (
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
                {items.map((item) => (
                  <MenuItem
                    key={item.title}
                    item={item}
                    isActive={false}
                    onClick={() => {}}
                    asChild
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-5 border-b py-3 px-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
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
              {mails.map((mail) => (<MailItem key={mail.email} mail={mail}/>))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}

export function AppSidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className={`sticky hidden lg:flex top-0 h-svh border-l ${commonStyles.sidebarWidth}`}
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border">
      </SidebarHeader>
      <SidebarContent>
      </SidebarContent>
    </Sidebar>
  )
}
