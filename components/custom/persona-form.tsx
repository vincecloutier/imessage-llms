'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';

import { Persona } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { deletePersona, savePersona } from '@/lib/actions';
import GenericForm, { FieldSchema } from '@/components/custom/generic-form';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

const personaFields: FieldSchema[] = [
  { name: 'name', label: 'Name', description: 'What is their name?', rowId: 'a', type: 'text' },
  { name: 'occupation', label: 'Occupation', description: 'What do they do for a living?', rowId: 'a', type: 'text' },
  { name: 'birthday', label: 'Birthday', description: 'What is their birthday?', rowId: 'b', type: 'calendar' },
  { name: 'location', label: 'Location', description: 'Where do they live?', rowId: 'b', type: 'text' },
  { name: 'relationship', label: 'Relationship', description: 'Who are they to you?', rowId: 'b', type: 'enum', options: ['Friend', 'Girlfriend', 'Boyfriend', 'Wife', 'Husband', 'Colleague'] },
  { name: 'ethnicity', label: 'Ethnicity', description: 'What is their ethnicity?', rowId: 'c', type: 'enum', options: ['Caucasian', 'African American', 'Asian', 'Hispanic', 'Indian', 'Middle Eastern', 'Native American', 'Other'] },
  { name: 'gender', label: 'Gender', description: 'What is their gender?', rowId: 'c', type: 'enum', options: ['Male', 'Female', 'Other'] },
  { name: 'hair_length', label: 'Hair Length', description: 'What length is their hair?', rowId: 'd', type: 'enum', options: ['Bald', 'Short', 'Medium', 'Long'] },
  { name: 'hair_color', label: 'Hair Color', description: 'What color is their hair?', rowId: 'd', type: 'enum', options: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'] },
  { name: 'eye_color', label: 'Eye Color', description: 'What color are their eyes?', rowId: 'd', type: 'enum', options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Other'] },
  { name: 'messaging_platform', label: 'Messaging Platforms', description: 'What platforms can they use to message you?', rowId: 'e', type: 'messaging_platform' },
];


const commonStyles = {
  sidebarWidth: "w-[calc(var(--sidebar-width-icon)+1px)]!",
  menuButton: "px-2.5 md:px-2",
  mailItem: "hover:bg-sidebar-accent cursor-pointer hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap",
  mailTeaser: "line-clamp-2 w-[260px] text-xs whitespace-break-spaces"
}

export function PersonaForm({persona, showButton = true, freshProfile = false}: {persona: Persona | null, showButton?: boolean, freshProfile?: boolean}) {
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const handlePersonaOpenChange = (isOpen: boolean) => {if (!isOpen) setEditingPersonaId(null)};
  if (persona) {
    return (
      <>
        <div className={commonStyles.mailItem} onClick={() => setEditingPersonaId(persona.id)}>
            <div className="flex w-full items-center gap-2">
              <span>{(persona.attributes.name || 'Unnamed Persona').toString()}</span>{" "}
              <span className="ml-auto text-xs text-underline"> <MoreHorizontal className="w-4 h-4" /> </span>
          </div>
        </div>
        <GenericForm
          formTitle="Edit Contact"
          formDescription="Update the details for this contact."
          fields={personaFields}
          startingValues={persona}
          saveAction={savePersona}
          open={editingPersonaId === persona.id}
          onOpenChange={handlePersonaOpenChange}
          destructiveButton={<PersonaDestructiveButton personaId={persona.id} setEditingPersonaId={setEditingPersonaId} />}
        />
      </>
    )
  } else {  
    return (
      <>
        {showButton && (
          <Label onClick={() => {setEditingPersonaId('new'); }} className="cursor-pointer">
            <span>Add Contact</span>
            <Plus className="w-4 h-4" />
          </Label>
        )}
        <GenericForm
          formTitle="Add New Contact"
          formDescription="Define the details for a new contact."
          fields={personaFields}
          startingValues={{attributes: {}, is_imessage_persona: freshProfile, is_telegram_persona: freshProfile}}
          saveAction={savePersona}
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
                <Button variant="destructive"> Delete </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription> This cannot be undone. This will permanently delete this persona and all associated messages, memories and images from our servers. </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleDelete}> Delete </AlertDialogAction>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
