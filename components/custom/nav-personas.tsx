'use client';
import { Persona } from '@/lib/types';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';

import {
  UserRound,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { deletePersona } from '@/lib/actions';

const fetcher = async (): Promise<Persona[]> => {
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

export function SidebarHistory({ user }: { user: User | null }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { data: history, isLoading, mutate } = useSWR<Persona[]>(user ? ['personas', user.id] : null, fetcher);

  useEffect(() => {mutate();}, [pathname, mutate]); 

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Personas</SidebarGroupLabel>
            <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Login to save and edit your personas!</div>
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
    <SidebarGroupAction onClick={() => {router.push('/persona/new'); setOpenMobile(false);}}>
        <Plus /> <span className="sr-only">Add Persona</span>
    </SidebarGroupAction>
        <SidebarMenu>
          {history?.map((persona) => (
            <SidebarMenuItem key={persona.id}>
              <SidebarMenuButton asChild>
                <Link href={`/chat/${persona.id}`} onClick={() => setOpenMobile(false)}>
                  <UserRound />
                  <span>{(() => {
                    const nameValue = persona.attributes && typeof persona.attributes === 'object' && (persona.attributes as Record<string, unknown>).name;
                    return (typeof nameValue === 'string' && nameValue) || 'New Persona';
                  })()}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-lg" side="right" align="center">
                <DropdownMenuItem onClick={() => {router.push(`/persona/${persona.id}`); setOpenMobile(false);}}>
                  <Pencil className="text-muted-foreground" />
                  <span>Edit Persona</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete Persona</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this persona from our servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={async () => {await deletePersona(persona.id);}}> Continue </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}