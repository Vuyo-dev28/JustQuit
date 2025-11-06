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
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-headline">My Journal</h1>
        <p className="text-muted-foreground">
          A private space for your thoughts and reflections.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
          <CardDescription>
            What's on your mind today?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Today I felt..."
            rows={8}
          />
          <Button onClick={handleSaveEntry}>
            <Plus className="mr-2" />
            Save Entry
          </Button>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
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
