import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { useAuth } from '../auth/AuthContext'
import './Login.css'

/**
 * Momento (en segundos del video) en que la gota pasa por la mitad del
 * recorrido. Ahí revelamos el formulario, como si "emergiera" de la gota.
 * La gota se desprende ~1.0s e impacta ~2.4s → la mitad cae cerca de 1.5s.
 */
const TIEMPO_REVELADO = 1.5

/** Si el video no puede autoreproducirse, igual mostramos el login. */
const FALLBACK_MS = 2600

function prefiereMenosMovimiento(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

export function Login() {
  const { iniciarSesion, modoDemo } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [revelar, setRevelar] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPass, setVerPass] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mostrarFormulario = useCallback(() => setRevelar(true), [])

  // Sincroniza el revelado con la caída de la gota (o lo fuerza si no hay video).
  useEffect(() => {
    if (prefiereMenosMovimiento()) {
      mostrarFormulario()
      return
    }

    const fallback = window.setTimeout(mostrarFormulario, FALLBACK_MS)

    const video = videoRef.current
    if (video) {
      video.muted = true
      const intento = video.play()
      if (intento && typeof intento.catch === 'function') {
        // Autoplay bloqueado → mostramos el login igual.
        intento.catch(() => mostrarFormulario())
      }
    }

    return () => window.clearTimeout(fallback)
  }, [mostrarFormulario])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (video && video.currentTime >= TIEMPO_REVELADO) {
      setRevelar(true)
    }
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (enviando) return
      setError(null)
      setEnviando(true)
      const res = await iniciarSesion(email, password)
      if (!res.ok) {
        setError(res.error ?? 'No se pudo iniciar sesión.')
        setEnviando(false)
      }
      // Si ok, el AuthProvider cambia la vista; no hace falta apagar "enviando".
    },
    [email, password, enviando, iniciarSesion],
  )

  return (
    <div className="login">
      <video
        ref={videoRef}
        className="login__video"
        poster="/login-poster.jpg"
        src="/login-bg.mp4"
        muted
        playsInline
        preload="auto"
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setRevelar(true)}
        onError={mostrarFormulario}
      />

      {/* Oscurecido para legibilidad, se intensifica al aparecer el login */}
      <div
        className={`login__velo ${revelar ? 'login__velo--activo' : ''}`}
        aria-hidden="true"
      />

      <header className="login__marca">
        <span className="login__gota" aria-hidden="true" />
        <span className="login__marca-texto">Sangre</span>
      </header>

      <main className="login__centro">
        <form
          className={`tarjeta ${revelar ? 'tarjeta--visible' : ''}`}
          onSubmit={handleSubmit}
          noValidate
          // Oculto para lectores de pantalla y teclado hasta que se revela
          aria-hidden={!revelar}
        >
          <div className="tarjeta__brillo" aria-hidden="true" />

          <h1 className="tarjeta__titulo">Ingresá a tu cuenta</h1>
          <p className="tarjeta__subtitulo">Hemoterapia · acceso profesional</p>

          <label className="campo">
            <span className="campo__label">Email</span>
            <input
              className="campo__input"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="nombre@institucion.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={enviando}
              required
            />
          </label>

          <label className="campo">
            <span className="campo__label">Contraseña</span>
            <div className="campo__pass">
              <input
                className="campo__input"
                type={verPass ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={enviando}
                required
              />
              <button
                type="button"
                className="campo__ver"
                onClick={() => setVerPass((v) => !v)}
                aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={revelar ? 0 : -1}
              >
                {verPass ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </label>

          {error && (
            <p className="tarjeta__error" role="alert">
              {error}
            </p>
          )}

          <button className="boton" type="submit" disabled={enviando}>
            {enviando ? (
              <>
                <span className="boton__spinner" aria-hidden="true" />
                Ingresando…
              </>
            ) : (
              'Ingresar'
            )}
          </button>

          <button type="button" className="tarjeta__link" tabIndex={revelar ? 0 : -1}>
            ¿Olvidaste tu contraseña?
          </button>

          {modoDemo && (
            <p className="tarjeta__demo">
              Modo demo · cualquier email válido y contraseña de 6+ caracteres
            </p>
          )}
        </form>
      </main>
    </div>
  )
}
