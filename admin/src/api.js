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
  const token = getToken()
  if (auth && token) headers['Authorization'] = `Bearer ${token}`

  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  let finalBody = body
  if (!isForm && body !== undefined) {
    headers['Content-Type'] = 'application/json'
    finalBody = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? finalBody : undefined,
  })

  if (res.status === 401) {
    clearToken()
    throw new AuthError('Sesi telah berakhir atau tidak valid.')
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    let message
    if (data && data.message) {
      message = data.message
    } else if (data && data.errors) {
      // Validation errors: surface the first field's (Indonesian) message.
      const first = Object.values(data.errors).flat()[0]
      message = first || 'Terjadi kesalahan validasi.'
    } else {
      message = `Permintaan gagal (${res.status}).`
    }
    throw new Error(message)
  }
  return data
}

export const api = {
  login: (email, password) =>
    request('/admin/login', { method: 'POST', body: { email, password }, auth: false }),
  logout: () => request('/admin/logout', { method: 'POST' }),
  changePassword: ({ current, password }) =>
    request('/admin/password', {
      method: 'POST',
      body: { current_password: current, password, password_confirmation: password },
    }),
  getSettings: () => request('/admin/settings'),
  updateSettings: (payload) => request('/admin/settings', { method: 'PUT', body: payload }),
  stats: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null),
    ).toString()
    return request(`/admin/stats${qs ? `?${qs}` : ''}`)
  },
  listProducts: () => request('/admin/products'),
  createProduct: (payload) => request('/admin/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) =>
    request(`/admin/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  listColors: () => request('/admin/colors'),
  createColor: (name) => request('/admin/colors', { method: 'POST', body: { name } }),
  deleteColor: (id) => request(`/admin/colors/${id}`, { method: 'DELETE' }),
}
