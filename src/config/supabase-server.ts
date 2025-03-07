import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Export environment variables
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return ''
        },
        set(name: string, value: string, options: any) {
          // Cookies are handled by middleware
        },
        remove(name: string, options: any) {
          // Cookies are handled by middleware
        },
      },
    }
  )
} 