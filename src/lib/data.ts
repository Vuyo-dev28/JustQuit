
import type { AddictionCategory } from "./types";

export const failureReasons: Record<AddictionCategory, string[]> = {
    Porn: [
        "Unstructured time and boredom",
        "Stress and emotional triggers",
        "Easy access to content online",
        "Lack of accountability",
    ],
    Alcohol: [
        "Social pressure and events",
        "Withdrawal symptoms",
        "Using alcohol to cope with stress",
        "Not having a strong support system",
    ],
    Smoking: [
        "Cravings and nicotine withdrawal",
        "Habitual triggers (e.g., after meals)",
        "Stress or social situations",
        "Believing 'just one' won't hurt",
    ],
};
