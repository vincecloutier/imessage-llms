'use client';

import { User } from '@supabase/supabase-js';
import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import {
  UserRound,
  MoreHorizontal,
  Trash2,
  Plus,
  ChevronRight,
  Pencil
} from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { UserDialog } from './user-dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';
import PersonaForm from './persona-form';

// Type for a persona record from Supabase
// Adjust properties as needed; here we assume a persona has at least an id and a title

type persona = Database['public']['Tables']['personas']['Row'];

const fetcher = async (): Promise<persona[]> => {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      return [];
    }

    const { data: personas, error: personasError } = await supabase
      .from('personas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (personasError) {
      console.error('Personas fetch error:', personasError);
      return [];
    }

    return personas || [];
  } catch (error) {
    console.error('Fetcher error:', error);
    return [];
  }
};

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile, isMobile } = useSidebar();
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data: history, isLoading, mutate } = useSWR<persona[]>(
    user ? ['personas', user.id] : null,
    fetcher,
    {
      fallbackData: [],
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting persona...',
      success: () => {
        mutate((history) => history ? history.filter((h) => h.id !== id) : []);
        return 'Persona deleted successfully';
      },
      error: 'Failed to delete persona',
    });

    setShowDeleteDialog(false);

    if (deleteId === id) {
      router.push('/');
    }
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Personas</SidebarGroupLabel>
        <div className="text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
          <div>Login to save and revisit previous personas!</div>
        </div>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Personas</SidebarGroupLabel>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Loading...</div>
      </SidebarGroup>
    );
  }

  return (
    <>
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
    <SidebarGroupLabel>Personas</SidebarGroupLabel>
        <SidebarMenu>
          {history?.map((persona) => (
            <SidebarMenuItem key={persona.id}>
              <SidebarMenuButton asChild>
                <Link href={`/chat/${persona.id}`} onClick={() => setOpenMobile(false)}>
                  <UserRound />
                  <span>{persona.name || 'New persona'}</span>
                </Link>
              </SidebarMenuButton>
              <PersonaForm persona={persona} trigger={<SidebarMenuAction showOnHover>
                <MoreHorizontal />
                <span className="sr-only">More</span>
              </SidebarMenuAction>} />
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus/>
              <span>Create New Persona</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}


// TODO: if you ever want to add memories and assets to be editable, use this as a starting point
// export function NavMain({
//   items,
// }: {
//   items: {
//     title: string
//     url: string
//     icon: LucideIcon
//     isActive?: boolean
//     items?: {
//       title: string
//       url: string
//     }[]
//   }[]
// }) {
//   return (
//     <SidebarGroup>
//       <SidebarGroupLabel>Platform</SidebarGroupLabel>
//       <SidebarMenu>
//         {items.map((item) => (
//           <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
//             <SidebarMenuItem>
//               <SidebarMenuButton asChild tooltip={item.title}>
//                 <a href={item.url}>
//                   <item.icon />
//                   <span>{item.title}</span>
//                 </a>
//               </SidebarMenuButton>
//               {item.items?.length ? (
//                 <>
//                   <CollapsibleTrigger asChild>
//                     <SidebarMenuAction className="data-[state=open]:rotate-90">
//                       <ChevronRight />
//                       <span className="sr-only">Toggle</span>
//                     </SidebarMenuAction>
//                   </CollapsibleTrigger>
//                   <CollapsibleContent>
//                     <SidebarMenuSub>
//                       {item.items?.map((subItem) => (
//                         <SidebarMenuSubItem key={subItem.title}>
//                           <SidebarMenuSubButton asChild>
//                             <a href={subItem.url}>
//                               <span>{subItem.title}</span>
//                             </a>
//                           </SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                       ))}
//                     </SidebarMenuSub>
//                   </CollapsibleContent>
//                 </>
//               ) : null}
//             </SidebarMenuItem>
//           </Collapsible>
//         ))}
//       </SidebarMenu>
//     </SidebarGroup>
//   )
// }
