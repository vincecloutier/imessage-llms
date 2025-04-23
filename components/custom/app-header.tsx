import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";

export function AppHeader({title, subtitle}: {title: string, subtitle: string})  {
    return (
    <header className="flex justify-between h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex items-center gap-2">
        <SidebarTrigger/>   
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
            <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">{title}</BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
                <BreadcrumbPage>{subtitle}</BreadcrumbPage>
            </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        </div>
    </header>
    )
}