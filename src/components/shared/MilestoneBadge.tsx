
'use client';

import { cn } from "@/lib/utils";
import type { Milestone } from "@/lib/milestones";
import { Badge } from "@/components/ui/badge";

interface MilestoneBadgeProps {
    milestone: Milestone;
    isAchieved: boolean;
}

export default function MilestoneBadge({ milestone, isAchieved }: MilestoneBadgeProps) {
    const { icon: Icon, label } = milestone;
    return (
        <div className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 rounded-lg text-center transition-all",
            isAchieved ? "bg-primary/10 border-primary/20 border" : "bg-secondary/50 opacity-60"
        )}>
            <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                isAchieved ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
                <Icon className="w-7 h-7" />
            </div>
            <div className="text-center">
                 <p className={cn(
                    "font-bold text-sm",
                    isAchieved ? "text-primary" : "text-muted-foreground"
                 )}>{label}</p>
                 <p className="text-xs text-muted-foreground">{milestone.days} Days</p>
            </div>
        </div>
    )
}
