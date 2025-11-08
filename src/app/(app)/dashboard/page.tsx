
"use client";

import React, { useState, useEffect } from "react";
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
import type { AddictionCategory } from "@/lib/types";
import { failureReasons } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";


const chartData = [
  { day: "Mon", days: 1 },
  { day: "Tue", days: 2 },
  { day: "Wed", days: 3 },
  { day: "Thu", days: 2 },
  { day: "Fri", days: 3 },
  { day: "Sat", days: 4 },
  { day: "Sun", days: 5 },
];

const chartConfig = {
  days: {
    label: "Streak",
    color: "hsl(var(--primary))",
  },
};

export default function DashboardPage() {
  const { toast } = useToast();
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


  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedCategory = localStorage.getItem("addictionCategory") as AddictionCategory | null;
    const storedSlipUps = localStorage.getItem("slipUpCount");
    const storedProfilePic = localStorage.getItem("userProfilePic");
    const storedPledge = localStorage.getItem("userPledge");
    const storedGoal = localStorage.getItem("userGoal");
    const storedStreak = localStorage.getItem("currentStreak");
    const storedLongestStreak = localStorage.getItem("longestStreak");
    const storedLastLogDate = localStorage.getItem("lastLogDate");

    if (storedName) setName(storedName);
    if (storedCategory && failureReasons[storedCategory]) {
      setCategory(storedCategory);
      setReasons(failureReasons[storedCategory]);
    }
    if (storedSlipUps) setSlipUpCount(parseInt(storedSlipUps, 10));
    if (storedProfilePic) setProfilePic(storedProfilePic);
    if (storedPledge) setPledge(storedPledge);
    if (storedGoal) setGoal(parseInt(storedGoal, 10));
    if (storedStreak) setCurrentStreak(parseInt(storedStreak, 10));
    if (storedLongestStreak) setLongestStreak(parseInt(storedLongestStreak, 10));
    if (storedLastLogDate) setLastLogDate(storedLastLogDate);

  }, []);

  const handleLogProgress = (success: boolean) => {
    const today = new Date().toDateString();
    
    if (success) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      localStorage.setItem("currentStreak", newStreak.toString());

      if (newStreak > longestStreak) {
          setLongestStreak(newStreak);
          localStorage.setItem("longestStreak", newStreak.toString());
      }

      setShowConfetti(true);
      toast({
        title: "You did it! 🎉",
        description: "Another day, another victory. Keep up the amazing work!",
      });
    } else {
      const newSlipUpCount = slipUpCount + 1;
      setSlipUpCount(newSlipUpCount);
      localStorage.setItem("slipUpCount", newSlipUpCount.toString());
      setCurrentStreak(0);
      localStorage.setItem("currentStreak", "0");
      setShowSlipUpDialog(true);
    }
    
    setLastLogDate(today);
    localStorage.setItem("lastLogDate", today);
  };
  
  const hasLoggedToday = lastLogDate === new Date().toDateString();

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
                <Button size="sm" className="w-full" disabled={hasLoggedToday}>
                  {hasLoggedToday ? <Check className="mr-2"/> : <Plus className="mr-2" />}
                  {hasLoggedToday ? 'Logged for Today' : 'Log Today\'s Progress'}
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
                    <Button size="lg" onClick={() => handleLogProgress(true)}>
                      Yes, I did!
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button size="lg" variant="destructive" onClick={() => handleLogProgress(false)}>
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
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart accessibilityLayer data={chartData}>
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

    