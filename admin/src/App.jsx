import { useEffect, useState } from 'react'
import { api, clearToken, getToken, setToken } from './api'
import Login from './pages/Login'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Sidebar from './components/Sidebar'

export default function App() {
  const [token, setTokenState] = useState(getToken())
  const [ready, setReady] = useState(false)
  const [view, setView] = useState('dashboard')

  useEffect(() => {
    // Verify any stored token is still valid.
    if (!getToken()) {
      setReady(true)
      return
    }
    api
      .listProducts()
      .then(() => setReady(true))
      .catch(() => {
        clearToken()
        setTokenState(null)
        setReady(true)
      })
  }, [])

  function login(email, password) {
    return api.login(email, password).then(({ token }) => {
      setToken(token)
      setTokenState(token)
    })
  }

  function logout() {
    return api
      .logout()
      .catch(() => {})
      .finally(() => {
        clearToken()
        setTokenState(null)
      })
  }

  if (!ready) return null
  if (!token) return <Login onLogin={login} />

  return (
    <div className="flex min-h-screen">
      <Sidebar view={view} setView={setView} onLogout={logout} />
      <main className="flex-1 min-w-0">
        {view === 'settings' ? (
          <Settings />
        ) : view === 'dashboard' ? (
          <Dashboard />
        ) : (
          <Products />
        )}
      </main>
    </div>
  )
}
