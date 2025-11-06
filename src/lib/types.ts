import type { LucideIcon } from "lucide-react";

export type AddictionCategory = "Porn" | "Alcohol" | "Smoking";

export interface Category {
  id: AddictionCategory;
  name: string;
  icon: LucideIcon;
  description: string;
}
