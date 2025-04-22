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
} from '@/components/ui/sidebar';
import { BookOpen, Command, LifeBuoy, Send } from 'lucide-react';
import { NavSecondary } from '@/components/custom/nav-footer';

const data = {
    navSecondary: [
      {
        title: "Support",
        url: "mailto:support@aprilintelligence.com",
        icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "mailto:info@aprilintelligence.com",
      icon: Send,
    },
    {
      title: "Privacy Policy",  
      url: "/privacy",
      icon: BookOpen,
    }
  ]
}

export function AppSidebar({ user, ...props }: { user: User | null } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">April Intelligence</span>
                  <span className="truncate text-xs">AI-powered research</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
       <SidebarHistory user={user} />
       <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}