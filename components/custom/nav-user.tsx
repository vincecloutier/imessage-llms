"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-provider"
import { cn } from "@/lib/utils"
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_MOBILE } from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import React from "react"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full flex flex-col-reverse">
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-muted px-4 h-12">
          <Avatar className="h-8 w-8 rounded-lg bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-700 shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.3)] text-white overflow-hidden">
            <AvatarFallback className="rounded-lg bg-transparent">{user.name}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "rounded-none data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden"
        )}
      >
          <div className="my-2 h-px" />
          <div>
            <button className="flex w-full items-center rounded-md p-2 text-sm hover:bg-muted">
              <BadgeCheck className="mr-2 size-4" />
              Account
            </button>
            <button className="flex w-full items-center rounded-md p-2 text-sm hover:bg-muted">
              <CreditCard className="mr-2 size-4" />
              Billing
            </button>
          </div>
          <div className="my-2 h-px bg-border" />
          <div className="p-2">
            <ThemeToggle />
          </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
