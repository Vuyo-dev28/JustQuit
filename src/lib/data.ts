
import type { AddictionCategory } from "./types";

export const failureReasons: Record<AddictionCategory, string[]> = {
    Porn: [
        "Unstructured time and boredom",
        "Stress and emotional triggers",
        "Easy access to content online",
        "Lack of accountability",
        "Loneliness or feeling isolated",
        "Viewing social media",
        "Feeling tired or fatigued",
    ],
    Alcohol: [
        "Social pressure and events",
        "Withdrawal symptoms",
        "Using alcohol to cope with stress",
        "Not having a strong support system",
        "Passing by a bar or liquor store",
        "Feelings of anxiety or sadness",
        "Celebratory events",
    ],
    Smoking: [
        "Cravings and nicotine withdrawal",
        "Habitual triggers (e.g., after meals)",
        "Stress or social situations",
        "Believing 'just one' won't hurt",
        "Drinking coffee or alcohol",
        "Seeing others smoke",
        "Feeling anxious or restless",
    ],
};
