
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalButtons, OnApproveData } from '@paypal/react-paypal-js';
import { Check, Gem } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Confetti from '@/components/shared/Confetti';

const plans = [
  {
    name: 'Monthly',
    price: '$4.99',
    paypal_plan_id: 'P-1X735652XG788323CMY6227Y', // Replace with your actual monthly plan ID
    features: ['Access to premium articles', 'AI-powered journal analysis', 'Advanced progress tracking', 'Priority support'],
  },
];

export default function SubscribePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(() => {
     if (typeof window !== 'undefined') {
      return localStorage.getItem('isSubscribed') === 'true';
    }
    return false;
  });

  const createSubscription = (data: Record<string, unknown>, actions: any) => {
    return actions.subscription.create({
      plan_id: selectedPlan.paypal_plan_id,
    });
  };

  const onApprove = (data: OnApproveData, actions: any) => {
    console.log('Subscription approved:', data);
    toast({
      title: 'Subscription Successful! 🎉',
      description: "Welcome to Premium! You've unlocked all features.",
    });

    if (typeof window !== 'undefined') {
        localStorage.setItem('isSubscribed', 'true');
    }
    setIsSubscribed(true);
    setShowConfetti(true);

    // We can redirect or update the UI.
    // For now, we'll show a success message and confetti.
    // Redirecting might happen after the confetti animation.
    return Promise.resolve();
  };

  const onError = (err: any) => {
    console.error('PayPal Error:', err);
    toast({
      variant: 'destructive',
      title: 'Oh no! Something went wrong.',
      description: 'There was an issue with your payment. Please try again.',
    });
  };
  
  if (isSubscribed) {
    return (
       <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center text-center h-full">
         {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
        <Gem className="h-16 w-16 text-primary animate-pulse" />
        <h1 className="text-2xl font-bold font-headline">You are a Premium Member!</h1>
        <p className="text-muted-foreground max-w-md">
          Thank you for your support. You have access to all the exclusive features to help you on your journey.
        </p>
        <Button onClick={() => router.push('/premium')}>
            Explore Premium Content
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <header className="text-center">
        <Gem className="mx-auto h-12 w-12 text-primary mb-2" />
        <h1 className="text-2xl font-bold font-headline">Go Premium</h1>
        <p className="text-muted-foreground">
          Unlock powerful tools to supercharge your recovery journey.
        </p>
      </header>

      <div className="flex justify-center">
        <Card className={cn('w-full max-w-sm border-2 border-primary shadow-lg shadow-primary/20')}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{selectedPlan.name}</CardTitle>
            <CardDescription className="text-4xl font-bold text-foreground">{selectedPlan.price}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
                {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary"/>
                        <span className="text-muted-foreground">{feature}</span>
                    </div>
                ))}
            </div>

            <PayPalButtons
              key={selectedPlan.paypal_plan_id}
              style={{ layout: 'vertical', label: 'subscribe' }}
              createSubscription={createSubscription}
              onApprove={onApprove}
              onError={onError}
              disabled={!selectedPlan.paypal_plan_id}
            />
             { !selectedPlan.paypal_plan_id && (
                <p className="text-center text-destructive text-sm">
                    Subscription setup is incomplete. Please contact support.
                </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
