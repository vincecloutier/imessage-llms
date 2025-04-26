import { AppHeader } from "@/components/custom/app-header";
import GenericForm, { PageSchema, FieldSchema } from "@/components/custom/generic-form";
import { saveProfile } from "@/lib/actions";
import { getUser, getProfile } from "@/lib/supabase/cached-queries";
import { notFound } from "next/navigation";

const pages: PageSchema[] = [
    {
      key: "personal",
      label: "Personal Information",
      description: "Your basic contact details",
      fields: [
        { name: "name", label: "Name", type: "text", description: "Your name will be used to identify you in the app.", required: true, rowId: "personal" },
        { name: "birthday", label: "Birthday", description: "Your date of birth will be used to calculate your age.", type: "calendar", required: false, rowId: "personal" },
        { name: "sender_address", label: "Phone Number", description: "The phone number that will be used to communicate with your personas.", type: "tel", required: false, rowId: "personal" }
      ]
    },
    {
      key: "location",
      label: "Location",
      description: "Your location will only be used to provide context to the personas. If you don't want to share your location, please select another city.",
      fields: [
        {name: "location", label: "Location", type: "city", required: true, rowId: "location"},
        // {name: "timezone", label: "Timezone", type: "enum", required: true, rowId: "timezone"}
      ]
    }
  ];

export const timezoneOptions = [
  { label: "America/New_York", value: "America/New_York" },
  { label: "America/Chicago", value: "America/Chicago" },
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
  { label: "America/Denver", value: "America/Denver" },
];
export default async function UserProfilePage() {
  const user = await getUser();

  if (!user) {
    return notFound();
  }
  
  let profile = await getProfile(user.id);

  if (!profile) {
    profile = {
      id: user.id,
      attributes: {
        name: null,
        birthday: null,
        location: null,
        timezone: null,
        latitude: null,
        longitude: null
      },
      sender_address: null
    };
  }
  
  return (
    <>
      <AppHeader
        title={"Profile"}
        subtitle={"Personal Information"}
    />
    <div className="mx-16 ">
      <GenericForm
        startingValues={profile}
        pages={pages}
        saveAction={saveProfile}
        useTabs={false}
        />
      </div>
    </>
  );
}