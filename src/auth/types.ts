export interface SessionUser {
  id: string
  email: string
  nombre?: string
}

export interface AuthResult {
  ok: boolean
  error?: string
}

export interface AuthContextValue {
  user: SessionUser | null
  /** Carga inicial: estamos verificando si ya hay una sesión abierta. */
  cargando: boolean
  /** `true` cuando no hay backend real (login simulado). */
  modoDemo: boolean
  iniciarSesion: (email: string, password: string) => Promise<AuthResult>
  cerrarSesion: () => Promise<void>
}
