import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/**
 * `true` cuando hay credenciales de Supabase cargadas (archivo .env).
 * Si es `false`, la app usa el modo maqueta (login simulado).
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Cliente de Supabase. Es `null` en modo maqueta para que el resto de la app
 * pueda decidir qué camino tomar sin romperse.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
