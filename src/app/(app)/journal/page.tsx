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
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { JournalEntry } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";

export default function JournalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [gratitude, setGratitude] = useState("");
  const [feeling, setFeeling] = useState("");
  const [victory, setVictory] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadEntries = useCallback(
    async (uid: string) => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, user_id, gratitude, feeling, victory, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Unable to load journal entries",
          description: error.message,
        });
        return;
      }

      setEntries((data ?? []) as JournalEntry[]);
    },
    [toast]
  );

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);
      await loadEntries(user.id);

      if (isMounted) {
        setIsLoading(false);
      }
    };

    void init();

    return () => {
      isMounted = false;
    };
  }, [loadEntries, router]);

  const handleSaveEntry = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "No active session",
        description: "Please sign in again to save your journal entry.",
      });
      return;
    }

    if (![gratitude, feeling, victory].some((value) => value.trim())) {
      toast({
        variant: "destructive",
        title: "Nothing to save",
        description: "Please write at least one reflection before saving.",
      });
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("journal_entries").insert({
      user_id: userId,
      gratitude: gratitude.trim() || null,
      feeling: feeling.trim() || null,
      victory: victory.trim() || null,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Unable to save entry",
        description: error.message,
      });
      setIsSaving(false);
      return;
    }

    toast({
      title: "Journal entry saved",
      description: "Your thoughts have been recorded.",
    });

    setGratitude("");
    setFeeling("");
    setVictory("");

    await loadEntries(userId);
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <span className="text-muted-foreground">Loading journal...</span>
      </div>
    );
  }

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
            <Label htmlFor="grateful-input">
              What is one thing you're grateful for today?
            </Label>
            <Textarea
              id="grateful-input"
              placeholder="It can be something big or small..."
              rows={3}
              value={gratitude}
              onChange={(event) => setGratitude(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feeling-input">
              How are you feeling right now, and why?
            </Label>
            <Textarea
              id="feeling-input"
              placeholder="Describe your emotions..."
              rows={3}
              value={feeling}
              onChange={(event) => setFeeling(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="victory-input">
              What was a small victory you had today?
            </Label>
            <Textarea
              id="victory-input"
              placeholder="Did you resist a craving or accomplish a task?"
              rows={3}
              value={victory}
              onChange={(event) => setVictory(event.target.value)}
            />
          </div>
          <Button onClick={handleSaveEntry} disabled={isSaving}>
            <Plus className="mr-2" />
            {isSaving ? "Saving..." : "Save Entry"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
        <h2 className="text-lg font-semibold">Past Entries</h2>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center text-muted-foreground h-40">
              <BookHeart className="h-10 w-10 mb-2" />
              <p>Your past journal entries will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {format(new Date(entry.created_at), "PPP")}
                  </CardTitle>
                  <CardDescription>
                    Reflections from your journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {entry.gratitude && (
                    <div>
                      <span className="font-medium text-foreground">
                        Gratitude:
                      </span>{" "}
                      {entry.gratitude}
                    </div>
                  )}
                  {entry.feeling && (
                    <div>
                      <span className="font-medium text-foreground">
                        Feelings:
                      </span>{" "}
                      {entry.feeling}
                    </div>
                  )}
                  {entry.victory && (
                    <div>
                      <span className="font-medium text-foreground">
                        Victory:
                      </span>{" "}
                      {entry.victory}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
