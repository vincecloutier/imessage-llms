'use client';
import { User } from "@supabase/supabase-js";
import { FieldSchema } from "./generic-form";
import { useState, useMemo } from "react"; 
import { Profile } from "@/lib/types";
import { signOut } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import GenericForm from "./generic-form";
import { saveProfile } from "@/lib/actions";

const profileFields: FieldSchema[] = [ 
    { name: 'name', label: 'Name', rowId: 'a1', type: 'text' },
    { name: 'birthday', label: 'Birthday', rowId: 'a2', type: 'calendar' },
    { name: 'location', label: 'Location', rowId: 'a4', type: 'location' },
    { name: 'sender_address', label: 'iMessage Address', description: 'This phone number or email address you use for sending iMessages.', rowId: 'a3', type: 'text' },
  ]

export function ProfileForm({user, profile}: {user: User, profile: Profile | null}) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    async function handleSignOut() {
      await signOut();
      setOpen(false);
      router.push('/');
      router.refresh();
    }
  
    const defaultValues = useMemo(() => (profile || { id: user?.id, attributes: {}, sender_address: "" }), [profile, user]);
  
    return (
      <>
        {profile && (<Button variant="ghost" className="h-7 w-7" onClick={() => setOpen(true)}><UserRound size={4}/></Button>)}
        <GenericForm
          formTitle={"Profile"}
          formDescription="Your profile is used to personalize your personas."
          fields={profileFields}
          startingValues={defaultValues}
          saveAction={saveProfile}
          open={open || !profile}
          onOpenChange={setOpen}
          destructiveButton={<Button variant="outline" onClick={handleSignOut}>Sign Out</Button>}
          forceAnswer={!profile}
        />
      </>
    )
  }
  