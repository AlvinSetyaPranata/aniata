import { useEffect, useState } from 'react'
import { api, clearToken, getToken, setToken } from './api'
import Login from './pages/Login'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Sidebar from './components/Sidebar'

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export default function App() {
  const [token, setTokenState] = useState(getToken())
  const [ready, setReady] = useState(false)
  const [view, setView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function navigate(key) {
    setView(key)
    setSidebarOpen(false)
  }

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
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-hidden="true"
        />
      )}
      <Sidebar
        view={view}
        setView={navigate}
        onLogout={logout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-line bg-surface sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Buka menu"
            className="p-1.5 -ml-1.5 rounded-lg text-ink hover:bg-paper transition-colors"
          >
            <IconMenu />
          </button>
          <div className="font-serif text-lg leading-none">Aniata</div>
          <div className="text-muted text-[10px] tracking-[0.18em] uppercase mt-1">
            Admin
          </div>
        </div>
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
