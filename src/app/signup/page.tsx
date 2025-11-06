
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CigaretteOff,
  EyeOff,
  Wine,
} from "lucide-react";

import type { AddictionCategory, Category } from "@/lib/types";
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

const questions = [
    { id: 'welcome', title: "Let's Get Started", description: "Take the first step towards a healthier, happier you. Let's triumph over vice together." },
    { id: 'category', title: 'Question #1', description: 'What are we tackling?' },
    { id: 'name', title: 'Question #2', description: 'What should we call you?' },
    { id: 'credentials', title: 'Question #3', description: 'Create your secure account.' },
]

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] =
    useState<AddictionCategory | null>(null);
  const [name, setName] = useState("");
  const router = useRouter();

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem("userName", name);
      }
      router.push("/subscribe");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCategorySelect = (category: AddictionCategory) => {
    setSelectedCategory(category);
    if (typeof window !== 'undefined') {
      localStorage.setItem("addictionCategory", category);
    }
    handleNext();
  }
  
  const currentQuestion = questions[step - 1];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent">
        <div className="w-full max-w-md space-y-8">
            <header className="flex items-center justify-between">
                {step > 1 ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="text-muted-foreground"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                ) : <div className="w-9 h-9"/>}
                <div className="w-full mx-8">
                    <Progress value={(step / totalSteps) * 100} className="h-2" />
                </div>
                <div className="w-9 h-9"/>
            </header>

            <main className="text-center">
                 <h1 className="text-3xl font-bold mb-2 font-headline tracking-tight">
                    {currentQuestion.title}
                 </h1>
                 <p className="text-muted-foreground">{currentQuestion.description}</p>
            </main>

            <div className="min-h-[300px]">
                {step === 1 && <Step1 onNext={handleNext} />}
                {step === 2 && <Step2 onSelect={handleCategorySelect} />}
                {step === 3 && <StepName name={name} setName={setName} onNext={handleNext} />}
                {step === 4 && <StepCredentials onNext={handleNext} />}
            </div>

             <footer className="text-center">
                {step > 1 && (
                    <Button variant="link" onClick={handleNext} className="text-muted-foreground">Skip</Button>
                )}
            </footer>
             <div className="text-center text-sm text-muted-foreground">
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
    <div className="flex flex-col justify-center items-center h-full animate-in fade-in-0 duration-500">
      <Button onClick={onNext} size="lg" className="w-full max-w-xs rounded-full">
        Start Your Journey
      </Button>
    </div>
  );
}

function Step2({ onSelect }: { onSelect: (category: AddictionCategory) => void }) {
  return (
    <div className="space-y-3 animate-in fade-in-0 duration-500">
      {categories.map((category, index) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className="w-full text-left"
        >
          <Card className="bg-secondary/50 border-border hover:border-primary transition-colors duration-200 rounded-full">
            <CardContent className="flex items-center p-4 gap-4">
                <div className="bg-primary/10 text-primary border border-primary/20 flex items-center justify-center h-8 w-8 rounded-full">
                    <span className="font-bold text-sm">{index + 1}</span>
                </div>
              <h3 className="font-semibold text-lg text-foreground">{category.name}</h3>
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}

function StepName({ name, setName, onNext }: { name: string; setName: (n: string) => void; onNext: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500">
             <Input 
                id="name" 
                type="text" 
                placeholder="Enter your name..." 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="h-14 text-center text-lg bg-secondary/50 rounded-full border-border focus:border-primary"
            />
            <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
                Continue
            </Button>
        </form>
    )
}

function StepCredentials({ onNext }: { onNext: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    }
  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-0 duration-500">
        <div className="grid gap-2 text-left">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="h-12 bg-secondary/50 rounded-lg border-border focus:border-primary"/>
        </div>
        <div className="grid gap-2 text-left">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" className="h-12 bg-secondary/50 rounded-lg border-border focus:border-primary" />
        </div>
         <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
          Complete Sign Up
        </Button>
      </form>
  );
}
