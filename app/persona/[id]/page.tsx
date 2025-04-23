import { notFound } from 'next/navigation';

import { getPersonaById, getUser } from '@/lib/supabase/cached-queries';
import { AppHeader } from '@/components/custom/app-header';
import GenericForm, { GenericFormProps, PageSchema } from '@/components/custom/generic-form';
import { savePersona } from '@/lib/actions';

const pages: PageSchema[] = [
    {
      key: "attributes",
      label: "Attributes",
      description: "The attributes of this persona.",
      fields: [
        { name: 'name', label: 'Name', description: 'The name of the persona', rowId: 'a1', type: 'text', required: true },
        { name: 'birthday', label: 'Birthday', description: 'The birthday of the persona', rowId: 'a1', type: 'date', required: true },
        { name: 'occupation', label: 'Occupation', description: 'What does the persona do for a living?', rowId: 'a2', type: 'text', required: true },
        { name: 'relationship', label: 'Relationship', description: 'Who are they to you?', rowId: 'a2', type: 'enum', required: true, options: ['Friend', 'Girlfriend', 'Boyfriend', 'Wife', 'Husband', 'Colleague'] },
        { name: 'location', label: 'Location', description: 'Where do they live?', rowId: 'a2', type: 'text', required: true },
      ],
    },
    {
      key: "physical_traits",
      label: "Physical Traits",
      description: "The physical traits of this persona.",
      fields: [
        { name: 'ethnicity', label: 'Ethnicity', description: 'The ethnicity of the persona', rowId: 'b1', type: 'enum', required: true, options: ['White', 'Black', 'Asian', 'Hispanic', 'Indian', 'Middle Eastern', 'Other'] },
        { name: 'hair_length', label: 'Hair Length', description: 'What length is their hair?', rowId: 'b1', type: 'enum', required: true, options: ['Bald', 'Short', 'Medium', 'Long'] },
        { name: 'hair_color', label: 'Hair Color', description: 'What color is their hair?', rowId: 'b1', type: 'enum', required: true, options: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'] },
        { name: 'eye_color', label: 'Eye Color', description: 'What color are their eyes?', rowId: 'b2', type: 'enum', required: true, options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Other'] },
        { name: 'gender', label: 'Gender', description: 'What gender is this persona?', rowId: 'b2', type: 'enum', required: true, options: ['Male', 'Female', 'Other'] },
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
      <div className="mx-16">
      <GenericForm
        startingValues={{
          id: persona.id,
          attributes: persona.attributes,
          sender_address: persona.sender_address,
        }}
        pages={pages}
        saveAction={savePersona}
      />
      </div>
    </>
  );
}
