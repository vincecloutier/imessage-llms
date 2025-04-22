'use client';

import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';

import {
  UserRound,
  MoreHorizontal,
  Plus,
} from 'lucide-react';

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
import GenericForm, { GenericFormProps } from './generic-form';
import { savePersona, deletePersona } from '@/lib/actions';

// Type for a persona record from Supabase
// Adjust properties as needed; here we assume a persona has at least an id and a title

type persona = Database['public']['Tables']['personas']['Row'];

const attributesSchema: GenericFormProps['attributesSchema'] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'dob', label: 'Date of Birth', type: 'dob', required: true },
  { name: 'occupation', label: 'Occupation', type: 'text', required: true },
  { name: 'relationship', label: 'Relationship', type: 'enum', required: true, options: ['Friend', 'Girlfriend', 'Boyfriend', 'Wife', 'Husband', 'Colleague'] },
  { name: 'ethnicity', label: 'Ethnicity', type: 'enum', required: true, options: ['White', 'Black', 'Asian', 'Hispanic', 'Indian', 'Middle Eastern', 'Other'] },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'hair_length', label: 'Hair Length', type: 'enum', required: true, options: ['Bald', 'Short', 'Medium', 'Long'] },
  { name: 'hair_color', label: 'Hair Color', type: 'enum', required: true, options: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'] },
  { name: 'eye_color', label: 'Eye Color', type: 'enum', required: true, options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Other'] },
  { name: 'gender', label: 'Gender', type: 'enum', required: true, options: ['Male', 'Female', 'Other'] },
];

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
                  <span>{(() => {
                    const nameValue = persona.attributes && typeof persona.attributes === 'object' && (persona.attributes as Record<string, unknown>).name;
                    return (typeof nameValue === 'string' && nameValue) || 'New Persona';
                  })()}</span>
                </Link>
              </SidebarMenuButton>
              <GenericForm
                startingValues={{
                  id: persona.id,
                  attributes: (persona.attributes ?? {}) as Record<string, any>,
                  sender_address: persona.sender_address,
                }}
                trigger={
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                }
                attributesSchema={attributesSchema}
                entityLabel="Persona"
                saveAction={savePersona}
                destructiveAction={async (id?: string) => {
                  if (!id) {
                    console.error("Delete action called without an ID.");
                    return { success: false }; // Indicate failure
                  }
                  return deletePersona(id);
                }}
              />
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <GenericForm
              trigger={
                <SidebarMenuButton>
                  <Plus />
                  <span>Create New Persona</span>
                </SidebarMenuButton>
              }
              attributesSchema={attributesSchema}
              entityLabel="Persona"
              saveAction={savePersona}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}