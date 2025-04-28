import { Metadata } from 'next';
import { Toaster } from 'sonner';

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { BookOpen, Command, LifeBuoy, Send } from 'lucide-react';
import { NavPersonas } from '@/components/custom/sidebar-personas';
import { NavSecondary } from '@/components/custom/sidebar-secondary';
import { NavUser } from '@/components/custom/sidebar-user';

import './globals.css';
import { ThemeProvider } from '@/components/custom/theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://aprilintelligence.com'),
  title: 'April Intelligence',
  description: 'An AI companion service.',
};

export const viewport = {
  maximumScale: 1, // disable auto-zoom on mobile Safari
};

const data = {
    navSecondary: [
    { title: "Support", url: "mailto:support@aprilintelligence.com", icon: LifeBuoy },
    { title: "Feedback", url: "mailto:info@aprilintelligence.com", icon: Send },
    { title: "Privacy Policy", url: "/privacy", icon: BookOpen },
  ]
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head/>
      <body className="antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Toaster position="top-center" />
          <SidebarProvider>
            <Sidebar variant="floating">
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
            <SidebarInset>
              {children}
            </SidebarInset>
          </SidebarProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}