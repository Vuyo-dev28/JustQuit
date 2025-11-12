
'use client';

import { NotebookText, Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { milestones } from "@/lib/milestones";
import MilestoneBadge from "@/components/shared/MilestoneBadge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function ProgressPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [currentStreak, setCurrentStreak] = useState(0);
    const [goal, setGoal] = useState(90);
    const [pledge, setPledge] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadProgress = async () => {
            setIsLoading(true);

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (!isMounted) {
                return;
            }

            if (userError || !user) {
                router.replace("/login");
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("current_streak, goal_days, pledge")
                .eq("id", user.id)
                .single();

            if (!isMounted) {
                return;
            }

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Unable to load progress",
                    description: error.message,
                });
                setIsLoading(false);
                return;
            }

            const profile = data as Partial<Profile> | null;

            if (profile) {
                setCurrentStreak(profile.current_streak ?? 0);
                setGoal(profile.goal_days ?? 90);
                setPledge(profile.pledge ?? "");
            }

            setIsLoading(false);
        };

        void loadProgress();

        return () => {
            isMounted = false;
        };
    }, [router, toast]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-4">
                <span className="text-muted-foreground">Loading progress...</span>
            </div>
        );
    }

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold font-headline">Your Progress</h1>
        <p className="text-muted-foreground">A detailed look at your journey.</p>
      </header>
      
      <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goal} days</div>
            </CardContent>
        </Card>
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Your Pledge
              <NotebookText className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground truncate italic">
              {pledge || "Make your pledge in settings."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
        <h2 className="text-lg font-semibold">Milestones</h2>
        <Card>
          <CardContent className="p-4">
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {milestones.map((milestone) => (
                    <MilestoneBadge
                        key={milestone.days}
                        milestone={milestone}
                        isAchieved={currentStreak >= milestone.days}
                    />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
