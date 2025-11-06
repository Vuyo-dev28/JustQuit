"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, Flame, Settings, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

const leftNavItems = [
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/journal", label: "Journal", icon: BookHeart },
];
const rightNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  // Placeholder for a potential 4th item or to balance the layout
  { href: "/placeholder", label: "Resources", icon: Flame, disabled: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-transparent z-50">
      <div className="relative w-full h-full">
        {/* Main centered button */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 z-20">
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center text-muted-foreground w-20 h-20 rounded-full bg-card border-4 border-background shadow-lg transition-all duration-300",
              "hover:scale-110 hover:text-primary",
              pathname.startsWith("/dashboard") ? "text-primary scale-110" : ""
            )}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Flame className="h-8 w-8" />
            </div>
          </Link>
        </div>

        {/* Arched Background */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-card border-t border-border/80 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex justify-around items-center h-full max-w-md mx-auto px-4">
            {/* Left side */}
            <div className="flex justify-around items-center w-2/5">
              {leftNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center text-muted-foreground w-1/3 transition-colors duration-200",
                      isActive && "text-primary"
                    )}
                  >
                    <item.icon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Spacer for the center button */}
            <div className="w-1/5" />

            {/* Right side */}
            <div className="flex justify-around items-center w-2/5">
                <Link
                  href="/settings"
                  className={cn(
                    "flex flex-col items-center justify-center text-muted-foreground w-1/3 transition-colors duration-200",
                    pathname.startsWith('/settings') && "text-primary"
                  )}
                >
                  <Settings className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">Settings</span>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
