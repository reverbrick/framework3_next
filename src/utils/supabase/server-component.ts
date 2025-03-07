import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export const createServerSupabaseClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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