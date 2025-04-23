import GenericForm, { PageSchema, FieldSchema } from "@/components/custom/generic-form";


export default function UserProfilePage() {
  // Define form pages with fields
  const pages: PageSchema[] = [
    {
      key: "personal",
      label: "Personal Information",
      description: "Your basic contact details",
      fields: [
        {
          name: "full_name",
          label: "Full Name",
          type: "text",
          required: true,
        },
        {
          name: "email",
          label: "Email Address",
          description: "We'll never share your email with anyone",
          type: "email",
          required: true,
        },
        {
          name: "phone",
          label: "Phone Number",
          type: "tel",
          required: false,
        },
        {
          name: "birth_date",
          label: "Date of Birth",
          type: "calendar",
          required: false,
        }
      ]
    },
    {
      key: "preferences",
      label: "Preferences",
      description: "Customize your experience",
      fields: [
        {
          name: "theme",
          label: "Theme",
          type: "enum",
          required: true,
          options: ["Light", "Dark", "System"]
        },
        {
          name: "notifications",
          label: "Notification Preference",
          type: "enum",
          required: true,
          options: ["Email", "SMS", "Both", "None"]
        }
      ]
    }
  ];

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

  // Save handler function
  const handleSave = async (payload: any) => {
    console.log("Saving user profile:", payload);
    // In a real app, you would call an API here
    return await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };

  return (
    <div className="container mx-auto py-8">
      <GenericForm
        startingValues={initialValues}
        pages={pages}
        saveAction={handleSave}
      />
    </div>
  );
}