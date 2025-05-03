'use client';
import { Persona } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deletePersona, savePersona } from '@/lib/actions';
import GenericForm, { FieldSchema } from './generic-form';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { MoreHorizontal, Plus, Trash2 } from 'lucide-react';

import { SidebarGroupAction, SidebarMenuAction } from '@/components/ui/sidebar';


const personaFields: FieldSchema[] = [
  { name: 'name', label: 'Name', description: 'What is their name?', rowId: 'a1', type: 'text' },
  { name: 'occupation', label: 'Occupation', description: 'What do they do for a living?', rowId: 'a1', type: 'text' },
  { name: 'birthday', label: 'Birthday', description: 'What is their birthday?', rowId: 'a2', type: 'calendar' },
  { name: 'location', label: 'Location', description: 'Where do they live?', rowId: 'a2', type: 'text' },
  { name: 'relationship', label: 'Relationship', description: 'Who are they to you?', rowId: 'a2', type: 'enum', options: ['Friend', 'Girlfriend', 'Boyfriend', 'Wife', 'Husband', 'Colleague'] },
  { name: 'ethnicity', label: 'Ethnicity', description: 'What is their ethnicity?', rowId: 'b1', type: 'enum', options: ['Caucasian', 'African American', 'Asian', 'Hispanic', 'Indian', 'Middle Eastern', 'Native American', 'Other'] },
  { name: 'gender', label: 'Gender', description: 'What is their gender?', rowId: 'b1', type: 'enum', options: ['Male', 'Female', 'Other'] },
  { name: 'hair_length', label: 'Hair Length', description: 'What length is their hair?', rowId: 'b2', type: 'enum', options: ['Bald', 'Short', 'Medium', 'Long'] },
  { name: 'hair_color', label: 'Hair Color', description: 'What color is their hair?', rowId: 'b2', type: 'enum', options: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'] },
  { name: 'eye_color', label: 'Eye Color', description: 'What color are their eyes?', rowId: 'b2', type: 'enum', options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Other'] },
];

export function PersonaForm({persona, freshProfile = false}: {persona: Persona | null, freshProfile?: boolean}) {
  
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const router = useRouter();

  const handlePersonaOpenChange = (isOpen: boolean) => {if (!isOpen) setEditingPersonaId(null);};

  const handleSavePersona = async (payload: any) => {
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
            saveAction={handleSavePersona}
            open={editingPersonaId === persona.id}
            onOpenChange={handlePersonaOpenChange}
            destructiveButton={<PersonaDestructiveButton personaId={persona.id} setEditingPersonaId={setEditingPersonaId} />}
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
          startingValues={{attributes: {  }, sender_address: null}}
          saveAction={handleSavePersona}
          open={editingPersonaId === 'new' || freshProfile}
          onOpenChange={handlePersonaOpenChange}
          forceAnswer={freshProfile}
        />
      </>
    )
  }
}


export function PersonaDestructiveButton({ personaId, setEditingPersonaId }: { personaId: string, setEditingPersonaId: (id: string | null) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    async function handleDelete() {
        setIsOpen(false);
        await deletePersona(personaId);
        setEditingPersonaId(null);
        router.push('/chat/0');
        router.refresh();    
    }
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline"> <Trash2 /> Delete </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription> This cannot be undone. This will permanently delete this persona and all associated messages, memories and images from our servers. </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}> <Trash2 /> Delete </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
