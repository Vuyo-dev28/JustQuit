'use client';

import { BookHeart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function JournalPage() {
  const { toast } = useToast();

  const handleSaveEntry = () => {
    toast({
      title: 'Journal Entry Saved',
      description: 'Your thoughts have been recorded.',
    });
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold font-headline">Guided Journal</h1>
        <p className="text-muted-foreground">
          Reflect on your day with these helpful prompts.
        </p>
      </header>

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <CardHeader>
          <CardTitle>Today's Entry</CardTitle>
          <CardDescription>
            Take a few moments to reflect on your day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="grateful-input">What is one thing you're grateful for today?</Label>
            <Textarea
              id="grateful-input"
              placeholder="It can be something big or small..."
              rows={3}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="feeling-input">How are you feeling right now, and why?</Label>
            <Textarea
              id="feeling-input"
              placeholder="Describe your emotions..."
              rows={3}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="victory-input">What was a small victory you had today?</Label>
            <Textarea
              id="victory-input"
              placeholder="Did you resist a craving or accomplish a task?"
              rows={3}
            />
          </div>
          <Button onClick={handleSaveEntry}>
            <Plus className="mr-2" />
            Save Entry
          </Button>
        </CardContent>
      </Card>
      
      <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
        <h2 className="text-lg font-semibold">Past Entries</h2>
         <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center text-muted-foreground h-40">
             <BookHeart className="h-10 w-10 mb-2"/>
            <p>Your past journal entries will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
