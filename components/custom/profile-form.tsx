'use client';

import { ChevronsUpDown, UserRound } from "lucide-react";
import { useState, useMemo } from "react"; 
import { useRouter } from "next/navigation";

import { saveProfile } from "@/lib/actions";
import { Profile, User } from "@/lib/types";
import { signOut } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import GenericForm, { FieldSchema } from "@/components/custom/generic-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileFields: FieldSchema[] = [ 
    { name: 'name', label: 'Name*', rowId: 'a1', type: 'text' },
    { name: 'birthday', label: 'Birthday*', rowId: 'a2', type: 'calendar' },
    { name: 'location', label: 'Location*', rowId: 'a3', type: 'location' },
    { name: 'sender_address', label: 'iMessage Address (Optional)', description: 'The phone number or email address you use with iMessages.', rowId: 'a4', type: 'text' },
    { name: 'telegram_username', label: 'Telegram Username (Optional)', description: 'The username you use with Telegram (without the @).', rowId: 'a5', type: 'text' },
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
        {profile && (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setOpen(true)}>
              <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={profile.attributes.avatar as string} alt={profile.attributes.name as string} />
              <AvatarFallback className="rounded-lg">{profile.attributes.name?.toString().charAt(0)|| '?'}</AvatarFallback>
            </Avatar>
          </div>
        )}
          
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
  