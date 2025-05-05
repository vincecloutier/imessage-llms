"use client"

import { toast } from "sonner"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"

import { Input } from "@/components/ui/input"
import { signIn } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Profile, Persona, User } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileForm } from "@/components/custom/profile-form";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function AppHeader({user, persona, profile}: {user: User, persona: Persona, profile: Profile | null}) {
  const { theme, setTheme } = useTheme()
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
                    <BreadcrumbPage>{(persona.attributes.name || 'April (Unsaved Persona)').toString()}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        </div>
        <div className="flex items-center gap-2"> 
        <Button variant="ghost" className="size-7" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun size={4} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon size={4} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
          {user.is_anonymous && <SignInDialog/>}
          {!user.is_anonymous && <ProfileForm user={user} profile={profile}/>}

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
        <Button className="h-7 ml-2">Connect</Button>
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