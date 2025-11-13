
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Check, Flame, Plus, Star, Target, TrendingUp, NotebookText, ShieldAlert, AlertTriangle, TrendingDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";
import Confetti from "@/components/shared/Confetti";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { AddictionCategory, DailyLog, Profile } from "@/lib/types";
import { failureReasons } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import {
  addDays,
  format,
  isSameDay,
  isWithinInterval,
  startOfDay,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";


const chartConfig = {
  days: {
    label: "Streak",
    color: "hsl(var(--primary))",
  },
};

const buildWeeklyChartData = (logs: DailyLog[]) => {
  const today = startOfDay(new Date());
  const points: Array<{ day: string; days: number }> = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = subDays(today, offset);
    const successes = logs.filter((log) => {
      const logDate = startOfDay(new Date(log.logged_date));
      return log.success && isSameDay(logDate, date);
    }).length;

    points.push({
      day: format(date, "EEE"),
      days: successes,
    });
  }

  return points;
};

const buildMonthlyChartData = (logs: DailyLog[]) => {
  const today = new Date();
  const points: Array<{ month: string; days: number }> = [];

  for (let i = 5; i >= 0; i--) {
    const targetMonthDate = subMonths(today, i);
    const monthStart = startOfMonth(targetMonthDate);
    const monthEnd = endOfMonth(targetMonthDate);

    const successes = logs.filter((log) => {
      const logDate = new Date(log.logged_date);
      return log.success && isWithinInterval(logDate, { start: monthStart, end: monthEnd });
    }).length;

    points.push({
      month: format(monthStart, "MMM"),
      days: successes,
    });
  }

  return points;
};


export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isLoading);
  const [isLogging, setIsLogging] = useState(false);
  const [lastLogDate, setLastLogDate] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [name, setName] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [category, setCategory] = useState<AddictionCategory | null>(null);
  const [slipUpCount, setSlipUpCount] = useState(0);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [pledge, setPledge] = useState("");
  const [goal, setGoal] = useState(90);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [showSlipUpDialog, setShowSlipUpDialog] = useState(false);
  const [weeklyChartData, setWeeklyChartData] = useState(
    buildWeeklyChartData([])
  );
  const [monthlyChartData, setMonthlyChartData] = useState(
    buildMonthlyChartData([])
  );

  const loadLogsForUser = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("id, user_id, logged_date, success, note, created_at")
      .eq("user_id", uid)
      .order("logged_date", { ascending: true });

    if (error) {
      toast({
        variant: "destructive",
        title: "Unable to load progress history",
        description: error.message,
      });
      return;
    }

    const logs = (data ?? []) as DailyLog[];
    setWeeklyChartData(buildWeeklyChartData(logs));
    setMonthlyChartData(buildMonthlyChartData(logs));
  }, [toast]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
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

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!isMounted) {
        return;
      }

      if (error) {
        toast({
          variant: "destructive",
          title: "Unable to load profile",
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      const profile = data as Profile | null;

      if (profile) {
        setName(profile.display_name ?? "");
        const profileCategory = profile.addiction_category as AddictionCategory | null;
        setCategory(profileCategory);
        setReasons(profileCategory ? failureReasons[profileCategory] ?? [] : []);
        setSlipUpCount(profile.slip_up_count ?? 0);
        setProfilePic(profile.profile_image_url);
        setPledge(profile.pledge ?? "");
        setGoal(profile.goal_days ?? 90);
        setCurrentStreak(profile.current_streak ?? 0);
        setLongestStreak(profile.longest_streak ?? 0);
        setLastLogDate(profile.last_log_date);
      }

      await loadLogsForUser(user.id);

      if (isMounted) {
        setIsLoading(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [loadLogsForUser, router, toast]);

  const hasLoggedToday = lastLogDate
    ? isSameDay(
        startOfDay(new Date(lastLogDate)),
        startOfDay(new Date())
      )
    : false;

  const handleLogProgress = async (success: boolean) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "No active session",
        description: "Please sign in again to track your progress.",
      });
      return;
    }

    setIsLogging(true);

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayIsoDate = format(todayStart, "yyyy-MM-dd");
    const alreadyLoggedToday = lastLogDate
      ? isSameDay(startOfDay(new Date(lastLogDate)), todayStart)
      : false;

    let newCurrentStreak = currentStreak;
    let newLongestStreak = longestStreak;
    let newSlipUpCount = slipUpCount;

    if (success) {
      if (!alreadyLoggedToday) {
        newCurrentStreak = currentStreak + 1;
        if (newCurrentStreak > longestStreak) {
          newLongestStreak = newCurrentStreak;
        }
      }
    } else {
      newCurrentStreak = 0;
      newSlipUpCount = slipUpCount + 1;
    }

    try {
      const { error: logError } = await supabase
        .from("daily_logs")
        .upsert(
          {
            user_id: userId,
            logged_date: todayIsoDate,
            success,
          },
          { onConflict: "user_id,logged_date" }
        );

      if (logError) {
        throw logError;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          slip_up_count: newSlipUpCount,
          last_log_date: todayIsoDate,
          updated_at: now.toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      setCurrentStreak(newCurrentStreak);
      setLongestStreak(newLongestStreak);
      setSlipUpCount(newSlipUpCount);
      setLastLogDate(todayIsoDate);

      await loadLogsForUser(userId);

      if (success) {
        setShowConfetti(true);
        toast({
          title: "You did it! 🎉",
          description: "Another day, another victory. Keep up the amazing work!",
        });
        setShowSlipUpDialog(false);
      } else {
        setShowSlipUpDialog(true);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again later.";
      toast({
        variant: "destructive",
        title: "Unable to log progress",
        description: message,
      });
    } finally {
      setIsLogging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <span className="text-muted-foreground">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      <header className="flex justify-between items-start">
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profilePic ?? undefined} alt="Profile picture" />
              <AvatarFallback>
                <User className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold font-headline">Good morning, {name || 'User'}</h1>
              <p className="text-muted-foreground">Ready to conquer the day?</p>
            </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full">
              <ShieldAlert className="h-6 w-6" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Emergency Help</AlertDialogTitle>
              <AlertDialogDescription>
                You've got this. Take a deep breath. Here's a quick exercise or a motivational quote. (This will be implemented later).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</div>
            <p className="text-xs text-muted-foreground">
              You're doing great!
            </p>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" className="w-full" disabled={hasLoggedToday || isLogging}>
                  {hasLoggedToday ? <Check className="mr-2"/> : <Plus className="mr-2" />}
                  {hasLoggedToday
                    ? "Logged for Today"
                    : isLogging
                      ? "Logging..."
                      : "Log Today's Progress"}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-lg">
                <SheetHeader className="text-center">
                  <SheetTitle>Log Your Progress</SheetTitle>
                  <SheetDescription>
                    Did you stay on track with your goal today? Be honest, every step counts.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-8">
                  <SheetClose asChild>
                    <Button
                      size="lg"
                      onClick={() => handleLogProgress(true)}
                      disabled={isLogging}
                    >
                      Yes, I did!
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={() => handleLogProgress(false)}
                      disabled={isLogging}
                    >
                      No, I slipped up
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</div>
            <p className="text-xs text-muted-foreground">
              Your personal best!
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3 grid-cols-1">
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goal} days</div>
            <p className="text-xs text-muted-foreground">
              Keep your eyes on the prize.
            </p>
          </CardContent>
        </Card>
         <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slip-ups</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slipUpCount}</div>
            <p className="text-xs text-muted-foreground">
                Learning opportunities.
            </p>
          </CardContent>
        </Card>
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Pledge</CardTitle>
            <NotebookText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground truncate italic">
              {pledge || "Make your pledge in settings."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-600 fill-mode-both">
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progress Stats
                </CardTitle>
            </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="weekly">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
                <TabsContent value="weekly">
                    <ChartContainer config={chartConfig} className="h-48 w-full mt-4">
                        <BarChart accessibilityLayer data={weeklyChartData}>
                            <defs>
                                <linearGradient id="fillDays" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-days)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-days)"
                                    stopOpacity={0.1}
                                />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis hide={true} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="days" fill="url(#fillDays)" radius={8} />
                        </BarChart>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="monthly">
                    <ChartContainer config={chartConfig} className="h-48 w-full mt-4">
                        <BarChart accessibilityLayer data={monthlyChartData}>
                            <defs>
                                <linearGradient id="fillDaysMonthly" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-days)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-days)"
                                    stopOpacity={0.1}
                                />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis hide={true} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="days" fill="url(#fillDaysMonthly)" radius={8} />
                        </BarChart>
                    </ChartContainer>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>


      {reasons.length > 0 && (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-700 fill-mode-both">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Common Challenges
            </CardTitle>
            <CardDescription>
                Forewarned is forearmed. Here are common hurdles when quitting {category}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-2">
                    <span className="text-primary/80 mt-1">&#8226;</span>
                    <p>{reason}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showSlipUpDialog} onOpenChange={setShowSlipUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>It's Okay, This is a New Day</AlertDialogTitle>
            <AlertDialogDescription>
              A slip-up is not a fall. It's a learning opportunity. The journey to overcoming any challenge has its ups and downs. What matters is that you're back, ready to try again.
              <br /><br />
              <strong>Your streak has been reset, but your progress is not lost.</strong> You've learned something valuable. Let's start this new day with strength.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSlipUpDialog(false)}>
              I'm Ready
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );

}
