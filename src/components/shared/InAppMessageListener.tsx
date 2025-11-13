
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { InAppMessage } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function InAppMessageListener() {
  const [message, setMessage] = useState<InAppMessage | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('in_app_messages')
      .on<InAppMessage>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'in_app_messages' },
        (payload) => {
          console.log('New message received!', payload.new);
          setMessage(payload.new);
          setShowMessage(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!message) {
    return null;
  }

  return (
    <AlertDialog open={showMessage} onOpenChange={setShowMessage}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{message.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/90 py-4">
            {message.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowMessage(false)}>
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
