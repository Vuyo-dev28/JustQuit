
import { Award, ShieldCheck, Star, Trophy, Medal, Gem, LucideIcon } from "lucide-react";

export interface Milestone {
    days: number;
    label: string;
    icon: LucideIcon;
}

export const milestones: Milestone[] = [
    { days: 10, label: "Bronze", icon: Medal },
    { days: 20, label: "Silver", icon: Medal },
    { days: 30, label: "Gold", icon: Medal },
    { days: 40, label: "Star I", icon: Star },
    { days: 50, label: "Star II", icon: Star },
    { days: 60, label: "Star III", icon: Star },
    { days: 70, label: "Guardian", icon: ShieldCheck },
    { days: 80, label: "Champion", icon: Trophy },
    { days: 90, label: "Legend", icon: Award },
    { days: 100, label: "Diamond", icon: Gem },
];
