import { Metadata } from 'next';
import { Toaster } from 'sonner';

import './globals.css';
import { ThemeProvider } from '@/components/custom/theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://aprilintelligence.com'),
  title: 'April Intelligence',
  description: 'An AI companion service.',
};

// disable auto-zoom on mobile Safari
export const viewport = { maximumScale: 1 };

export default async function RootLayout({children, sidebar}: {children: React.ReactNode, sidebar: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </head> */}
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <Toaster position="top-center" richColors/>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}