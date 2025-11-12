
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
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

import type { AddictionCategory, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { analyzeUserProblems, type AnalyzeUserProblemsOutput } from "@/ai/flows/analyze-user-problems";
import { Skeleton } from "@/components/ui/skeleton";
import { failureReasons } from "@/lib/data";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";


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

const totalSteps = 13;

const questions = [
    { id: 'welcome', title: "Let's Get Started", description: "Take the first step towards a healthier, happier you. Let's triumph over vice together." },
    { id: 'category', title: 'Question #1', description: 'What are we tackling?' },
    { id: 'name', title: 'Question #2', description: 'What should we call you?' },
    { id: 'gender', title: 'Question #3', description: 'What is your gender?' },
    { id: 'age', title: 'Question #4', description: 'How old are you?' },
    { id: 'social', title: 'Question #5', description: 'Which social media platform do you use the most?'},
    { id: 'goals', title: 'Question #6', description: 'What are your primary goals?'},
    { id: 'triggers', title: 'Question #7', description: 'What are your relapse triggers?'},
    { id: 'motivation', title: 'Question #8', description: 'Why do you want to be free?'},
    { id: 'analysis', title: 'Your Personal Analysis', description: 'Based on your answers, here is a starting point for your journey.' },
    { id: 'goal', title: 'Question #9', description: 'What is your initial goal?' },
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
    if (step === 12 && selectedCategory) {
      const categoryTextMap = {
        Porn: 'watch porn',
        Alcohol: 'drink alcohol',
        Smoking: 'smoke'
      }
      return `Finally, promise yourself that you will never ${categoryTextMap[selectedCategory]} again.`
    }
    return currentQuestion.description;
  }
  
  const signupData = {
      category: selectedCategory,
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
                 {step === totalSteps || step === 10 ? <div className="w-9 h-9"/> : (
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
                {step === 4 && <StepGender gender={gender} setGender={setGender} onNext={handleNext} />}
                {step === 5 && <StepAge age={age} setAge={setAge} onNext={handleNext} />}
                {step === 6 && <StepSocial socialPlatform={socialPlatform} setSocialPlatform={setSocialPlatform} onNext={handleNext} />}
                {step === 7 && <StepChooseGoals chosenGoals={chosenGoals} setChosenGoals={setChosenGoals} onNext={handleNext} />}
                {step === 8 && <StepTriggers category={selectedCategory} triggers={triggers} setTriggers={setTriggers} onNext={handleNext} />}
                {step === 9 && <StepMotivation motivation={motivation} setMotivation={setMotivation} onNext={handleNext} />}
                {step === 10 && <StepAiAnalysis data={signupData} onNext={handleNext} />}
                {step === 11 && <StepGoal goal={goal} setGoal={setGoal} onNext={handleNext} />}
                {step === 12 && <StepSignature onNext={handleNext} />}
                {step === 13 && (
                  <StepCredentials
                    email={email}
                    password={password}
                    setEmail={setEmail}
                    setPassword={setPassword}
                    isSubmitting={isSubmitting}
                    onComplete={handleCompleteSignup}
                  />
                )}
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

const chartData = [
  { trigger: "Stress", prevalence: 85 },
  { trigger: "Boredom", prevalence: 70 },
  { trigger: "Social", prevalence: 60 },
  { trigger: "Habit", prevalence: 55 },
  { trigger: "Loneliness", prevalence: 45 },
];

const chartConfig = {
  prevalence: {
    label: "Prevalence",
    color: "hsl(var(--primary))",
  },
};


function StepAiAnalysis({ data, onNext }: { data: any, onNext: () => void }) {
    const [analysis, setAnalysis] = useState<AnalyzeUserProblemsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getAnalysis = async () => {
            try {
                setIsLoading(true);
                const result = await analyzeUserProblems(data);
                setAnalysis(result);
            } catch (error) {
                console.error("Error fetching AI analysis:", error);
                // Fallback content in case of error
                setAnalysis({
                    summary: "We couldn't generate your analysis right now, but that's okay. The most important thing is that you're here and ready to start.",
                    stats: "Many people face similar challenges, and taking this first step is a sign of great strength."
                });
            } finally {
                setIsLoading(false);
            }
        };

        getAnalysis();
    }, [data]);

    return (
        <div className="space-y-6 animate-in fade-in-0 duration-500 flex flex-col items-center text-left">
            <Card className="w-full max-w-md bg-secondary/30">
                <CardContent className="p-6 space-y-4">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <br/>
                            <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-1/2" />
                        </>
                    ) : (
                        <>
                            <div>
                                <h3 className="font-semibold mb-2 text-primary">Your Personal Snapshot</h3>
                                <p className="text-foreground/90">{analysis?.summary}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 text-primary">You're Not Alone</h3>
                                <p className="text-foreground/90">{analysis?.stats}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

             <Card className="w-full max-w-md bg-secondary/30">
                <CardHeader>
                    <CardTitle className="text-lg">Context: Common Triggers</CardTitle>
                    <CardDescription>
                        This chart shows illustrative data on how common certain triggers are.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-48 w-full">
                        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
                             <defs>
                                <linearGradient id="fillPrevalence" x1="0" y1="0" x2="1" y2="0">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-prevalence)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-prevalence)"
                                    stopOpacity={0.1}
                                />
                                </linearGradient>
                            </defs>
                            <CartesianGrid horizontal={false} />
                            <YAxis 
                                dataKey="trigger" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                            />
                            <XAxis type="number" hide={true} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="prevalence" fill="url(#fillPrevalence)" radius={5} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>


             <Button onClick={onNext} size="lg" className="w-full max-w-xs rounded-full">
                Continue to Final Step
            </Button>
        </div>
    );
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


function StepCredentials({
  email,
  password,
  setEmail,
  setPassword,
  isSubmitting,
  onComplete,
}: {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  isSubmitting: boolean;
  onComplete: () => void;
}) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete();
    }
  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-0 duration-500 flex flex-col items-center">
        <div className="grid gap-2 text-left w-full max-w-xs">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-12 bg-secondary/50 rounded-lg border-border focus:border-primary"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
        </div>
        <div className="grid gap-2 text-left w-full max-w-xs">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-12 bg-secondary/50 rounded-lg border-border focus:border-primary"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
        </div>
         <Button type="submit" size="lg" className="w-full max-w-xs rounded-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Complete Sign Up"}
        </Button>
      </form>
  );
}

    

    

    