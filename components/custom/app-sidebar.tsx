'use client';

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
import { NavPersonas } from '@/components/custom/nav-personas';
import { NavSecondary } from '@/components/custom/nav-secondary';
import { NavUser } from '@/components/custom/nav-user';

const data = {
    navSecondary: [
    { title: "Support", url: "mailto:support@aprilintelligence.com", icon: LifeBuoy },
    { title: "Feedback", url: "mailto:info@aprilintelligence.com", icon: Send },
    { title: "Privacy Policy", url: "/privacy", icon: BookOpen },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
       <NavPersonas/>
       <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
         <NavUser/>
      </SidebarFooter>
    </Sidebar>
  );
}