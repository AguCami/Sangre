import type { AuthResult, SessionUser } from './types'

/**
 * Autenticación de MAQUETA (modo demo).
 *
 * Se usa solo cuando NO hay credenciales de Supabase. Permite ver y probar la
 * pantalla en la tablet sin backend. NO valida contra nada real: acepta
 * cualquier email con formato válido y una contraseña de 6+ caracteres.
 *
 * Cuando conectes Supabase (cargando el .env), esta lógica deja de usarse
 * automáticamente y no hay que tocar la UI.
 */

const CLAVE_STORAGE = 'sangre.sesion.demo'

function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function demora(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function leerSesionDemo(): SessionUser | null {
  try {
    const crudo = localStorage.getItem(CLAVE_STORAGE)
    return crudo ? (JSON.parse(crudo) as SessionUser) : null
  } catch {
    return null
  }
}

export async function iniciarSesionDemo(
  email: string,
  password: string,
): Promise<{ result: AuthResult; user: SessionUser | null }> {
  // Simula latencia de red para que la animación de carga se vea real.
  await demora(900)

  const correo = email.trim().toLowerCase()

  if (!esEmailValido(correo)) {
    return { result: { ok: false, error: 'Ingresá un email válido.' }, user: null }
  }
  if (password.length < 6) {
    return {
      result: { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' },
      user: null,
    }
  }

  const user: SessionUser = {
    id: `demo-${correo}`,
    email: correo,
    nombre: correo.split('@')[0],
  }

  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(user))
  } catch {
    /* almacenamiento no disponible: la sesión durará solo esta visita */
  }

  return { result: { ok: true }, user }
}

export function cerrarSesionDemo(): void {
  try {
    localStorage.removeItem(CLAVE_STORAGE)
  } catch {
    /* sin acceso a storage, nada que limpiar */
  }
}
