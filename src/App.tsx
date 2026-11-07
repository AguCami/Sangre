import { useAuth } from './auth/AuthContext'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import './App.css'

export function App() {
  const { user, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="splash">
        <div className="splash__gota" aria-hidden="true" />
        <p className="splash__texto">Cargando…</p>
      </div>
    )
  }

  return user ? <Home /> : <Login />
}
