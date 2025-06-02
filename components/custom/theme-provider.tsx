"use client"
 
import * as React from "react"
import { useTheme, ThemeProvider as NextThemesProvider } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { SidebarMenuButton, SidebarMenuItem} from "../ui/sidebar"

export function ThemeProvider({children, ...props}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button variant="ghost" className="size-7" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Sun size={4} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon size={4} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 

export function ThemeToggleSidebar() {
  const { theme, setTheme } = useTheme()
  return (
    <SidebarMenuItem key="Theme Toggle" className="text-muted-foreground hover:text-foreground">
      <SidebarMenuButton className="p-2 flex items-center justify-center" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} tooltip={{ children: "Toggle Theme", hidden: false }}>
        <Sun className="size-5 shrink-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="size-5 shrink-0 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
} 