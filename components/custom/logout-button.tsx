'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user || null);
    };

    getUser();
  }, []);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return user ? (
    <button onClick={logout} className="text-sm text-red-600 hover:underline">
      Logout
    </button>
  ) : (
    <a href="/login" className="text-sm text-blue-600 hover:underline">
      Login
    </a>
  );
}