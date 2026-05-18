import { createClient } from "@supabase/supabase-js";

const defaultSupabaseUrl = "https://ussnmxdpxeoshlrdchov.supabase.co";
const defaultSupabaseAnonKey = "sb_publishable_2Qzte6W7e6iAssOyTVRuZA__MNdKR1x";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

export const supabaseStorageBuckets = {
  publicImages: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET_PUBLIC_IMAGES || "public-images",
  articleCovers: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET_ARTICLE_COVERS || "article-covers",
  pageHeroes: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET_PAGE_HEROES || "page-heroes",
  courseImages: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET_COURSE_IMAGES || "course-images",
  jobImages: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET_JOB_IMAGES || "job-images"
};

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function requireSupabaseClient() {
  if (!supabase) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. See .env.example.");
  }
  return supabase;
}
