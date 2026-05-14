'use client'

import { useSupabaseAuth } from '@/hooks/use-supabase-auth'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  useSupabaseAuth()
  return <>{children}</>
}
