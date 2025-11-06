

"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
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
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const totalSteps = 10;

const questions = [
    { id: 'welcome', title: "Let's Get Started", description: "Take the first step towards a healthier, happier you. Let's triumph over vice together." },
    { id: 'category', title: 'Question #1', description: 'What are we tackling?' },
    { id: 'name', title: 'Question #2', description: 'What should we call you?' },
    { id: 'age', title: 'Question #3', description: 'How old are you?' },
    { id: 'social', title: 'Question #4', description: 'Which social media platform do you use the most?'},
    { id: 'triggers', title: 'Question #5', description: 'What are your relapse triggers?'},
    { id: 'motivation', title: 'Question #6', description: 'Why do you want to be free?'},
    { id: 'goal', title: 'Question #7', description: 'What is your initial goal?' },
    { id: 'pledge', title: 'Sign your commitment', description: 'Promise yourself that you will never do it again.' },
    { id: 'credentials', title: 'Create your account', description: 'Almost there! Secure your journey.' },
]

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] =
    useState<AddictionCategory | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("");
  const [triggers, setTriggers] = useState("");
  const [motivation, setMotivation] = useState("");
  const [goal, setGoal] = useState(90);
  const router = useRouter();

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem("userName", name);
        localStorage.setItem("userGoal", goal.toString());
        localStorage.setItem("userAge", age);
        localStorage.setItem("userSocial", socialPlatform);
        localStorage.setItem("userTriggers", triggers);
        localStorage.setItem("userMotivation", motivation);
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

  const getDynamicDescription = () => {
    if (step === 9 && selectedCategory) {
      const categoryTextMap = {
        Porn: 'watch porn',
        Alcohol: 'drink alcohol',
        Smoking: 'smoke'
      }
      return `Finally, promise yourself that you will never ${categoryTextMap[selectedCategory]} again.`
    }
    return currentQuestion.description;
  }

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
                 {step === totalSteps ? <div className="w-9 h-9"/> : (
                     <Button variant="link" onClick={handleNext} className="text-muted-foreground p-0 h-9 w-9 text-sm">
                        Skip
                    </Button>
                )}
            </header>

            <main className="text-center">
                 <h1 className="text-3xl font-bold mb-2 font-headline tracking-tight">
                    {currentQuestion.title}
                 </h1>
                 <p className="text-muted-foreground">{getDynamicDescription()}</p>
            </main>

            <div className="min-h-[300px]">
                {step === 1 && <Step1 onNext={handleNext} />}
                {step === 2 && <Step2 onSelect={handleCategorySelect} />}
                {step === 3 && <StepName name={name} setName={setName} onNext={handleNext} />}
                {step === 4 && <StepAge age={age} setAge={setAge} onNext={handleNext} />}
                {step === 5 && <StepSocial socialPlatform={socialPlatform} setSocialPlatform={setSocialPlatform} onNext={handleNext} />}
                {step === 6 && <StepTriggers triggers={triggers} setTriggers={setTriggers} onNext={handleNext} />}
                {step === 7 && <StepMotivation motivation={motivation} setMotivation={setMotivation} onNext={handleNext} />}
                {step === 8 && <StepGoal goal={goal} setGoal={setGoal} onNext={handleNext} />}
                {step === 9 && <StepSignature onNext={handleNext} />}
                {step === 10 && <StepCredentials onNext={handleNext} />}
            </div>

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
        if (name.trim()) onNext();
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
             <Input 
                id="name" 
                type="text" 
                placeholder="Enter your name..." 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="h-14 text-center text-lg bg-secondary/50 rounded-full border-border focus:border-primary max-w-xs"
                required
            />
            <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
                Continue
            </Button>
        </form>
    )
}

function StepAge({ age, setAge, onNext }: { age: string; setAge: (a: string) => void; onNext: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (age) onNext();
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
            <Select onValueChange={setAge} value={age}>
                <SelectTrigger className="w-full max-w-xs h-14 text-center text-lg bg-secondary/50 rounded-full border-border focus:border-primary">
                    <SelectValue placeholder="Select your age range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="<18">&lt; 18</SelectItem>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55+">55+</SelectItem>
                </SelectContent>
            </Select>
            <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
                Continue
            </Button>
        </form>
    )
}

function StepSocial({ socialPlatform, setSocialPlatform, onNext }: { socialPlatform: string; setSocialPlatform: (s: string) => void; onNext: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (socialPlatform) onNext();
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
            <Select onValueChange={setSocialPlatform} value={socialPlatform}>
                <SelectTrigger className="w-full max-w-xs h-14 text-center text-lg bg-secondary/50 rounded-full border-border focus:border-primary">
                    <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Twitter">Twitter/X</SelectItem>
                    <SelectItem value="Reddit">Reddit</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
            <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
                Continue
            </Button>
        </form>
    )
}

function StepTriggers({ triggers, setTriggers, onNext }: { triggers: string, setTriggers: (t: string) => void, onNext: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
             <Textarea
                id="triggers"
                placeholder="e.g., stress, boredom, loneliness..."
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                className="bg-secondary/50 rounded-2xl border-border focus:border-primary max-w-xs min-h-[150px] text-base p-4"
            />
            <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
                Continue
            </Button>
        </form>
    )
}

function StepMotivation({ motivation, setMotivation, onNext }: { motivation: string, setMotivation: (m: string) => void, onNext: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
             <Textarea
                id="motivation"
                placeholder="e.g., to be healthier, improve relationships..."
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="bg-secondary/50 rounded-2xl border-border focus:border-primary max-w-xs min-h-[150px] text-base p-4"
            />
            <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
                Continue
            </Button>
        </form>
    )
}


function StepGoal({ goal, setGoal, onNext }: { goal: number; setGoal: (g: number) => void; onNext: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in-0 duration-500 flex flex-col items-center">
            <div className="text-center">
                <p className="text-6xl font-bold font-headline">{goal}</p>
                <p className="text-muted-foreground">days</p>
            </div>
            <Slider
                value={[goal]}
                max={365}
                min={1}
                step={1}
                onValueChange={(value) => setGoal(value[0])}
                className="w-full max-w-xs"
            />
            <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
                Set Goal
            </Button>
        </form>
    )
}

function StepSignature({ onNext }: { onNext: () => void }) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-0 duration-500 flex flex-col items-center">
      <div className="bg-card w-full max-w-sm h-48 rounded-lg border border-border">
         <SignatureCanvas
            ref={sigCanvas}
            penColor='white'
            canvasProps={{ className: 'w-full h-full' }}
        />
      </div>
      <div className="w-full max-w-sm flex justify-between items-center">
        <Button variant="link" onClick={clear} type="button" className="text-muted-foreground">
            Clear
        </Button>
        <p className="text-muted-foreground text-sm">Draw on the open space above</p>
      </div>

      <Button type="submit" size="lg" className="w-full max-w-xs rounded-full !mt-8">
        Finish
      </Button>
    </form>
  );
}


function StepCredentials({ onNext }: { onNext: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    }
  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-0 duration-500 flex flex-col items-center">
        <div className="grid gap-2 text-left w-full max-w-xs">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="h-12 bg-secondary/50 rounded-lg border-border focus:border-primary"/>
        </div>
        <div className="grid gap-2 text-left w-full max-w-xs">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" className="h-12 bg-secondary/50 rounded-lg border-border focus:border-primary" />
        </div>
         <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
          Complete Sign Up
        </Button>
      </form>
  );
}
