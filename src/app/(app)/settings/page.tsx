
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Camera, Moon, Sun } from "lucide-react";
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
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isSavingPledge, setIsSavingPledge] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(90);
  const [newGoal, setNewGoal] = useState(goal);
  const [pledge, setPledge] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);


  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };


  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
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
        setPledge(profile.pledge ?? "");
        const goalDays = profile.goal_days ?? 90;
        setGoal(goalDays);
        setNewGoal(goalDays);
        setProfilePic(profile.profile_image_url);
      }

      setIsLoading(false);
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router, toast]);

  const handleSaveProfile = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "No active session",
        description: "Please sign in again to update your profile.",
      });
      return;
    }

    setIsSavingProfile(true);

    const trimmedName = name.trim();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: trimmedName ? trimmedName : null,
        profile_image_url: profilePic ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Profile update failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Profile Updated!",
        description: "Your information has been saved.",
      });
    }

    setIsSavingProfile(false);
  };

  const handleSaveGoal = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "No active session",
        description: "Please sign in again to update your goal.",
      });
      return;
    }

    setIsSavingGoal(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        goal_days: newGoal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Goal update failed",
        description: error.message,
      });
    } else {
      setGoal(newGoal);
      toast({
        title: "Goal Updated!",
        description: `Your new goal is to reach ${newGoal} days.`,
      });
    }

    setIsSavingGoal(false);
  };

  const handleSavePledge = async () => {
    if (!pledge.trim()) {
      toast({
        variant: "destructive",
        title: "Pledge is empty",
        description: "Please write a pledge before saving.",
      });
      return;
    }

    if (!userId) {
      toast({
        variant: "destructive",
        title: "No active session",
        description: "Please sign in again to update your pledge.",
      });
      return;
    }

    setIsSavingPledge(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        pledge: pledge.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Pledge update failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Pledge Saved!",
        description: "Your personal commitment has been recorded.",
      });
    }

    setIsSavingPledge(false);
  };

  const handleResetProgress = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "No active session",
        description: "Please sign in again to reset your progress.",
      });
      return;
    }

    setIsResetting(true);

    const { error: logsError } = await supabase
      .from("daily_logs")
      .delete()
      .eq("user_id", userId);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: null,
        profile_image_url: null,
        pledge: null,
        goal_days: 90,
        current_streak: 0,
        longest_streak: 0,
        slip_up_count: 0,
        last_log_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (logsError || profileError) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: logsError?.message ?? profileError?.message ?? "Please try again later.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Progress Reset",
        description: "Your data has been cleared. It's a fresh start!",
      });

      setName("");
      setPledge("");
      setGoal(90);
      setNewGoal(90);
      setProfilePic(null);
    }

    setIsResetting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };


  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <span className="text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and goals.</p>
      </header>

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Switch between light and dark mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-switch" className="flex items-center gap-2">
              {isDarkMode ? <Moon/> : <Sun />}
              <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </Label>
            <Switch
              id="theme-switch"
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>


      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profilePic ?? undefined} alt="Profile picture" />
                <AvatarFallback>
                  <User className="h-10 w-10 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleProfilePicChange}
              />
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
        <CardHeader>
          <CardTitle>Your Goal</CardTitle>
          <CardDescription>
            This is your long-term objective. Adjust it anytime to match your
            ambitions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-5xl font-bold font-headline">{newGoal}</p>
              <p className="text-muted-foreground">days</p>
            </div>
            <Slider
              value={[newGoal]}
              max={365}
              min={1}
              step={1}
              onValueChange={(value) => setNewGoal(value[0])}
            />
          </div>
          <Button
            onClick={handleSaveGoal}
            disabled={goal === newGoal || isSavingGoal}
          >
            {isSavingGoal ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
        <CardHeader>
          <CardTitle>Personal Pledge</CardTitle>
          <CardDescription>
            Write a commitment to yourself. This is your personal mission statement to keep you focused.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="I commit to my well-being by..."
            value={pledge}
            onChange={(e) => setPledge(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSavePledge} disabled={isSavingPledge}>
            {isSavingPledge ? "Saving..." : "Save Pledge"}
          </Button>
        </CardContent>
      </Card>

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings and data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={() => void handleLogout()}>
            Log Out
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : "Reset All Progress"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your progress data, including your streaks and logs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => void handleResetProgress()}
                  disabled={isResetting}
                >
                  {isResetting ? "Resetting..." : "Yes, reset my progress"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
