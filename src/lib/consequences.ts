
import { LucideIcon, Heart, Users, DollarSign, BrainCircuit, TrendingDown, HeartCrack, Clock } from 'lucide-react';
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
    ],
    Smoking: [
        { 
            title: "Serious Health Risks", 
            description: "Greatly increases risk of cancer, heart, and lung disease.",
            icon: Heart
        },
        { 
            title: "Time & Money", 
            description: "Habitual smoking consumes both your time and financial resources.",
            icon: Clock
        },
        { 
            title: "Social Impact", 
            description: "Can affect relationships and social opportunities.",
            icon: Users
        },
    ],
};

    