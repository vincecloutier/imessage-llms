import { Metadata } from 'next';
import { Toaster } from 'sonner';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/custom/app-sidebar';
import { getUser } from '@/lib/queries';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head/>
      <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <Toaster position="top-center" />
          <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
