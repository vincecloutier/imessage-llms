'use client';

import { User } from '@supabase/supabase-js';

import { SidebarHistory } from '@/components/custom/nav-personas';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { BookOpen, Command, LifeBuoy, Send } from 'lucide-react';
import { NavUser } from '@/components/custom/nav-user';
import { NavSecondary } from '@/components/custom/nav-secondary';

const data = {
    navSecondary: [
    { title: "Support", url: "mailto:support@aprilintelligence.com", icon: LifeBuoy },
    { title: "Feedback", url: "mailto:info@aprilintelligence.com", icon: Send },
    { title: "Privacy Policy", url: "/privacy", icon: BookOpen },
  ]
}

const user_preview = {
  name: "April Smith",
  email: "april@aprilintelligence.com",
  avatar: "https://github.com/shadcn.png",
}

export function AppSidebar({ user, ...props }: { user: User | null } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      <Command className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">April Intelligence</span>
                    <span className="">v1.0.0</span>
                  </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
       <SidebarHistory user={user} />
       <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user_preview}/>}
      </SidebarFooter>
    </Sidebar>
  );
}