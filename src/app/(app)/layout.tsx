
'use client';

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import BottomNav from "@/components/shared/BottomNav";
import { supabase } from "@/lib/supabase/client";
import SplashScreen from "@/components/shared/SplashScreen";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const isFirstRender = useRef(true);

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
