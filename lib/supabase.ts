import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  city: string;
  role: "remote" | "student" | "entrepreneur" | "creative";
  plan: "free" | "soldier" | "student_plan" | "squad";
  streak_current: number;
  streak_best: number;
  total_sessions: number;
  total_hours: number;
  created_at: string;
}

export interface Session {
  id: string;
  host_id: string;
  partner_id: string | null;
  duration: 25 | 50 | 75;
  mode: "video" | "audio";
  match_type: "anyone" | "city" | "role" | "favorite";
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  status: "open" | "matched" | "active" | "completed" | "cancelled";
  host_goal: string | null;
  partner_goal: string | null;
  host_rating: number | null;
  partner_rating: number | null;
}
