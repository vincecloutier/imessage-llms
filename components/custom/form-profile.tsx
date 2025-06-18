'use client';

import { useState, useMemo } from "react"; 
import { useRouter } from "next/navigation";

import { saveProfile } from "@/lib/actions";
import { Profile, User } from "@/lib/types";
import { ChevronsUpDown } from "lucide-react";
import { signOut } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import GenericForm, { FieldSchema } from "@/components/custom/form-generic";

const profileFields: FieldSchema[] = [ 
    { name: 'name', label: 'Name*', rowId: 'a1', type: 'text' },
    { name: 'birthday', label: 'Birthday*', rowId: 'a2', type: 'calendar' },
    { name: 'location', label: 'Location*', rowId: 'a3', type: 'location' },
    { name: 'sender_address', label: 'iMessage Address (Optional)', description: 'The phone number or email address you use with iMessages.', rowId: 'a4', type: 'sender_address' },
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
          <div className="flex items-center gap-3 cursor-pointer hover:bg-muted px-4 h-12" onClick={() => setOpen(true)}>
            <Avatar className="size-8 rounded-lg bg-indigo-600 text-white overflow-hidden">
              <AvatarFallback className="rounded-lg bg-transparent">{profile.attributes?.name as string}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{profile.attributes?.name as string}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
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
  