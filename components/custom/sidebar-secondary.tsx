import * as React from "react"
import { type LucideIcon } from "lucide-react"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function NavSecondary({items, ...props}: {items: {title: string, url: string, icon: LucideIcon}[]} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <a href={item.url}>
                  <item.icon/>
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}


// <SidebarMenu>
// <SidebarMenuItem>
//   <DropdownMenu>
//     <DropdownMenuTrigger asChild>
//       <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
//         <ChevronsUpDown className="ml-auto size-4" />
//       </SidebarMenuButton>
//     </DropdownMenuTrigger>
//     <DropdownMenuContent
//       className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
//       side={isMobile ? "bottom" : "right"}
//       align="end"
//       sideOffset={4}
//     >
//       <DropdownMenuItem onClick={() => router.push('/profile')}> <BadgeCheck/> Account </DropdownMenuItem>
//       <DropdownMenuItem> <CreditCard/> Billing </DropdownMenuItem>
//       <DropdownMenuSeparator/>
//       <DropdownMenuItem onClick={async () => {
//         try {
//           await signOut();
//           setUser(null);
//           router.push('/');
//           router.refresh();
//         } catch (error) {
//           console.error('Logout error:', error);
//           toast.error('Failed to log out');
//         }
//       }}> <LogOut/> Log Out </DropdownMenuItem>
//     </DropdownMenuContent>
//   </DropdownMenu>
// </SidebarMenuItem>
// </SidebarMenu>
