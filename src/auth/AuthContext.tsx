import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import {
  cerrarSesionDemo,
  iniciarSesionDemo,
  leerSesionDemo,
} from './mockAuth'
import type { AuthContextValue, SessionUser } from './types'

const AuthContext = createContext<AuthContextValue | null>(null)

function mapearUsuarioSupabase(
  id: string,
  email: string | undefined,
  meta: Record<string, unknown> | undefined,
): SessionUser {
  return {
    id,
    email: email ?? '',
    nombre:
      (meta?.nombre as string | undefined) ??
      (meta?.full_name as string | undefined) ??
      email?.split('@')[0],
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [cargando, setCargando] = useState(true)

  // Verificación de sesión al abrir la app.
  useEffect(() => {
    let activo = true

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (!activo) return
        const s = data.session
        setUser(
          s
            ? mapearUsuarioSupabase(
                s.user.id,
                s.user.email,
                s.user.user_metadata,
              )
            : null,
        )
        setCargando(false)
      })

      const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
        setUser(
          s
            ? mapearUsuarioSupabase(
                s.user.id,
                s.user.email,
                s.user.user_metadata,
              )
            : null,
        )
      })

      return () => {
        activo = false
        sub.subscription.unsubscribe()
      }
    }

    // Modo maqueta
    setUser(leerSesionDemo())
    setCargando(false)
    return () => {
      activo = false
    }
  }, [])

  const iniciarSesion = useCallback(
    async (email: string, password: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) {
          return { ok: false, error: traducirError(error.message) }
        }
        if (data.user) {
          setUser(
            mapearUsuarioSupabase(
              data.user.id,
              data.user.email,
              data.user.user_metadata,
            ),
          )
        }
        return { ok: true }
      }

      const { result, user: u } = await iniciarSesionDemo(email, password)
      if (result.ok && u) setUser(u)
      return result
    },
    [],
  )

  const cerrarSesion = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    } else {
      cerrarSesionDemo()
    }
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      cargando,
      modoDemo: !isSupabaseConfigured,
      iniciarSesion,
      cerrarSesion,
    }),
    [user, cargando, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function traducirError(mensaje: string): string {
  const m = mensaje.toLowerCase()
  if (m.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }
  if (m.includes('email not confirmed')) {
    return 'Tenés que confirmar tu email antes de ingresar.'
  }
  if (m.includes('network')) {
    return 'Sin conexión. Revisá tu internet e intentá de nuevo.'
  }
  return mensaje
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
