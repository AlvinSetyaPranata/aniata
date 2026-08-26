const TOKEN_KEY = 'aniata_admin_token'
const BASE = import.meta.env.VITE_API_URL || '/api'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class AuthError extends Error {}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    clearToken()
    throw new AuthError('Session expired or invalid.')
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const message =
      (data && (data.message || (data.errors && JSON.stringify(data.errors)))) ||
      `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

export const api = {
  login: (email, password) =>
    request('/admin/login', { method: 'POST', body: { email, password }, auth: false }),
  logout: () => request('/admin/logout', { method: 'POST' }),
  listProducts: () => request('/admin/products'),
  createProduct: (payload) => request('/admin/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) =>
    request(`/admin/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
}
