
'use client';

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';


import BottomNav from "@/components/shared/BottomNav";
import { supabase } from "@/lib/supabase/client";
import SplashScreen from "@/components/shared/SplashScreen";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


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

      setIsLoading(false);
      setTimeout(() => {
        if(isMounted) setShowSplash(false);
      }, 2000); // Show splash for 2 seconds
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
  }, [router]);

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
