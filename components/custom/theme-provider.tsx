"use client"
 
import * as React from "react"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { useTheme, ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({children, ...props}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return <ThemeSwitcher className="bg-transparent" defaultValue="system" value={theme as "dark" | "light" | "system"} onChange={setTheme} />
} 