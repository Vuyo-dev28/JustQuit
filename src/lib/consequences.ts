
import { LucideIcon, Heart, Users, DollarSign, BrainCircuit, TrendingDown, HeartCrack, Clock, ShieldOff, BrainCog } from 'lucide-react';
import type { AddictionCategory } from './types';

export interface Consequence {
    title: string;
    description: string;
    icon: LucideIcon;
}

export const addictionConsequences: Record<AddictionCategory, Consequence[]> = {
    Porn: [
        {
            title: "Mental Health",
            description: "Can lead to anxiety, depression, and body image issues.",
            icon: BrainCircuit
        },
        {
            title: "Relationships",
            description: "May create unrealistic expectations and intimacy problems.",
            icon: HeartCrack
        },
        {
            title: "Productivity",
            description: "Significant time loss, affecting work, studies, and goals.",
            icon: TrendingDown
        },
        {
            title: "Desensitization",
            description: "Reduces sensitivity to normal sexual stimuli.",
            icon: ShieldOff
        },
    ],
    Alcohol: [
        {
            title: "Physical Health",
            description: "Risk of liver damage, heart problems, and other diseases.",
            icon: Heart
        },
        {
            title: "Social Life",
            description: "Can strain relationships with family and friends.",
            icon: Users
        },
        {
            title: "Financial Cost",
            description: "The expense of regular drinking can add up significantly.",
            icon: DollarSign
        },
        {
            title: "Mental Clarity",
            description: "Impairs judgment, memory, and cognitive function over time.",
            icon: BrainCog
        },
    ],
    Smoking: [
        {
            title: "Serious Health Risks",
            description: "Greatly increases risk of cancer, heart, and lung disease.",
            icon: Heart
        },
        {
            title: "Financial Drain",
            description: "The cumulative cost of cigarettes is a major financial burden.",
            icon: DollarSign
        },
        {
            title: "Social Impact",
            description: "Can affect relationships and social opportunities.",
            icon: Users
        },
        {
            title: "Time Consumption",
            description: "Hours are lost to smoke breaks and managing the habit.",
            icon: Clock
        },
    ],
};
