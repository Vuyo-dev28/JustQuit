
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Camera } from "lucide-react";
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

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(90);
  const [newGoal, setNewGoal] = useState(goal);
  const [pledge, setPledge] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedPledge = localStorage.getItem("userPledge");
    const storedGoal = localStorage.getItem("userGoal");
    const storedProfilePic = localStorage.getItem("userProfilePic");

    if (storedName) setName(storedName);
    if (storedPledge) setPledge(storedPledge);
    if (storedGoal) {
      const numGoal = parseInt(storedGoal, 10);
      setGoal(numGoal);
      setNewGoal(numGoal);
    }
    if (storedProfilePic) setProfilePic(storedProfilePic);
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem("userName", name);
    if (profilePic) {
      localStorage.setItem("userProfilePic", profilePic);
    }
    toast({
      title: "Profile Updated!",
      description: "Your information has been saved.",
    });
  };

  const handleSaveGoal = () => {
    setGoal(newGoal);
    localStorage.setItem("userGoal", newGoal.toString());
    toast({
      title: "Goal Updated!",
      description: `Your new goal is to reach ${newGoal} days.`,
    });
  };

  const handleSavePledge = () => {
    if (!pledge.trim()) {
      toast({
        variant: "destructive",
        title: "Pledge is empty",
        description: "Please write a pledge before saving.",
      });
      return;
    }
    localStorage.setItem("userPledge", pledge);
    toast({
      title: "Pledge Saved!",
      description: "Your personal commitment has been recorded.",
    });
  };

  const handleResetProgress = () => {
    // This could be expanded to clear more data
    localStorage.removeItem("userName");
    localStorage.removeItem("userPledge");
    localStorage.removeItem("userGoal");
    localStorage.removeItem("userProfilePic");
    localStorage.removeItem("slipUpCount");
    
    toast({
      variant: "destructive",
      title: "Progress Reset",
      description: "Your streak and progress have been cleared. It's a fresh start!",
    });
    
    setGoal(90);
    setNewGoal(90);
    setPledge("");
    setName("");
    setProfilePic(null);
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

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and goals.</p>
      </header>

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
          <Button onClick={handleSaveProfile}>Save Profile</Button>
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
          <Button onClick={handleSaveGoal} disabled={goal === newGoal}>
            Save Changes
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
          <Button onClick={handleSavePledge}>Save Pledge</Button>
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
          <Button variant="outline">Log Out</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reset All Progress</Button>
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
                <AlertDialogAction onClick={handleResetProgress}>
                  Yes, reset my progress
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
