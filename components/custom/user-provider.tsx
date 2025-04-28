'use client';
import { useRouter } from 'next/navigation';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';

import { getUser as fetchUser, signIn as supabaseSignIn, signOut as supabaseSignOut, anonymousSignIn as supabaseAnonSignIn, createClient } from '@/lib/supabase/client';

type UserContextType = {
  user: any | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  anonSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  anonSignIn: async () => {},
  signOut: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {fetchUser().then(setUser).finally(() => setLoading(false));}, []);

  // subscribe to token changes (cross-tab sync)
  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_evt: AuthChangeEvent, session: Session | null) => setUser(session?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  //  email OTP sign-in
  const handleSignIn = async (email: string) => {
    await supabaseSignIn(email);
  };

  // anonymous login
  const handleAnonSignIn = async () => {
    await supabaseAnonSignIn();
    const fresh = await fetchUser(); // grab the user object for UI
    setUser(fresh);
  };

  // global sign-out
  const handleSignOut = async () => {
    setLoading(true);
    await supabaseSignOut();
    setUser(null);
    router.push('/');
    setLoading(false);
  };

  return (
    <UserContext.Provider value={{user, loading, signIn: handleSignIn, anonSignIn: handleAnonSignIn, signOut: handleSignOut}}>
      {children}
    </UserContext.Provider>
  );
}

// single-line hook for consumers
export const useUser = () => useContext(UserContext);