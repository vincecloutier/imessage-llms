import * as React from "react"
import { BookOpen, LifeBuoy, Send } from "lucide-react"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function SidebarSecondary({...props}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const items = [
    { title: "Support", url: "mailto:support@aprilintelligence.com", icon: LifeBuoy },
    { title: "Feedback", url: "mailto:info@aprilintelligence.com", icon: Send },
    { title: "Privacy Policy", url: "/privacy", icon: BookOpen },
  ]
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