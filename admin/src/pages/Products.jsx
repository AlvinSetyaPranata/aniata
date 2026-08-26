import { useEffect, useState } from 'react'
import { api } from '../api'

const EMPTY = {
  name: '',
  slug: '',
  price: '',
  blurb: '',
  description: '',
  accent: '',
  discount: '',
  image: '',
  images: '',
  colors: '',
  sizes: '',
  stock: '',
}

function toPayload(form) {
  const payload = {
    name: form.name,
    price: Number(form.price),
  }
  if (form.slug.trim()) payload.slug = form.slug.trim()
  if (form.blurb.trim()) payload.blurb = form.blurb.trim()
  if (form.description.trim()) payload.description = form.description.trim()
  if (form.accent.trim()) payload.accent = form.accent.trim()
  if (form.discount !== '') payload.discount = Number(form.discount)
  if (form.image.trim()) payload.image = form.image.trim()
  const images = form.images
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  if (images.length) payload.images = images
  for (const key of ['colors', 'sizes', 'stock']) {
    const raw = form[key].trim()
    if (raw) {
      try {
        payload[key] = JSON.parse(raw)
      } catch {
        throw new Error(`${key} must be valid JSON`)
      }
    }
  }
  return payload
}

function ProductForm({ initial, onSubmit, onCancel, busy, error }) {
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY
    return {
      ...EMPTY,
      ...initial,
      price: initial.price ?? '',
      discount: initial.discount ?? '',
      images: Array.isArray(initial.images) ? initial.images.join('\n') : '',
      colors: initial.colors ? JSON.stringify(initial.colors, null, 2) : '',
      sizes: initial.sizes ? JSON.stringify(initial.sizes, null, 2) : '',
      stock: initial.stock ? JSON.stringify(initial.stock, null, 2) : '',
    }
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    try {
      onSubmit(toPayload(form))
    } catch (err) {
      // surfaced by parent via error
      onSubmit(Promise.reject(err))
    }
  }

  const field = 'w-full border border-line rounded-lg px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose'
  const label = 'block text-sm font-medium mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto p-4">
      <form
        onSubmit={submit}
        className="my-8 w-full max-w-2xl bg-surface border border-line rounded-xl p-6 shadow-lg"
      >
        <h2 className="font-serif text-2xl mb-4">{initial ? 'Edit product' : 'New product'}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={label}>Name *</label>
            <input className={field} value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className={label}>Slug (optional)</label>
            <input className={field} value={form.slug} onChange={set('slug')} />
          </div>
          <div>
            <label className={label}>Price (IDR) *</label>
            <input type="number" className={field} value={form.price} onChange={set('price')} required min="0" />
          </div>
          <div>
            <label className={label}>Discount %</label>
            <input type="number" className={field} value={form.discount} onChange={set('discount')} min="0" max="100" />
          </div>
          <div>
            <label className={label}>Accent (hex)</label>
            <input className={field} value={form.accent} onChange={set('accent')} placeholder="#b03052" />
          </div>
          <div className="col-span-2">
            <label className={label}>Blurb</label>
            <input className={field} value={form.blurb} onChange={set('blurb')} />
          </div>
          <div className="col-span-2">
            <label className={label}>Description</label>
            <textarea className={field} rows={3} value={form.description} onChange={set('description')} />
          </div>
          <div className="col-span-2">
            <label className={label}>Image (main URL)</label>
            <input className={field} value={form.image} onChange={set('image')} />
          </div>
          <div className="col-span-2">
            <label className={label}>Images (one URL per line)</label>
            <textarea className={field} rows={3} value={form.images} onChange={set('images')} />
          </div>
          <div className="col-span-2">
            <label className={label}>Colors (JSON)</label>
            <textarea className={field} rows={2} value={form.colors} onChange={set('colors')} placeholder='[{"name":"Rose","hex":"#b03052","images":[]}]' />
          </div>
          <div className="col-span-2">
            <label className={label}>Sizes (JSON array)</label>
            <textarea className={field} rows={2} value={form.sizes} onChange={set('sizes')} placeholder='["S","M","L"]' />
          </div>
          <div className="col-span-2">
            <label className={label}>Stock (JSON object)</label>
            <textarea className={field} rows={2} value={form.stock} onChange={set('stock')} placeholder='{"Rose|S":3,"Rose|M":1}' />
          </div>
        </div>

        {error && <p className="text-rose text-sm mt-4">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-line hover:bg-paper">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-ink text-paper font-medium hover:opacity-90 disabled:opacity-50">
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Products({ onLogout }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    api
      .listProducts()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function save(payloadPromise) {
    setBusy(true)
    setError('')
    Promise.resolve(payloadPromise)
      .then((payload) => {
        const op = editing
          ? api.updateProduct(editing.id, payload)
          : api.createProduct(payload)
        return op
      })
      .then(() => {
        setShowForm(false)
        setEditing(null)
        load()
      })
      .catch((e) => setError(e.message || 'Save failed'))
      .finally(() => setBusy(false))
  }

  function remove(item) {
    if (!confirm(`Delete "${item.name}"?`)) return
    api
      .deleteProduct(item.id)
      .then(load)
      .catch((e) => setError(e.message))
  }

  const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-muted text-sm">{items.length} items</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="bg-ink text-paper px-4 py-2 rounded-lg font-medium hover:opacity-90"
          >
            New product
          </button>
          <button onClick={onLogout} className="border border-line px-4 py-2 rounded-lg hover:bg-paper">
            Log out
          </button>
        </div>
      </header>

      {error && <p className="text-rose text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper text-muted">
              <tr>
                <th className="text-left font-medium px-4 py-3">ID</th>
                <th className="text-left font-medium px-4 py-3">Name</th>
                <th className="text-left font-medium px-4 py-3">Price</th>
                <th className="text-left font-medium px-4 py-3">Discount</th>
                <th className="text-left font-medium px-4 py-3">Slug</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3 text-muted">{p.id}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{fmt(p.price)}</td>
                  <td className="px-4 py-3 text-muted">{p.discount ? `${p.discount}%` : '—'}</td>
                  <td className="px-4 py-3 text-muted">{p.slug}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditing(p)
                        setShowForm(true)
                      }}
                      className="text-ink underline mr-3"
                    >
                      Edit
                    </button>
                    <button onClick={() => remove(p)} className="text-rose underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductForm
          initial={editing}
          busy={busy}
          error={error}
          onSubmit={save}
          onCancel={() => {
            setShowForm(false)
            setEditing(null)
            setError('')
          }}
        />
      )}
    </div>
  )
}
