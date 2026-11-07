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
 * Momento (en segundos del video) en que la gota está a mitad de camino,
 * centrada y nítida. Ahí congelamos el video y, sobre esa misma gota del
 * fondo, aparecen los campos del login (sin marco ni dibujo extra).
 */
const TIEMPO_CONGELADO = 1.5

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

  // Congela la gota del fondo a mitad de camino y muestra los campos encima.
  const congelarGota = useCallback(() => {
    const video = videoRef.current
    if (video) {
      try {
        video.pause()
        // Fijamos el frame exacto para que la gota quede siempre igual.
        if (Math.abs(video.currentTime - TIEMPO_CONGELADO) > 0.08) {
          video.currentTime = TIEMPO_CONGELADO
        }
      } catch {
        /* no-op */
      }
    }
    setRevelar(true)
  }, [])

  useEffect(() => {
    if (prefiereMenosMovimiento()) {
      // Sin animación: mostramos directamente la gota congelada.
      const video = videoRef.current
      if (video) {
        const fijar = () => {
          try {
            video.currentTime = TIEMPO_CONGELADO
          } catch {
            /* no-op */
          }
        }
        if (video.readyState >= 1) fijar()
        else video.addEventListener('loadedmetadata', fijar, { once: true })
      }
      setRevelar(true)
      return
    }

    const fallback = window.setTimeout(congelarGota, FALLBACK_MS)

    const video = videoRef.current
    if (video) {
      video.muted = true
      const intento = video.play()
      if (intento && typeof intento.catch === 'function') {
        intento.catch(() => congelarGota())
      }
    }

    return () => window.clearTimeout(fallback)
  }, [congelarGota])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (video && video.currentTime >= TIEMPO_CONGELADO) {
      congelarGota()
    }
  }, [congelarGota])

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
    },
    [email, password, enviando, iniciarSesion],
  )

  return (
    <div className={`login ${revelar ? 'login--revelado' : ''}`}>
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
        onEnded={congelarGota}
        onError={congelarGota}
      />

      <header className="login__marca">
        <span className="login__marca-gota" aria-hidden="true" />
        <span className="login__marca-texto">Sangre</span>
      </header>

      {/* Campos del login, centrados sobre la gota del fondo */}
      <form
        className={`acceso ${revelar ? 'acceso--visible' : ''}`}
        onSubmit={handleSubmit}
        noValidate
        aria-hidden={!revelar}
      >
        <label className="campo">
          <span className="sr-only">Email</span>
          <input
            className="campo__input"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={enviando}
            tabIndex={revelar ? 0 : -1}
            required
          />
        </label>

        <label className="campo campo--pass">
          <span className="sr-only">Contraseña</span>
          <input
            className="campo__input"
            type={verPass ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            aria-label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={enviando}
            tabIndex={revelar ? 0 : -1}
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
        </label>

        <button
          className="boton"
          type="submit"
          disabled={enviando}
          tabIndex={revelar ? 0 : -1}
        >
          {enviando ? (
            <>
              <span className="boton__spinner" aria-hidden="true" />
              Ingresando…
            </>
          ) : (
            'Entrar'
          )}
        </button>

        {error && (
          <p className="acceso__error" role="alert">
            {error}
          </p>
        )}
      </form>

      <div className={`login__pie ${revelar ? 'login__pie--visible' : ''}`}>
        <button type="button" className="login__link" tabIndex={revelar ? 0 : -1}>
          ¿Olvidaste tu contraseña?
        </button>
        {modoDemo && (
          <p className="login__demo">
            Modo demo · email válido y contraseña de 6+ caracteres
          </p>
        )}
      </div>
    </div>
  )
}
