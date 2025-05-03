'use client';
import { Persona } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deletePersona, savePersona } from '@/lib/actions';
import GenericForm, { FieldSchema } from './generic-form';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { MoreHorizontal, Plus } from 'lucide-react';

import { SidebarGroupAction, SidebarMenuAction } from '@/components/ui/sidebar';


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

export function PersonaForm({persona, freshProfile = false}: {persona: Persona | null, freshProfile?: boolean}) {
  const router = useRouter();
  
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);

  const handlePersonaDelete = () => {
    setEditingPersonaId(null);
    router.push('/chat/0');
    router.refresh();
  };

  const handleNewPersonaOpenChange = (isOpen: boolean) => {
    if (!isOpen) setEditingPersonaId(null);
  };

  const handleSaveNewPersona = async (payload: any) => {
    const result = await savePersona(payload);
    setEditingPersonaId(null);
    router.push('/chat/0');
    router.refresh();
    return result;
  };

  if (persona) {
    return (  
      <>
        <SidebarMenuAction onClick={() => setEditingPersonaId(persona.id)}>
            <MoreHorizontal />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
            <GenericForm
            formTitle="Edit Persona"
            formDescription="Update the details for this persona."
            fields={personaFields}
            startingValues={persona}
            saveAction={handleSaveNewPersona}
            open={editingPersonaId === persona.id}
            onOpenChange={handleNewPersonaOpenChange}
            destructiveButton={<PersonaDestructiveButton personaId={persona.id} onDelete={handlePersonaDelete} />}
          />
        </>
        )
  } else {  
    return (
      <>
        <SidebarGroupAction onClick={() => {setEditingPersonaId('new');}}>
          <Plus /> <span className="sr-only">Add Persona</span>
        </SidebarGroupAction>
        <GenericForm
          formTitle="Create New Persona"
          formDescription="Define the details for a new persona."
          fields={personaFields}
          startingValues={{attributes: { name: 'New Persona' }, sender_address: null}}
          saveAction={handleSaveNewPersona}
          open={editingPersonaId === 'new' || freshProfile}
          onOpenChange={handleNewPersonaOpenChange}
          forceAnswer={freshProfile}
        />
      </>
    )
  }
}


export function PersonaDestructiveButton({ personaId, onDelete }: { personaId: string, onDelete: () => void }) {
    const [isOpen, setIsOpen] = useState(false);

    async function handleDelete() {
        setIsOpen(false);
        await deletePersona(personaId);
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
