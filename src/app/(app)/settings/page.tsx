"use client";

import { useState } from "react";
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
  const [goal, setGoal] = useState(90);
  const [newGoal, setNewGoal] = useState(goal);
  const [pledge, setPledge] = useState("");
  const { toast } = useToast();

  const handleSaveGoal = () => {
    setGoal(newGoal);
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
    toast({
      title: "Pledge Saved!",
      description: "Your personal commitment has been recorded.",
    });
  };

  const handleResetProgress = () => {
    toast({
      variant: "destructive",
      title: "Progress Reset",
      description: "Your streak and progress have been cleared. It's a fresh start!",
    });
    setGoal(90);
    setNewGoal(90);
    setPledge("");
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and goals.</p>
      </header>

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
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
      
      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
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

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
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
