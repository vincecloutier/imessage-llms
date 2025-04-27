'use client';

import { useEffect, useState } from 'react';
import { Chat as PreviewChat } from '@/components/custom/chat-main';
import { anonymousSignIn } from '@/lib/supabase/auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    anonymousSignIn()
      .then((session) => {
        if (isMounted) {
          setUserId(session.user?.id || null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Anonymous sign-in failed:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) return null;

  return (
    <PreviewChat
      user_id={userId}
      persona_id={null}
      persona_name={null}
      initialMessages={[]}
    />
  );
}