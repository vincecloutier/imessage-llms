import Image from 'next/image';
import { Metadata } from 'next';
import { Toaster } from 'sonner';

import './globals.css';
import { ThemeProvider } from '@/components/custom/theme-provider';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarProvider} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/custom/app-sidebar';

export const metadata: Metadata = {
  metadataBase: new URL('https://aprilintelligence.com'),
  title: 'April Intelligence',
  description: 'An AI companion service.',
};

// disable auto-zoom on mobile Safari
export const viewport = { maximumScale: 1 };

export default async function RootLayout({children, personas, chats}: {children: React.ReactNode, personas: React.ReactNode, chats: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Toaster position="top-center" richColors/>
          <SidebarProvider style={{"--sidebar-width": "350px"} as React.CSSProperties}>
      <AppSidebar personas={personas} chats={chats} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}