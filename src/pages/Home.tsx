import { useAuth } from '../auth/AuthContext'
import './Home.css'

export function Home() {
  const { user, cerrarSesion, modoDemo } = useAuth()

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
            Ingresaste correctamente{modoDemo ? ' (modo demo)' : ''}. Por ahora
            esto es solo la pantalla de acceso; los módulos de hemoterapia los
            vamos a ir sumando de a poco.
          </p>
        </section>
      </main>
    </div>
  )
}
