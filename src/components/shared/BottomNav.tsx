
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, Link as LinkIcon, MessageSquare, Settings, TrendingUp, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/journal", label: "Journal", icon: BookHeart },
  { href: "/premium", label: "Premium", icon: Gem },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Map<string, HTMLAnchorElement | null>>(new Map());

  useEffect(() => {
    const updateIndicator = () => {
        if (!navRef.current) return;

        const activeItem = navItems.find(item => pathname.startsWith(item.href));
        const activeElement = activeItem ? itemsRef.current.get(activeItem.href) : null;
        
        if (activeElement) {
            const navRect = navRef.current.getBoundingClientRect();
            const { offsetLeft, offsetWidth } = activeElement;
            setIndicatorStyle({
                left: `${offsetLeft}px`,
                width: `${offsetWidth}px`,
            });
        }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);

    const observer = new MutationObserver(updateIndicator);
    if(navRef.current) {
        observer.observe(navRef.current, { childList: true, subtree: true });
    }

    return () => {
        window.removeEventListener('resize', updateIndicator);
        observer.disconnect();
    };
}, [pathname]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!navRef.current) return;
    const { offsetLeft, offsetWidth } = e.currentTarget;
    setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
    });
  };

  const handleMouseLeave = () => {
    const activeItem = navItems.find(item => pathname.startsWith(item.href));
    const activeElement = activeItem ? itemsRef.current.get(activeItem.href) : null;
    if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setIndicatorStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
        });
    }
  };


  const leftNavItems = navItems.slice(0, 2);
  const rightNavItems = navItems.slice(3);
  const premiumItem = navItems[2];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-transparent z-50">
      <div className="relative w-full h-full">
        {/* Main centered button */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 z-20">
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center text-muted-foreground w-20 h-20 rounded-full bg-background border-4 border-background shadow-lg transition-all duration-300",
              "hover:scale-110 hover:text-primary",
              pathname.startsWith("/dashboard") ? "text-primary scale-110" : ""
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 transition-transform duration-500 ease-bounce relative overflow-hidden",
               pathname.startsWith("/dashboard") ? "scale-110" : "scale-100"
            )}>
              <div className="absolute inset-0 bg-primary/20 opacity-50 rounded-full animate-pulse"></div>
              <LinkIcon className="h-8 w-8 z-10" />
            </div>
          </Link>
        </div>

        {/* Arched Background */}
        <div 
          ref={navRef}
          onMouseLeave={handleMouseLeave}
          className="absolute bottom-0 left-0 right-0 h-16 bg-card border-t border-border/80 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
        >
          <div className="relative flex justify-between items-center h-full max-w-md mx-auto px-2">
             <div 
                className="absolute top-0 h-full bg-primary/10 rounded-md transition-all duration-300 ease-in-out"
                style={indicatorStyle}
             />
            {/* Left side */}
            <div className="flex justify-around items-center w-2/5">
              {leftNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={el => itemsRef.current.set(item.href, el)}
                    onMouseEnter={handleMouseEnter}
                    className={cn(
                      "relative z-10 flex flex-col items-center justify-center text-muted-foreground w-1/2 py-2 transition-colors duration-200",
                      isActive && "text-primary"
                    )}
                  >
                    <item.icon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Premium Button - moved to be between the gaps */}
            <div className="w-1/5 flex justify-center">
                 <Link
                    key={premiumItem.href}
                    href={premiumItem.href}
                    ref={el => itemsRef.current.set(premiumItem.href, el)}
                    onMouseEnter={handleMouseEnter}
                    className={cn(
                      "relative z-10 flex flex-col items-center justify-center text-muted-foreground transition-colors duration-200",
                      pathname.startsWith(premiumItem.href) && "text-primary"
                    )}
                  >
                    <premiumItem.icon className="h-6 w-6" />
                  </Link>
            </div>

            {/* Right side */}
            <div className="flex justify-around items-center w-2/5">
               {rightNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={el => itemsRef.current.set(item.href, el)}
                    onMouseEnter={handleMouseEnter}
                    className={cn(
                      "relative z-10 flex flex-col items-center justify-center text-muted-foreground w-1/2 py-2 transition-colors duration-200",
                      isActive && "text-primary"
                    )}
                  >
                    <item.icon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
