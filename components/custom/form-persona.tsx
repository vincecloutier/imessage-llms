'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';

import { Persona } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { deletePersona, savePersona } from '@/lib/actions';
import GenericForm, { FieldSchema } from '@/components/custom/form-generic';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

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

// helper function to generate a color from a string (personaId)
// 6 default colors
const defaultColors = [
  ['#FF5733', '#FF33A1'], // Red and Pink
  ['#33FF57', '#00FF00'], // Green and Lime
  ['#3357FF', '#0000FF'], // Blue and Green
  ['#FF33A1', '#FF5733'], // Pink and Red
  ['#FFD700', '#3357FF'], // Gold and Blue
  ['#00FF00', '#33FF57'], // Lime and Green
  ['#FF5733', '#FF33A1'], // Red and Pink
];
const generateGradientFromId = (id: string): string => {
  const colorIndex = Math.abs(parseInt(id.slice(-1)) % defaultColors.length);
  return `linear-gradient(135deg, ${defaultColors[colorIndex]} 0%, ${defaultColors[(colorIndex + 1) % defaultColors.length]} 100%)`;
};

interface PersonaAvatarProps {
  personaId: string;
  personaName?: string | null; // Optional: to display the first letter
  onClick?: () => void;
}

const PersonaAvatar: React.FC<PersonaAvatarProps> = ({ personaId, personaName, onClick }) => {
  const backgroundColor = generateGradientFromId(personaId);
  const parts = personaName?.split(' ');
  const initials = parts && parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : '?';
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      style={{
        background: backgroundColor,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '12px',
        cursor: 'pointer',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? 'Edit' : initials}
    </div>
  );
};

export function PersonaForm({persona, showButton = true, freshProfile = false}: {persona: Persona | null, showButton?: boolean, freshProfile?: boolean}) {
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const handlePersonaOpenChange = (isOpen: boolean) => {if (!isOpen) setEditingPersonaId(null)};
  if (persona) {
    return (
      <>
        <PersonaAvatar personaId={persona.id} personaName={persona.attributes.name as string} onClick={() => setEditingPersonaId(persona.id)} />
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
