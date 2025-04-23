import { notFound } from 'next/navigation';

import { getPersonaById, getUser } from '@/lib/supabase/cached-queries';
import { AppHeader } from '@/components/custom/app-header';
import GenericForm, { GenericFormProps, PageSchema } from '@/components/custom/generic-form';
import { savePersona } from '@/lib/actions';

const pages: PageSchema[] = [
    {
      key: "attributes",
      label: "Attributes",
      fields: [
        { name: 'name', label: 'Name', description: 'The name of the persona', type: 'text', required: true },
        { name: 'occupation', label: 'Occupation', description: 'The occupation of the persona', type: 'text', required: true },
        { name: 'relationship', label: 'Relationship', description: 'The relationship of the persona', type: 'enum', required: true, options: ['Friend', 'Girlfriend', 'Boyfriend', 'Wife', 'Husband', 'Colleague'] },
        { name: 'ethnicity', label: 'Ethnicity', description: 'The ethnicity of the persona', type: 'enum', required: true, options: ['White', 'Black', 'Asian', 'Hispanic', 'Indian', 'Middle Eastern', 'Other'] },
        { name: 'location', label: 'Location', description: 'The location of the persona', type: 'text', required: true },
        { name: 'hair_length', label: 'Hair Length', description: 'The hair length of the persona', type: 'enum', required: true, options: ['Bald', 'Short', 'Medium', 'Long'] },
        { name: 'hair_color', label: 'Hair Color', type: 'enum', required: true, options: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'] },
        { name: 'eye_color', label: 'Eye Color', type: 'enum', required: true, options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Other'] },
        { name: 'gender', label: 'Gender', type: 'enum', required: true, options: ['Male', 'Female', 'Other'] },
      ],
    },
    {
      key: "background",
      label: "Background",
      fields: [
        { name: 'background', label: 'Background', type: 'text', required: true },
      ],
    },
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
        title={"Configure"}
        subtitle={persona.attributes.name}
      />
      <GenericForm
        startingValues={{
          id: persona.id,
          attributes: persona.attributes,
          sender_address: persona.sender_address,
        }}
        pages={pages}
        saveAction={savePersona}
      />
    </>
  );
}
