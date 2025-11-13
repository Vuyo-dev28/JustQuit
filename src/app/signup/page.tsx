
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
import {
  Activity,
  ArrowLeft,
  BedDouble,
  BrainCircuit,
  CigaretteOff,
  DollarSign,
  EyeOff,
  Heart,
  Leaf,
  Paintbrush,
  Smile,
  Sparkles,
  Users,
  Wine,
  Zap,
} from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import type { AddictionCategory, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { failureReasons } from "@/lib/data";
import { addictionConsequences } from "@/lib/consequences";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { analyzeUserProblems, AnalyzeUserProblemsInput, AnalyzeUserProblemsOutput } from "@/ai/flows/analyze-user-problems";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";


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

const totalSteps = 14;

const questions = [
    { id: 'welcome', title: "Let's Get Started", description: "Take the first step towards a healthier, happier you. Let's triumph over vice together." },
    { id: 'category', title: 'What are we tackling?', description: 'Choose the area you want to focus on.' },
    { id: 'consequences', title: 'Facing the Facts', description: "Understanding the 'why' is a powerful tool for change. Here are common impacts." },
    { id: 'name', title: 'What should we call you?', description: "Let's get to know each other." },
    { id: 'gender', title: 'What is your gender?', description: 'This helps us personalize your experience.' },
    { id: 'age', title: 'How old are you?', description: 'This helps us provide relevant insights.' },
    { id: 'social', title: 'Which social media do you use most?', description: 'Understanding your environment helps.'},
    { id: 'goals', title: 'What are your primary goals?', description: 'Select all that apply.'},
    { id: 'triggers', title: 'What are your relapse triggers?', description: 'Identifying them is the first step to managing them.'},
    { id: 'motivation', title: 'Why do you want to be free?', description: 'Connect with your deepest reason.'},
    { id: 'analysis', title: 'A Quick Analysis', description: "Here's a little encouragement based on your answers." },
    { id: 'goal', title: 'What is your initial goal?', description: 'Set a target to aim for.' },
    { id: 'pledge', title: 'Sign your commitment', description: 'Promise yourself that you will never do it again.' },
    { id: 'credentials', title: 'Create your account', description: 'Almost there! Secure your journey.' },
]

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] =
    useState<AddictionCategory | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("");
  const [chosenGoals, setChosenGoals] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [motivation, setMotivation] = useState("");
  const [goal, setGoal] = useState(90);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCategorySelect = (category: AddictionCategory) => {
    setSelectedCategory(category);
    handleNext();
  }
  
  const currentQuestion = questions[step - 1];

  const getDynamicDescription = () => {
    if (step === 13 && selectedCategory) { 
      const categoryTextMap = {
        Porn: 'watch porn',
        Alcohol: 'drink alcohol',
        Smoking: 'smoke'
      }
      return `Promise yourself that you will never ${categoryTextMap[selectedCategory]} again.`
    }
    return currentQuestion.description;
  }
  
  const signupData: AnalyzeUserProblemsInput = {
      category: selectedCategory ?? undefined,
      age,
      gender,
      triggers,
      motivation,
      goals: chosenGoals
  };

  useEffect(() => {
    let isMounted = true;

    const redirectIfAuthenticated = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (session) {
        router.replace("/dashboard");
      }
    };

    void redirectIfAuthenticated();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleCompleteSignup = async () => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing credentials",
        description: "Please provide an email and password to continue.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Please choose a password with at least 6 characters.",
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        variant: "destructive",
        title: "Select a focus area",
        description: "Please choose what you want to work on before signing up.",
      });
      return;
    }

    setIsSubmitting(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name || undefined,
        },
      },
    });

    if (signUpError || !signUpData.user) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: signUpError?.message ?? "We couldn't create your account right now.",
      });
      setIsSubmitting(false);
      return;
    }

    let user = signUpData.user;

    if (!signUpData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast({
          variant: "destructive",
          title: "Sign in required",
          description:
            signInError.message ||
            "Please confirm your email and sign in to continue.",
        });
        setIsSubmitting(false);
        return;
      }

      const {
        data: { user: sessionUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !sessionUser) {
        toast({
          variant: "destructive",
          title: "Session unavailable",
          description: userError?.message ?? "Please try signing in again.",
        });
        setIsSubmitting(false);
        return;
      }

      user = sessionUser;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Unable to continue",
        description: "We could not verify your session. Please try again.",
      });
      setIsSubmitting(false);
      return;
    }

    const userId = user.id;

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      display_name: name || null,
      addiction_category: selectedCategory,
      gender: gender || null,
      age_range: age || null,
      social_platform: socialPlatform || null,
      goals: chosenGoals.length ? chosenGoals : null,
      triggers: triggers.length ? triggers : null,
      motivation: motivation || null,
      goal_days: goal,
      pledge: null,
      profile_image_url: null,
      current_streak: 0,
      longest_streak: 0,
      slip_up_count: 0,
      last_log_date: null,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      toast({
        variant: "destructive",
        title: "Profile setup failed",
        description: profileError.message,
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: "Account created",
      description: "Welcome to Just Quit! Let's get started.",
    });

    setIsSubmitting(false);
    router.replace("/dashboard");
  };

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
                {step === 3 && <StepConsequences category={selectedCategory} onNext={handleNext} />}
                {step === 4 && <StepName name={name} setName={setName} onNext={handleNext} />}
                {step === 5 && <StepGender gender={gender} setGender={setGender} onNext={handleNext} />}
                {step === 6 && <StepAge age={age} setAge={setAge} onNext={handleNext} />}
                {step === 7 && <StepSocial socialPlatform={socialPlatform} setSocialPlatform={setSocialPlatform} onNext={handleNext} />}
                {step === 8 && <StepChooseGoals chosenGoals={chosenGoals} setChosenGoals={setChosenGoals} onNext={handleNext} />}
                {step === 9 && <StepTriggers category={selectedCategory} triggers={triggers} setTriggers={setTriggers} onNext={handleNext} />}
                {step === 10 && <StepMotivation motivation={motivation} setMotivation={setMotivation} onNext={handleNext} />}
                {step === 11 && <StepAiAnalysis input={signupData} onNext={handleNext} />}
                {step === 12 && <StepGoal goal={goal} setGoal={setGoal} onNext={handleNext} />}
                {step === 13 && <StepSignature onNext={handleNext} />}
                {step === 14 && <StepCredentials email={email} setEmail={setEmail} password={password} setPassword={setPassword} onComplete={handleCompleteSignup} isSubmitting={isSubmitting} />}
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

function StepConsequences({ category, onNext }: { category: AddictionCategory | null; onNext: () => void }) {
    const consequences = category ? addictionConsequences[category] : [];

    return (
        <div className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
            <Carousel className="w-full max-w-xs">
                <CarouselContent>
                    {consequences.map((item, index) => (
                        <CarouselItem key={index}>
                            <Card className="bg-card border-border/80 shadow-sm h-52 flex flex-col justify-center items-center text-center">
                                <CardHeader className="p-4 flex flex-col items-center gap-3">
                                    <div className="p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <CardDescription className="text-xs">{item.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
            <Button onClick={onNext} size="lg" className="w-full max-w-xs rounded-full">
                I Understand
            </Button>
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

const genderOptions = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
]

function StepGender({ gender, setGender, onNext }: { gender: string, setGender: (g: string) => void, onNext: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (gender) onNext();
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
            <RadioGroup value={gender} onValueChange={setGender} className="w-full max-w-xs space-y-3">
                {genderOptions.map(option => (
                    <Card key={option.id} className="bg-secondary/50 border-border has-[:checked]:border-primary transition-colors duration-200 rounded-full">
                        <Label className="flex items-center p-4 gap-4 cursor-pointer">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <h3 className="font-semibold text-lg text-foreground">{option.label}</h3>
                        </Label>
                    </Card>
                ))}
            </RadioGroup>
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
                    <SelectItem value="<18" className="text-lg">&lt; 18</SelectItem>
                    <SelectItem value="18-24" className="text-lg">18-24</SelectItem>
                    <SelectItem value="25-34" className="text-lg">25-34</SelectItem>
                    <SelectItem value="35-44" className="text-lg">35-44</SelectItem>
                    <SelectItem value="45-54" className="text-lg">45-54</SelectItem>
                    <SelectItem value="55+" className="text-lg">55+</SelectItem>
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
                    <SelectItem value="Facebook" className="text-lg">Facebook</SelectItem>
                    <SelectItem value="Instagram" className="text-lg">Instagram</SelectItem>
                    <SelectItem value="TikTok" className="text-lg">TikTok</SelectItem>
                    <SelectItem value="Twitter" className="text-lg">Twitter/X</SelectItem>
                    <SelectItem value="Reddit" className="text-lg">Reddit</SelectItem>
                    <SelectItem value="Other" className="text-lg">Other</SelectItem>
                </SelectContent>
            </Select>
            <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
                Continue
            </Button>
        </form>
    )
}

const goalOptions = [
    { id: 'health', label: 'Improve Health', icon: Heart },
    { id: 'productivity', label: 'Increase Productivity', icon: Zap },
    { id: 'happiness', label: 'Boost Happiness', icon: Smile },
    { id: 'money', label: 'Save Money', icon: DollarSign },
    { id: 'relationships', label: 'Improve Relationships', icon: Users },
    { id: 'stress', label: 'Reduce Stress', icon: Leaf },
    { id: 'control', label: 'Gain Self-Control', icon: BrainCircuit },
    { id: 'hobbies', label: 'Find New Hobbies', icon: Paintbrush },
    { id: 'sleep', label: 'Improve Sleep', icon: BedDouble },
    { id: 'confidence', label: 'Boost Confidence', icon: Sparkles },
    { id: 'longevity', label: 'Live Longer', icon: Activity },
]

function StepChooseGoals({
  chosenGoals,
  setChosenGoals,
  onNext,
}: {
  chosenGoals: string[];
  setChosenGoals: React.Dispatch<React.SetStateAction<string[]>>;
  onNext: () => void;
}) {
    const handleGoalToggle = (goalId: string) => {
        setChosenGoals(prev => 
            prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
        );
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (chosenGoals.length > 0) onNext();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
            <div className="w-full max-w-md grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map(option => (
                    <Card key={option.id} className="bg-secondary/50 border-border has-[:checked]:border-primary transition-colors duration-200 rounded-2xl">
                        <Label className="flex items-center p-3 gap-3 cursor-pointer">
                             <Checkbox 
                                id={option.id} 
                                checked={chosenGoals.includes(option.id)}
                                onCheckedChange={() => handleGoalToggle(option.id)}
                            />
                            <option.icon className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base text-foreground">{option.label}</h3>
                        </Label>
                    </Card>
                ))}
            </div>
            <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
                Continue
            </Button>
        </form>
    )
}

function StepTriggers({
  category,
  triggers,
  setTriggers,
  onNext,
}: {
  category: AddictionCategory | null;
  triggers: string[];
  setTriggers: React.Dispatch<React.SetStateAction<string[]>>;
  onNext: () => void;
}) {
    const triggerOptions = category ? failureReasons[category] : [];

    const handleTriggerToggle = (trigger: string) => {
        setTriggers(prev =>
            prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (triggers.length > 0) onNext();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
            <div className="w-full max-w-md space-y-3">
                {triggerOptions.map((option, index) => (
                     <Card key={index} className="bg-secondary/50 border-border has-[:checked]:border-primary transition-colors duration-200 rounded-full">
                        <Label className="flex items-center p-4 gap-4 cursor-pointer">
                            <Checkbox 
                                id={`trigger-${index}`}
                                checked={triggers.includes(option)}
                                onCheckedChange={() => handleTriggerToggle(option)}
                            />
                            <h3 className="font-semibold text-lg text-foreground">{option}</h3>
                        </Label>
                    </Card>
                ))}
            </div>
            <Button type="submit" size="lg" className="w-full max-w-xs rounded-full">
                Continue
            </Button>
        </form>
    )
}

const motivationOptions = [
    { id: 'health', label: 'To improve my physical health' },
    { id: 'relationships', label: 'To improve my relationships' },
    { id: 'clarity', label: 'For mental clarity and focus' },
    { id: 'self-esteem', label: 'To boost my self-esteem' },
    { id: 'other', label: 'Other' },
]

function StepMotivation({ motivation, setMotivation, onNext }: { motivation: string, setMotivation: (m: string) => void, onNext: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (motivation) onNext();
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
            <RadioGroup value={motivation} onValueChange={setMotivation} className="w-full max-w-xs space-y-3">
                {motivationOptions.map(option => (
                    <Card key={option.id} className="bg-secondary/50 border-border has-[:checked]:border-primary transition-colors duration-200 rounded-full">
                        <Label className="flex items-center p-4 gap-4 cursor-pointer">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <h3 className="font-semibold text-lg text-foreground">{option.label}</h3>
                        </Label>
                    </Card>
                ))}
            </RadioGroup>
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
        Continue
      </Button>
    </form>
  );
}

const chartConfig = {
  success: {
    label: "Success Rate",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


function StepAiAnalysis({ input, onNext }: { input: AnalyzeUserProblemsInput; onNext: () => void }) {
  const [analysis, setAnalysis] = useState<AnalyzeUserProblemsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const analysisPerformed = useRef(false);

  useEffect(() => {
    const getAnalysis = async () => {
      if (analysisPerformed.current) return;
      analysisPerformed.current = true;

      setIsLoading(true);
      try {
        const result = await analyzeUserProblems(input);
        setAnalysis(result);
      } catch (error) {
        console.error("AI analysis failed:", error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "Could not get AI-powered feedback. Using default messages.",
        });
        setAnalysis({
            summary: "Taking this first step is a brave and powerful decision. You have a community here to support you on your journey to a healthier life.",
            struggleStat: "Millions",
            successRate: 80,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    void getAnalysis();
  }, [input, toast]);

  const renderLoading = () => (
    <div className="space-y-6">
        <Card className="w-full max-w-md bg-secondary/30">
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-secondary/30">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
             <Card className="bg-secondary/30">
                <CardContent className="p-4 flex items-center justify-center h-32">
                    <Skeleton className="h-24 w-24 rounded-full" />
                </CardContent>
            </Card>
        </div>
    </div>
  )

  const renderContent = () => (
    <div className="space-y-4">
        <Card className="w-full max-w-md bg-card border-border/80 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Your Path Forward</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-foreground/80">{analysis?.summary}</p>
            </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card border-border/80 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <h3 className="text-3xl font-bold text-primary">{analysis?.struggleStat}</h3>
                    <p className="text-xs text-muted-foreground mt-1">face similar challenges</p>
                </CardContent>
            </Card>
            <Card className="bg-card border-border/80 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center h-full relative">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square h-full w-full max-h-[100px]"
                    >
                        <ResponsiveContainer>
                            <RadarChart
                                data={[{ subject: 'Success', A: analysis?.successRate ?? 0, fullMark: 100 }]}
                                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                innerRadius="35%"
                                outerRadius="100%"
                            >
                                <PolarGrid gridType="circle" stroke="hsl(var(--border) / 0.5)" />
                                <Radar
                                    name="Success Rate"
                                    dataKey="A"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-2xl font-bold text-primary">{analysis?.successRate}%</p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
)

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
      {isLoading ? renderLoading() : renderContent()}
      <Button onClick={onNext} size="lg" className="w-full max-w-xs rounded-full">
        Continue
      </Button>
    </div>
  );
}


function StepCredentials({
  email,
  setEmail,
  password,
  setPassword,
  onComplete,
  isSubmitting,
}: {
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (p: string) => void;
  onComplete: () => void;
  isSubmitting: boolean;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center">
      <div className="w-full max-w-xs space-y-4">
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 bg-secondary/50 rounded-full border-border focus:border-primary"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 bg-secondary/50 rounded-full border-border focus:border-primary"
                placeholder="6+ characters"
            />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full max-w-xs rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating Account..." : "Finish and Create Account"}
      </Button>
    </form>
  );
}

    