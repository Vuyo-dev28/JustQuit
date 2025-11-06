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

export default function SettingsPage() {
  const [goal, setGoal] = useState(90);
  const [newGoal, setNewGoal] = useState(goal);
  const { toast } = useToast();

  const handleSaveGoal = () => {
    setGoal(newGoal);
    toast({
      title: "Goal Updated!",
      description: `Your new goal is to reach ${newGoal} days.`,
    });
  };

  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and goals.</p>
      </header>

      <Card>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Log Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
