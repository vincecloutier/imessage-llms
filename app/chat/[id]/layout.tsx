import { SidebarInset, SidebarProvider} from '@/components/ui/sidebar';

export default async function ChatLayout({children, sidebar}: {children: React.ReactNode, sidebar: React.ReactNode}) {
  return (
        <SidebarProvider style={{"--sidebar-width": "min(350px, 100vw)", "--sidebar-width-mobile": "100vw"} as React.CSSProperties}>
            {sidebar}
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}