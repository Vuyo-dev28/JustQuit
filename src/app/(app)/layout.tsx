
'use client';

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { format, isSameDay, startOfDay } from 'date-fns';

import BottomNav from "@/components/shared/BottomNav";
import { supabase } from "@/lib/supabase/client";
import SplashScreen from "@/components/shared/SplashScreen";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { DailyMotivation } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FeatureRequestButton from "@/components/shared/FeatureRequestButton";
import InAppMessageListener from "@/components/shared/InAppMessageListener";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const isFirstRender = useRef(true);
  const [motivation, setMotivation] = useState<DailyMotivation | null>(null);
  const [showMotivation, setShowMotivation] = useState(false);

   const registerForPushNotifications = async (userId: string) => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications are not available in the browser.');
      return;
    }
  
    try {
      let permStatus = await PushNotifications.checkPermissions();
  
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
  
      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }
  
      await PushNotifications.register();
  
      PushNotifications.addListener('pushRegistration', async (token) => {
        console.log('Push registration success, token:', token.value);
        
        const { error } = await supabase
          .from('profiles')
          .update({ push_token: token.value })
          .eq('id', userId);
  
        if (error) {
          console.error('Failed to save push token:', error.message);
          toast({
            variant: "destructive",
            title: "Could Not Save Notification Token",
            description: "You may not receive push notifications.",
          });
        }
      });
  
      PushNotifications.addListener('pushRegistrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
        toast({
            variant: "destructive",
            title: "Notification Registration Failed",
            description: "There was an issue setting up push notifications.",
        });
      });
  
    } catch (e: any) {
      console.error("Push notification setup failed", e);
      toast({
            variant: "destructive",
            title: "Push Notifications Unavailable",
            description: e.message || "Could not initialize push notifications.",
      });
    }
  };

  const fetchDailyMotivation = async () => {
    try {
        const { data, error } = await supabase
            .rpc('get_random_motivation');

        if (error) {
            console.error("Error fetching motivation:", error.message);
            return;
        }

        if (data && data.length > 0) {
            setMotivation(data[0]);
            setShowMotivation(true);
            localStorage.setItem('lastMotivationDate', new Date().toISOString());
        }
    } catch (e: any) {
        console.error("Failed to fetch daily motivation:", e.message);
    }
};


  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error || !session) {
        router.replace("/login");
        return;
      }
      
      await registerForPushNotifications(session.user.id);
      
      const lastMotivationDateStr = localStorage.getItem('lastMotivationDate');
      const today = startOfDay(new Date());

      if (!lastMotivationDateStr || !isSameDay(startOfDay(new Date(lastMotivationDateStr)), today)) {
          await fetchDailyMotivation();
      }

      setIsLoading(false);
      setTimeout(() => {
        if(isMounted) setShowSplash(false);
      }, 4000); // Show splash for 4 seconds
    };

    void init();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [router, toast]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsTransitioning(true);
    const timeout = setTimeout(() => setIsTransitioning(false), 450);

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="relative flex h-screen flex-col">
       <div
        className={cn(
          "fixed inset-0 z-[100] bg-background transition-opacity duration-500",
          showSplash ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <SplashScreen />
      </div>

      <main className="flex-1 overflow-y-auto pb-28">{children}</main>
      <BottomNav />
      <FeatureRequestButton />
      <InAppMessageListener />


      <AlertDialog open={showMotivation} onOpenChange={setShowMotivation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>A Thought for Your Day</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/90 text-lg py-4 italic">
                "{motivation?.quote}"
            </AlertDialogDescription>
             <p className="text-right text-muted-foreground">- {motivation?.author || 'Anonymous'}</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowMotivation(false)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isTransitioning}
      >
        <div className="flex items-center gap-3 rounded-full bg-background/80 px-6 py-3 text-sm font-medium text-foreground shadow-lg backdrop-blur">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Preparing your next view...</span>
        </div>
      </div>
    </div>
  );
}
