import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  user_id: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  created_at: string
}
