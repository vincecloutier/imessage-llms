import { notFound } from 'next/navigation';

import { getPersonaById, getUser } from '@/lib/supabase/cached-queries';
import { AppHeader } from '@/components/custom/app-header';
import GenericForm, { GenericFormProps } from '@/components/custom/generic-form';
import { savePersona } from '@/lib/actions';

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
  
export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const { id } = params;

  const persona = await getPersonaById(id);

  if (!persona) {
    notFound();
  }

  const user = await getUser();

  if (!user) {
    return notFound();
  }

  if (user.id !== persona.user_id) {
    return notFound();
  }

  return (
    <>
      <AppHeader
        title={persona.attributes.name}
        subtitle={persona.attributes.occupation}
      />
      <GenericForm
        attributesSchema={attributesSchema}
        entityLabel="Persona"
        saveAction={savePersona}
        onSaveSuccess={() => {}}
      />
    </>
  );
}
