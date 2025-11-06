
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mic, Newspaper, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

const premiumContent = [
    {
        title: "AI Journal Analysis",
        description: "Get deep insights from your journal entries, identifying patterns and triggers.",
        icon: BrainCircuit,
        comingSoon: false,
    },
    {
        title: "Exclusive Articles & Guides",
        description: "Access a library of content written by experts on recovery and well-being.",
        icon: Newspaper,
        comingSoon: false,
    },
    {
        title: "Guided Audio Meditations",
        description: "Listen to calming audio sessions to manage cravings and stress.",
        icon: Mic,
        comingSoon: true,
    }
]

export default function PremiumPage() {
    const router = useRouter();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSubscription = () => {
            if (typeof window !== 'undefined') {
                const subscribed = localStorage.getItem('isSubscribed') === 'true';
                setIsSubscribed(subscribed);
                if (!subscribed) {
                    // Redirect after a short delay to show the message
                    setTimeout(() => router.push('/subscribe'), 2000);
                }
            }
            setIsLoading(false);
        };

        checkSubscription();
    }, [router]);

    if (isLoading) {
        return (
             <div className="p-4 flex items-center justify-center h-full">
                <p className="text-muted-foreground">Checking subscription status...</p>
            </div>
        )
    }

    if (!isSubscribed) {
        return (
            <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center text-center h-full">
                <Lock className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold font-headline">Access Denied</h1>
                <p className="text-muted-foreground max-w-md">
                    This is a premium feature. Please subscribe to unlock this content and more.
                </p>
                <p className="text-sm text-muted-foreground">Redirecting you to the subscription page...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-2xl font-bold font-headline">Premium Content</h1>
                <p className="text-muted-foreground">
                    Explore your exclusive features and content.
                </p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                {premiumContent.map((item, index) => (
                    <Card key={index} className="relative overflow-hidden">
                        {item.comingSoon && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                                SOON
                            </div>
                        )}
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                            <div className="p-3 bg-secondary rounded-lg">
                                <item.icon className="h-6 w-6 text-secondary-foreground" />
                            </div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                            <Button disabled={item.comingSoon}>
                                {item.comingSoon ? "Coming Soon" : "Access Now"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
