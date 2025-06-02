"use client"
 
import * as React from "react"
import { useTheme, ThemeProvider as NextThemesProvider } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { SidebarMenuButton, SidebarMenuItem} from "../ui/sidebar"
import { ThemeSwitcher } from "../ui/theme-switcher"

export function ThemeProvider({children, ...props}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return <ThemeSwitcher className="bg-transparent" defaultValue="system" value={theme as "dark" | "light" | "system"} onChange={setTheme} />
} 