import { Metadata } from 'next';
import { Toaster } from 'sonner';

import './globals.css';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { ThemeProvider } from '@/components/custom/theme-provider';
import { NavSecondary } from '@/components/custom/sidebar-secondary';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  metadataBase: new URL('https://aprilintelligence.com'),
  title: 'April Intelligence',
  description: 'An AI companion service.',
};

// disable auto-zoom on mobile Safari
export const viewport = { maximumScale: 1 };

export default async function RootLayout({children, personas}: {children: React.ReactNode, personas: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
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
                        <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                          <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src="/logo.svg" className="rounded-lg" />
                          </Avatar>
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                          <span className="font-semibold">April Intelligence</span>
                          <span className="text-xs">v1.0.0</span>
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>
              <SidebarContent>
                {personas}
                <NavSecondary className="mt-auto" />
              </SidebarContent>
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