'use client';
import { Persona } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { deletePersona, savePersona } from '@/lib/actions';
import GenericForm, { FieldSchema } from './generic-form';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { UserRound, MoreHorizontal, Plus } from 'lucide-react';

import { SidebarGroup, SidebarGroupAction, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';

import { createClient } from '@/lib/supabase/client';

const personaFields: FieldSchema[] = [
  { name: 'name', label: 'Name', description: 'The name of the persona', rowId: 'a1', type: 'text', required: true },
  { name: 'birthday', label: 'Birthday', description: 'The birthday of the persona', rowId: 'a1', type: 'calendar', required: true },
  { name: 'occupation', label: 'Occupation', description: 'What do they do for a living?', rowId: 'a2', type: 'text', required: true },
  { name: 'relationship', label: 'Relationship', description: 'Who are they to you?', rowId: 'a2', type: 'enum', required: true, options: ['Friend', 'Girlfriend', 'Boyfriend', 'Wife', 'Husband', 'Colleague'] },
  { name: 'location', label: 'Location', description: 'Where do they live?', rowId: 'a2', type: 'text', required: true },
  { name: 'ethnicity', label: 'Ethnicity', description: 'The ethnicity of the persona', rowId: 'b1', type: 'enum', required: true, options: ['White', 'Black', 'Asian', 'Hispanic', 'Indian', 'Middle Eastern', 'Other'] },
  { name: 'hair_length', label: 'Hair Length', description: 'What length is their hair?', rowId: 'b1', type: 'enum', required: true, options: ['Bald', 'Short', 'Medium', 'Long'] },
  { name: 'hair_color', label: 'Hair Color', description: 'What color is their hair?', rowId: 'b1', type: 'enum', required: true, options: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'] },
  { name: 'eye_color', label: 'Eye Color', description: 'What color are their eyes?', rowId: 'b2', type: 'enum', required: true, options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Other'] },
  { name: 'gender', label: 'Gender', description: 'What gender is this persona?', rowId: 'b2', type: 'enum', required: true, options: ['Male', 'Female', 'Other'] },
];

const fetcher = async (): Promise<{ personas: Persona[], isAuthenticated: boolean }> => {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user || user.is_anonymous) {
    return { personas: [], isAuthenticated: false };
  }

  const { data: personas, error: personasError } = await supabase.from('personas').select('*').eq('user_id', user.id);
  if (personasError) {
    console.error('Personas Sidebar Fetch Error:', personasError);
    return { personas: [], isAuthenticated: true }; // Still authenticated, but fetch failed
  }
  return { personas: personas || [], isAuthenticated: true };
};

export function NavPersonas() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, error, mutate } = useSWR('personas', fetcher);
  
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);

  const isAuthenticated = data?.isAuthenticated ?? false;
  const history = data?.personas ?? [];

  useEffect(() => {
    if (editingPersonaId === 'new') {
      setEditingPersonaId('new');
    }
  }, [editingPersonaId]);

  useEffect(() => { mutate(); }, [pathname, mutate]);

  useEffect(() => {
    if (!isAuthenticated) {
      setEditingPersonaId(null);
    }
  }, [isAuthenticated]);

  const newPersonaDefaults = useMemo(() => ({
    attributes: { name: 'New Persona' },
    sender_address: null,
  }), []);

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Personas</SidebarGroupLabel>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Loading...</div>
      </SidebarGroup>
    );
  }

  if (!isAuthenticated) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Personas</SidebarGroupLabel>
            <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Login to save and edit your personas!</div>
      </SidebarGroup>
    );
  }

  const handlePersonaDelete = (deletedId: string) => {
    setEditingPersonaId(null);
    mutate();
    if (pathname.includes(`/chat/${deletedId}`)) {
        const remainingPersonas = history.filter(p => p.id !== deletedId);
        router.push(remainingPersonas.length > 0 ? `/chat/${remainingPersonas[0].id}` : '/');
        router.refresh();
    }
  };

  const handleNewPersonaOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEditingPersonaId(null);
    }
  };

  const handleSaveNewPersona = async (payload: any) => {
    const result = await savePersona(payload);
    toast.success("Persona created!");
    setEditingPersonaId(null);
    mutate();
    router.push(`/chat/${result.data.id}`);
    router.refresh();
    return result;
  };

  return (  
    <>
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
    <SidebarGroupLabel>Personas</SidebarGroupLabel>
    <SidebarGroupAction onClick={() => {setEditingPersonaId('new');}}>
        <Plus /> <span className="sr-only">Add Persona</span>
    </SidebarGroupAction>
        <SidebarMenu>
          {history.map((persona) => {
            const nameValue = persona.attributes && typeof persona.attributes === 'object' && (persona.attributes as Record<string, unknown>).name;
            const displayName = (typeof nameValue === 'string' && nameValue) || 'Unnamed Persona';
            return (
              <SidebarMenuItem key={persona.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/chat/${persona.id}`} onClick={() => setOpenMobile(false)}>
                    <UserRound />
                    <span>{displayName}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuAction onClick={() => setEditingPersonaId(persona.id)}>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>

                <GenericForm
                  formTitle="Edit Persona"
                  formDescription="Update the details for this persona."
                  fields={personaFields}
                  startingValues={persona}
                  saveAction={async (payload) => {
                      const result = await savePersona(payload);
                      if (result.success) {
                          mutate();
                          toast.success("Persona updated!");
                          setEditingPersonaId(null);
                      } else {
                          toast.error(result.error || "Failed to update persona.");
                      }
                      return result;
                  }}
                  destructiveButton={<PersonaDestructiveButton personaId={persona.id} onDelete={() => handlePersonaDelete(persona.id)} />}
                  open={editingPersonaId === persona.id}
                  onOpenChange={(isOpen) => {
                    if (!isOpen && editingPersonaId === persona.id) {
                      setEditingPersonaId(null);
                    }
                  }}
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      <GenericForm
        formTitle="Create New Persona"
        formDescription="Define the details for a new persona."
        fields={personaFields}
        startingValues={newPersonaDefaults}
        saveAction={handleSaveNewPersona}
        open={editingPersonaId === 'new'}
        onOpenChange={handleNewPersonaOpenChange}
      />
    </>
  );
}


export function PersonaDestructiveButton({ personaId, onDelete }: { personaId: string, onDelete: () => void }) {
    const [isOpen, setIsOpen] = useState(false);

    async function handleDelete() {
        setIsOpen(false);
        toast.info("Deleting persona...");
        await deletePersona(personaId);
        toast.success("Persona deleted.");
        onDelete();
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive"> Delete Persona </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription> This action cannot be undone. This will permanently delete this persona from our servers. </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
