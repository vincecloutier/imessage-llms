import { notFound } from 'next/navigation';

import { getPersonaById, getUser } from '@/lib/supabase/cached-queries';
import { AppHeader } from '@/components/custom/app-header';
import GenericForm, { GenericFormProps } from '@/components/custom/generic-form';
import { saveProfile } from '@/lib/actions';

const attributesSchema: GenericFormProps['attributesSchema'] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'text', required: true },
];  

export default async function Page() {
  const user = await getUser();

  if (!user) {
    notFound();
  }


  return (
    <>  
      <AppHeader
        title="Profile"
        subtitle="user.email"
      />
      <GenericForm
        attributesSchema={attributesSchema}
        entityLabel="Profile"
        saveAction={saveProfile}
        onSaveSuccess={() => {}}
      />
    </>
  );
}