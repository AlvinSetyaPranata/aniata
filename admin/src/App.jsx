import { useEffect, useState } from 'react'
import { api, clearToken, getToken, setToken } from './api'
import Login from './pages/Login'
import Products from './pages/Products'

export default function App() {
  const [token, setTokenState] = useState(getToken())
  const [ready, setReady] = useState(false)

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

  return <Products onLogout={logout} />
}
