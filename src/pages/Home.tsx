import { useCallback, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import './Home.css'

type EstadoCamara = 'idle' | 'probando' | 'ok' | 'error'

export function Home() {
  const { user, cerrarSesion, modoDemo } = useAuth()
  const [camara, setCamara] = useState<EstadoCamara>('idle')
  const [detalleCamara, setDetalleCamara] = useState<string>('')

  // Prueba rápida de permiso de cámara (base para escanear bolsas / QR / DNI).
  const probarCamara = useCallback(async () => {
    setCamara('probando')
    setDetalleCamara('')
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Este navegador no expone la cámara.')
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      const etiqueta = stream.getVideoTracks()[0]?.label || 'Cámara disponible'
      // Liberamos la cámara: esto es solo una prueba de permiso.
      stream.getTracks().forEach((t) => t.stop())
      setDetalleCamara(etiqueta)
      setCamara('ok')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo acceder a la cámara.'
      setDetalleCamara(
        location.protocol !== 'https:' && location.hostname !== 'localhost'
          ? 'La cámara necesita HTTPS. Serví la app por https:// o localhost.'
          : msg,
      )
      setCamara('error')
    }
  }, [])

  return (
    <div className="home">
      <header className="home__barra">
        <div className="home__marca">
          <span className="home__gota" aria-hidden="true" />
          <span>Sangre</span>
        </div>
        <button className="home__salir" onClick={() => void cerrarSesion()}>
          Cerrar sesión
        </button>
      </header>

      <main className="home__main">
        <section className="home__bienvenida">
          <h1 className="home__titulo">
            Hola{user?.nombre ? `, ${user.nombre}` : ''} 👋
          </h1>
          <p className="home__sub">
            Ingresaste correctamente{modoDemo ? ' (modo demo)' : ''}. Esta es la
            base de la app; desde acá vamos a construir los módulos de
            hemoterapia.
          </p>
        </section>

        <section className="home__panel">
          <h2 className="home__panel-titulo">Prueba de cámara</h2>
          <p className="home__panel-texto">
            Verificá que la tablet da acceso a la cámara (lo vamos a usar para
            escanear bolsas, códigos QR/barras o documentos).
          </p>

          <button
            className="home__boton"
            onClick={() => void probarCamara()}
            disabled={camara === 'probando'}
          >
            {camara === 'probando' ? 'Solicitando permiso…' : 'Probar cámara'}
          </button>

          {camara === 'ok' && (
            <p className="home__estado home__estado--ok">
              ✓ Cámara habilitada — {detalleCamara}
            </p>
          )}
          {camara === 'error' && (
            <p className="home__estado home__estado--error">✕ {detalleCamara}</p>
          )}
        </section>
      </main>
    </div>
  )
}
