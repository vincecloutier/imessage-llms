"use client"

import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

import { LogIn, UserRound } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { signIn } from "@/lib/supabase/client"

export function AppHeader({title, subtitle}: {title: string, subtitle: string})  {
    const pathname = usePathname();
    const router = useRouter();
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
            <div className="flex items-center gap-2">
            <SidebarTrigger/>   
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">{title}</BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{subtitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            </div>
            {pathname === "/" ? (<SignInDialog/>) : 
            (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push('/profile')}>
                    <UserRound className="size-4"/>
                </Button>
            )}
        </header>
    )
}

function SignInDialog() {
  const router = useRouter();
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
      
      if (rememberEmail) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      await signIn(email);
      setOpen(false);
      toast.success('Sign in link sent to email');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}> 
    <DialogTrigger asChild>
    <Button variant="ghost" size="icon" className="h-7 w-7">
        <LogIn className="size-4"/> 
    </Button>
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