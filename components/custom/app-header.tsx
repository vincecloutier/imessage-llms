"use client"

import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Persona, Profile } from "@/lib/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { signIn, verifyOTP } from "@/lib/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Credenza, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@/components/ui/credenza"

export function AppHeader({user, persona, profile}: {user: User, persona: Persona, profile: Profile | null}) {
  return (
    <header className="bg-transparent fixed top-0 w-full z-50 flex shrink-0 items-center gap-2 px-4 py-2 justify-between">
        <div className="md:hidden flex items-center gap-2">
            <SidebarTrigger/>
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
      setShowOTP(true);
      await signIn(email);
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
    <Credenza open={open} onOpenChange={setOpen}> 
      <CredenzaTrigger asChild> 
        <Button className="h-7">Connect</Button>
      </CredenzaTrigger>
      <CredenzaContent className="sm:max-w-[425px]">
        <CredenzaHeader>
          <CredenzaTitle>Connect</CredenzaTitle>
          <CredenzaDescription>
            {showOTP ? "Enter the verification code sent to your email." : "Enter your email below to receive a verification code."}
          </CredenzaDescription>
        </CredenzaHeader>
        {!showOTP ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" required type="email"/>
            <CredenzaFooter>
              <div className="flex justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberEmail} onCheckedChange={(checked) => setRememberEmail(checked === true)}/>
                  <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Remember Me?
                  </label>
                </div>
                <Button type="submit">Send Code</Button>
              </div>
            </CredenzaFooter>
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
            <CredenzaFooter>
              <div className="flex justify-between w-full">
                <Button type="button" variant="ghost" onClick={() => setShowOTP(false)}>Back</Button>
                <Button type="submit">Verify</Button>
              </div>
            </CredenzaFooter>
          </form>
        )}
      </CredenzaContent>
    </Credenza>
  );
}