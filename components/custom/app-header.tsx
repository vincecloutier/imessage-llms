"use client"

import { toast } from "sonner"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { signIn, signOut } from "@/lib/supabase/client";
import { UserRound } from "lucide-react";
import GenericForm, { FieldSchema } from "@/components/custom/generic-form";
import { saveProfile } from "@/lib/actions"
import { Profile } from "@/lib/types";
import { User } from "@supabase/supabase-js";

const profileFields: FieldSchema[] = [ 
  { name: 'name', label: 'Name', rowId: 'a1', type: 'text', required: true },
  { name: 'birthday', label: 'Birthday', rowId: 'a2', type: 'calendar', required: true },
  { name: 'telephone', label: 'Telephone', rowId: 'a3', type: 'tel', required: true },
  { name: 'location', label: 'Location', rowId: 'a4', type: 'city', required: true },
]

export function AppHeader({personaName, user, profile}: {personaName: string, user: User, profile: Profile | null}) {
  return (
    <header className="relative top-0 left-0 right-0 flex h-16 shrink-0 items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
        <SidebarTrigger/>
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">Chat</BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                    <BreadcrumbPage>{personaName}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        </div>
        <div>
          {user.is_anonymous && <SignInDialog/>}
          {!user.is_anonymous && <UserProfile user={user} profile={profile}/>}
        </div>
    </header>
  );
}

export function SignInDialog() {
  const [email, setEmail] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email') as string;
      if (rememberEmail) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');
      await signIn(email);
      setOpen(false);
      toast.success('Sign in link sent to email');
    } catch (error: any) {
      toast.error(error.message);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}> 
    <DialogTrigger asChild>
        <Button className="h-7">Connect</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Connect</DialogTitle>
        <DialogDescription>Enter your email below to receive a sign in link.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" required type="email"/>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" checked={rememberEmail} onCheckedChange={(checked) => setRememberEmail(checked === true)}/>
              <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Remember Me?</label>
            </div>
            <Button type="submit">Receive Link</Button>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
    </Dialog>
  )
}

export function UserProfile({user, profile}: {user: User, profile: Profile | null}) {
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

  const defaultValues = useMemo(() => (profile || { id: user?.id, attributes: {}, sender_address: "" }
  ), [profile, user]);

  return (
    <>
      <Button variant="ghost" className="h-7 w-7" onClick={() => setOpen(true)}><UserRound size={4}/></Button>
      <GenericForm
        formTitle={"User Profile"}
        formDescription="Update the details of your profile to ensure your personas are personalized to you."
        fields={profileFields}
        startingValues={defaultValues}
        saveAction={handleSaveProfile}
        open={open}
        onOpenChange={setOpen}
        destructiveButton={<Button variant="outline" onClick={handleSignOut}>Sign Out</Button>}
        forceAnswer={!profile}
      />
    </>
  )
}
