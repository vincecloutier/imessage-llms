"use client"

import { toast } from "sonner"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"

import React from "react"
import { Input } from "@/components/ui/input"
import { signIn, verifyOTP } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Persona, Profile } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileForm } from "@/components/custom/profile-form";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { useRouter } from "next/navigation";
export function AppHeader({user, persona, profile}: {user: User, persona: Persona, profile: Profile | null}) {
  // const { theme, setTheme } = useTheme()
  return (
    // if you do absolute, the header will allow the chat to scroll behind it
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
          {/* <Button variant="ghost" className="size-7" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun size={4} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon size={4} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
          </Button>
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" /> */}
          {user.is_anonymous && <SignInDialog/>}
          {!user.is_anonymous && <ProfileForm user={user} profile={profile}/>}
        </div>
    </header>
  );
}

export function SignInDialog() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [open, setOpen] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email') as string;
      if (rememberEmail) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');
      await signIn(email);
      setShowOTP(true);
      toast.success('OTP sent successfully.', {description: `Please check your email for the verification code.`});
    } catch (error: any) {
      toast.error("OTP could not be sent.", {description: `${error.message}${error.message.endsWith('.') ? '' : '.'}`});
    }
  }

  async function handleOTPSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await verifyOTP(email, otp);
      setOpen(false);
      toast.success('Successfully signed in!');
      router.push('/chat/0');
      router.refresh();
    } catch (error: any) {
      toast.error("Invalid OTP.", {description: `${error.message}.`});
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
          <DialogDescription>
            {showOTP ? "Enter the verification code sent to your email." : "Enter your email below to receive a verification code."}
          </DialogDescription>
        </DialogHeader>
        {!showOTP ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" required type="email"/>
            <DialogFooter>
              <div className="flex justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberEmail} onCheckedChange={(checked) => setRememberEmail(checked === true)}/>
                  <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Remember Me?
                  </label>
                </div>
                <Button type="submit">Send Code</Button>
              </div>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)} containerClassName="gap-2">
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter>
              <div className="flex justify-between w-full">
                <Button type="button" variant="ghost" onClick={() => setShowOTP(false)}>Back</Button>
                <Button type="submit">Verify</Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}