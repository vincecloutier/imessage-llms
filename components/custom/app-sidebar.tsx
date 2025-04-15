'use client';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { SidebarHistory } from '@/components/custom/sidebar-history';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { BookOpen, Command, LifeBuoy, Send  } from 'lucide-react';
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
    },
    // {
    //   title: "Terms of Service",
    //   url: "/terms",
    //   icon: BookOpen,
    // }
  ]
}
// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   return (
//     <Sidebar variant="inset" {...props}>
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton size="lg" asChild>
//               <a href="#">
//                 <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
//                   <Command className="size-4" />
//                 </div>
//                 <div className="grid flex-1 text-left text-sm leading-tight">
//                   <span className="truncate font-semibold">Acme Inc</span>
//                   <span className="truncate text-xs">Enterprise</span>
//                 </div>
//               </a>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent>
//         <NavMain items={data.navMain} />
//         <NavProjects projects={data.projects} />
//         <NavSecondary items={data.navSecondary} className="mt-auto" />
//       </SidebarContent>
//       <SidebarFooter>
//         <NavUser user={data.user} />
//       </SidebarFooter>
//     </Sidebar>
//   )
// }


export function AppSidebar({ user, ...props }: { user: User | null } & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
        <SidebarGroup>
          <SidebarHistory user={user ?? undefined} />
        </SidebarGroup>
       <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}