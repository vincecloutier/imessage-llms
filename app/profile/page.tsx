import { AppHeader } from "@/components/custom/app-header";
import GenericForm, { PageSchema, FieldSchema } from "@/components/custom/generic-form";
import { saveProfile } from "@/lib/actions";

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
        {name: "location", label: "Location", type: "text", required: true, rowId: "location"},
        {name: "timezone", label: "Timezone", type: "enum", required: true, rowId: "timezone"}
      ]
    }
  ];

export const timezoneOptions = [
  { label: "America/New_York", value: "America/New_York" },
  { label: "America/Chicago", value: "America/Chicago" },
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
  { label: "America/Denver", value: "America/Denver" },
  
];

export default function UserProfilePage() {
  // Define form pages with fields

  // Example initial values
  const initialValues = {
    id: "user-123",
    attributes: {
      full_name: "John Doe",
      email: "john@example.com",
      theme: "Light",
      notifications: "Email"
    }
  };
  return (
    <>
      <AppHeader
        title={"Profile"}
        subtitle={"Personal Information"}
    />
    <div className="mx-16 ">
      <GenericForm
        startingValues={initialValues}
        pages={pages}
        saveAction={saveProfile}
        useTabs={false}
        />
      </div>
    </>
  );
}