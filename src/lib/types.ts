import type { LucideIcon } from "lucide-react";

export type AddictionCategory = "Porn" | "Alcohol" | "Smoking";

export interface Category {
  id: AddictionCategory;
  name: string;
  icon: LucideIcon;
  description: string;
}

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  addiction_category: AddictionCategory | null;
  gender: string | null;
  age_range: string | null;
  social_platform: string | null;
  goals: string[] | null;
  triggers: string[] | null;
  motivation: string | null;
  goal_days: number;
  pledge: string | null;
  profile_image_url: string | null;
  push_token: string | null;
  current_streak: number;
  longest_streak: number;
  slip_up_count: number;
  last_log_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  logged_date: string;
  success: boolean;
  note: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  gratitude: string | null;
  feeling: string | null;
  victory: string | null;
  created_at: string;
}

export interface ForumPost {
  id: string;
  user_id: string;
  message: string;
  likes_count: number;
  created_at: string;
  profiles?: {
    display_name: string | null;
    profile_image_url: string | null;
  } | null;
  forum_post_likes?: ForumPostLike[];
  forum_replies?: ForumReply[];
}

export interface ForumPostLike {
  id: string;
  user_id: string;
}

export interface ForumReply {
  id: string;
  user_id: string;
  post_id: string;
  message: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    profile_image_url: string | null;
  } | null;
}

export interface DailyMotivation {
    id: number;
    quote: string;
    author: string;
}

export interface FeatureRequest {
  id: string;
  user_id: string;
  request: string;
  created_at: string;
}
