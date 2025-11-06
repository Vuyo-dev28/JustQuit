"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CigaretteOff,
  EyeOff,
  Target,
  UserPlus,
  Wine,
} from "lucide-react";

import type { AddictionCategory, Category } from "@/lib/types";
import { AppLogo } from "@/components/shared/AppLogo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const categories: Category[] = [
  {
    id: "Porn",
    name: "Porn",
    icon: EyeOff,
    description: "Break free from compulsive sexual content.",
  },
  {
    id: "Alcohol",
    name: "Alcohol",
    icon: Wine,
    description: "Regain control over your drinking habits.",
  },
  {
    id: "Smoking",
    name: "Smoking",
    icon: CigaretteOff,
    description: "Quit smoking and embrace a healthier life.",
  },
];

const totalSteps = 4;

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] =
    useState<AddictionCategory | null>(null);
  const [goal, setGoal] = useState(30);
  const router = useRouter();

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final step: redirect to dashboard
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        {step > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="absolute top-4 left-4 text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        <div className="mb-4">
          <Progress value={(step / totalSteps) * 100} className="w-full h-2" />
        </div>
        <Card className="overflow-hidden">
          <div
            className="transition-all duration-300"
            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
          >
            <div className="flex w-[400%]" >
              <Step1 onNext={handleNext} />
              <Step2
                onSelect={(category) => {
                  setSelectedCategory(category);
                  handleNext();
                }}
              />
              <Step3 goal={goal} setGoal={setGoal} onNext={handleNext} />
              <Step4 onNext={handleNext} />
            </div>
          </div>
        </Card>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline text-primary/90 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-1/4 p-6 text-center">
      <div className="flex justify-center mb-6">
        <AppLogo />
      </div>
      <h2 className="text-2xl font-bold mb-2 font-headline">
        Start Your Journey to Freedom
      </h2>
      <p className="text-muted-foreground mb-8">
        Take the first step towards a healthier, happier you. Let's triumph over vice together.
      </p>
      <Button onClick={onNext} className="w-full">
        Start Your Journey
      </Button>
    </div>
  );
}

function Step2({ onSelect }: { onSelect: (category: AddictionCategory) => void }) {
  return (
    <div className="w-1/4 p-6">
      <CardHeader className="text-center p-0 mb-6">
        <CardTitle className="text-2xl font-bold font-headline">
          What are we tackling?
        </CardTitle>
        <CardDescription>
          Choose the area you want to focus on.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="w-full text-left"
            >
              <Card className="hover:bg-accent hover:border-primary/50 transition-colors duration-200">
                <CardContent className="flex items-center p-4 gap-4">
                  <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </CardContent>
    </div>
  );
}

function Step3({ goal, setGoal, onNext }: { goal: number; setGoal: (g: number) => void; onNext: () => void }) {
  return (
    <div className="w-1/4 p-6">
      <CardHeader className="text-center p-0 mb-6">
        <div className="mx-auto bg-secondary text-secondary-foreground p-3 rounded-lg mb-4">
            <Target className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold font-headline">
          Set Your North Star
        </CardTitle>
        <CardDescription>
          What's your initial goal? You can always change this later.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-8">
        <div className="text-center">
            <p className="text-5xl font-bold font-headline">{goal}</p>
            <p className="text-muted-foreground">days</p>
        </div>
        <Slider
          defaultValue={[goal]}
          max={365}
          min={1}
          step={1}
          onValueChange={(value) => setGoal(value[0])}
        />
        <Button onClick={onNext} className="w-full">
          Set Goal & Continue
        </Button>
      </CardContent>
    </div>
  );
}

function Step4({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-1/4 p-6">
       <CardHeader className="text-center p-0 mb-6">
        <div className="mx-auto bg-secondary text-secondary-foreground p-3 rounded-lg mb-4">
            <UserPlus className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold font-headline">
          Create Your Account
        </CardTitle>
        <CardDescription>
            Let's get you set up. Your journey is private and secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
        </div>
         <Button onClick={onNext} className="w-full">
          Complete Sign Up
        </Button>
      </CardContent>
    </div>
  );
}
