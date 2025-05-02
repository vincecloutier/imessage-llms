'use client';
import { User } from "@supabase/supabase-js";
import { FieldSchema } from "./generic-form";
import { useState, useMemo } from "react"; 
import { Profile } from "@/lib/types";
import { signOut } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import GenericForm from "./generic-form";
import { saveProfile } from "@/lib/actions";

const profileFields: FieldSchema[] = [ 
    { name: 'name', label: 'Name', rowId: 'a1', type: 'text', required: true },
    { name: 'birthday', label: 'Birthday', rowId: 'a2', type: 'calendar', required: true },
    { name: 'telephone', label: 'Telephone', rowId: 'a3', type: 'tel', required: true },
    { name: 'location', label: 'Location', rowId: 'a4', type: 'city', required: true },
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
  
    const handleSaveProfile = async (payload: any) => {
      const result = await saveProfile(payload);
      setOpen(false);
      if (result.success && result.data) {
        toast.success("Profile saved!");
      } else {
        toast.error(result.error || "Failed to save profile.");
      }
      return result;
    };
  
    const defaultValues = useMemo(() => (profile || { id: user?.id, attributes: {}, sender_address: "" }), [profile, user]);
  
    return (
      <>
        {profile && (
          <Button variant="ghost" className="h-7 w-7" onClick={() => setOpen(true)}><UserRound size={4}/></Button>
        )}
        <GenericForm
          formTitle={"User Profile"}
          formDescription="Update the details of your profile to ensure your personas are personalized to you."
          fields={profileFields}
          startingValues={defaultValues}
          saveAction={handleSaveProfile}
          open={open || !profile}
          onOpenChange={setOpen}
          destructiveButton={<Button variant="outline" onClick={handleSignOut}>Sign Out</Button>}
          forceAnswer={!profile}
        />
      </>
    )
  }
  