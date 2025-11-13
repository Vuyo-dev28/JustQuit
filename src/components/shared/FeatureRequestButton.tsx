
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { Lightbulb } from 'lucide-react';

export default function FeatureRequestButton() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [featureRequest, setFeatureRequest] = useState('');
  const [isSavingRequest, setIsSavingRequest] = useState(false);

  const handleSaveFeatureRequest = async () => {
    if (!featureRequest.trim()) {
      toast({
        variant: 'destructive',
        title: 'Feature request is empty',
        description: 'Please write something before submitting.',
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'No active session',
        description: 'Please sign in again to submit a request.',
      });
      return;
    }

    setIsSavingRequest(true);

    const { error } = await supabase.from('feature_requests').insert({
      user_id: user.id,
      request: featureRequest.trim(),
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error.message,
      });
    } else {
      setFeatureRequest('');
      setOpen(false);
      toast({
        title: 'Request Sent!',
        description: 'Thank you for your feedback.',
      });
    }

    setIsSavingRequest(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-28 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <Lightbulb className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Feature</DialogTitle>
          <DialogDescription>
            Have an idea to make JustQuit better? Let us know!
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="I think it would be great if..."
          value={featureRequest}
          onChange={(e) => setFeatureRequest(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <Button onClick={handleSaveFeatureRequest} disabled={isSavingRequest}>
            {isSavingRequest ? 'Sending...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
