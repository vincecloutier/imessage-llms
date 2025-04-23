"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}




// export function LoginDialog() {
//     const router = useRouter();
  
//     async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//       event.preventDefault();
  
//       try {
//         const formData = new FormData(event.currentTarget);
//         const email = formData.get('email') as string;
//         await signIn(email);
//         router.push('/');
//         router.refresh();
//       } catch (error: any) {
//         toast.error(error.message);
//       }
//     }
//     return (
//       <Dialog>
//         <DialogTrigger asChild>
//           <Button variant="outline">Login</Button>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Login</DialogTitle>
//             <DialogDescription>
//               Enter your email below to login to your account
//             </DialogDescription>
//           </DialogHeader>
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               name="email"
//               placeholder="m@example.com"
//               required
//               type="email"
//             />
//             <DialogFooter>
//               <Button type="submit">Login</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     );
//   }



// 'use client';

// import { useEffect, useState } from 'react';
// import { createClient } from '@/lib/supabase/client';
// import { useRouter } from 'next/navigation';
// import { User } from '@supabase/supabase-js';
// import { Button } from '@/components/ui/button';

// export default function AuthButton() {
//   const [user, setUser] = useState<User | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const getUser = async () => {
//       const supabase = createClient();
//       const { data: { user } } = await supabase.auth.getUser();
//       setUser(user || null);
//     };

//     getUser();
//   }, []);

//   const logout = async () => {
//     const supabase = createClient();
//     await supabase.auth.signOut();
//     router.refresh();
//   };

//   return user ? (
//     <Button onClick={logout} className="text-sm text-red-600 hover:underline">
//       Logout
//     </Button>
//   ) : (
//     <a href="/login" className="text-sm text-blue-600 hover:underline">
//       Login
//     </a>
//   );
// }