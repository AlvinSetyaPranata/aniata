import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { useToast } from '../components/Toast.jsx'



const QUICK_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

function toPayload(form) {
  const fd = new FormData()
  fd.append('name', form.name)
  fd.append('price', String(form.price))
  if (form.discount !== '') fd.append('discount', String(form.discount))
  if (form.description.trim()) fd.append('description', form.description.trim())

  let firstImageFile = null
  const seenSizes = new Set()
  form.colors.forEach((c, i) => {
    fd.append(`colors[${i}][name]`, c.name)
    ;(c.sizes ?? []).forEach((s) => fd.append(`colors[${i}][sizes][]`, s))
    ;(c.gallery ?? []).forEach((g) => {
      if (g.file) {
        fd.append(`colors[${i}][images][]`, g.file)
        if (!firstImageFile) firstImageFile = g.file
      } else if (g.url) {
        fd.append(`colors[${i}][existing_images][]`, g.url)
      }
    })
    ;(c.sizes ?? []).forEach((s) => {
      if (!seenSizes.has(s)) {
        seenSizes.add(s)
        fd.append('sizes[]', s)
      }
    })
  })

  if (form.editing) {
    Object.entries(form.stock).forEach(([key, val]) => {
      if (val !== '') fd.append(`stock[${key}]`, String(val))
    })
  }

  if (firstImageFile) fd.append('image', firstImageFile)

  return fd
}

export function ProductForm({ initial, onSubmit, onCancel, busy, error }) {
  const { toast } = useToast()
  const [form, setForm] = useState(() => {
    const colors = (initial?.colors ?? []).map((c) => ({
      name: c.name ?? '',
      gallery: (c.images ?? []).map((url) => ({ url, file: null })),
      sizes: c.sizes ?? [],
    }))
    return {
      editing: !!initial,
      name: initial?.name ?? '',
      price: initial?.price ?? '',
      discount: initial?.discount ?? '',
      description: initial?.description ?? '',
      colors,
      stock: initial?.stock ?? {},
    }
  })

  const [suggestions, setSuggestions] = useState([])
  useEffect(() => {
    api.listColors().then(setSuggestions).catch(() => {})
  }, [])

  const addVariant = (name = '') =>
    setForm((f) => ({
      ...f,
      colors: [...f.colors, { name, gallery: [], sizes: [] }],
    }))
  const addColorSuggestion = (name) => {
    const exists = form.colors.some(
      (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase(),
    )
    if (exists || !name.trim()) return
    addVariant(name.trim())
  }
  const removeSuggestion = async (id) => {
    try {
      await api.deleteColor(id)
    } catch (e) {
      toast(e.message)
      return
    }
    setSuggestions((s) => s.filter((c) => c.id !== id))
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setColorName = (i) => (e) =>
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, j) => (j === i ? { ...c, name: e.target.value } : c)),
    }))
  const removeColor = (i) =>
    setForm((f) => {
      const color = f.colors[i]
      const stock = { ...f.stock }
      Object.keys(stock).forEach((k) => {
        if (k.startsWith(`${color.name}|`)) delete stock[k]
      })
      return { ...f, colors: f.colors.filter((_, j) => j !== i), stock }
    })

  const addVariantImages = (i) => (e) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, j) =>
        j === i
          ? {
              ...c,
              gallery: [
                ...c.gallery,
                ...files.map((file) => ({ url: URL.createObjectURL(file), file })),
              ],
            }
          : c,
      ),
    }))
    e.target.value = ''
  }
  const removeVariantImage = (i, idx) =>
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, j) =>
        j === i
          ? { ...c, gallery: c.gallery.filter((_, k) => k !== idx) }
          : c,
      ),
    }))

  const addVariantSize = (i, value) => {
    const v = value.trim()
    if (!v) return
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, j) => {
        if (j !== i) return c
        const sizes = c.sizes ?? []
        if (sizes.includes(v)) return c
        return { ...c, sizes: [...sizes, v] }
      }),
    }))
  }
  const removeVariantSize = (i, size) =>
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, j) => {
        if (j !== i) return c
        const stock = { ...f.stock }
        Object.keys(stock).forEach((k) => {
          if (k.startsWith(`${c.name}|`) && k.endsWith(`|${size}`)) delete stock[k]
        })
        return { ...c, sizes: (c.sizes ?? []).filter((s) => s !== size) }
      }),
    }))

  const setStock = (key, val) =>
    setForm((f) => ({ ...f, stock: { ...f.stock, [key]: val } }))

  function submit(e) {
    e.preventDefault()
    try {
      onSubmit(toPayload(form))
    } catch (err) {
      onSubmit(Promise.reject(err))
    }
  }

  const field = 'w-full border border-line rounded-lg px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose'
  const label = 'block text-sm font-medium mb-1'
  const showStock = form.editing && form.colors.some((c) => (c.sizes ?? []).length > 0)

  const fmtInput = (v) => {
    const raw = String(v ?? '').replace(/[^\d]/g, '')
    if (raw === '') return ''
    return 'Rp ' + Number(raw).toLocaleString('id-ID')
  }
  const onPrice = (e) => {
    const el = e.target
    const raw = el.value.replace(/\D/g, '')
    setForm((f) => ({ ...f, price: raw }))
    // Restore caret after the formatted value re-renders.
    requestAnimationFrame(() => {
      const caret = el.value.length
      el.setSelectionRange(caret, caret)
    })
  }
  const onDiscount = (e) =>
    setForm((f) => ({ ...f, discount: e.target.value.replace(/[^\d]/g, '') }))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto p-4">
      <form onSubmit={submit} className="my-8 w-full max-w-2xl bg-surface border border-line rounded-xl p-6 shadow-lg">
        <h2 className="font-serif text-2xl mb-4">{form.editing ? 'Edit Produk' : 'Produk Baru'}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={label}>Nama *</label>
            <input className={field} value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className={label}>Harga (IDR) *</label>
            <input
              type="text"
              inputMode="numeric"
              className={field}
              value={fmtInput(form.price)}
              onChange={onPrice}
              required
              placeholder="0"
            />
          </div>
          <div>
            <label className={label}>Diskon ( ditulis tanpa simbol % )</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted select-none pointer-events-none">%</span>
              <input
                type="text"
                inputMode="numeric"
                className="w-full border border-line rounded-lg pl-7 pr-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
                value={form.discount}
                onChange={onDiscount}
                placeholder="0"
              />
            </div>
          </div>
          <div className="col-span-2">
            <label className={label}>Deskripsi</label>
            <textarea className={field} rows={3} value={form.description} onChange={set('description')} />
          </div>
        </div>

        {/* Varian: color + image */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Varian (Warna &amp; Gambar)</label>
            <button type="button" onClick={() => addVariant()} className="text-sm text-rose hover:underline">
              + Tambah Varian
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted mb-1">Pilihan warna tersimpan:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-paper border border-line text-sm"
                  >
                    <button type="button" onClick={() => addColorSuggestion(s.name)}>
                      {s.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSuggestion(s.id)}
                      className="text-rose leading-none"
                      aria-label={`Hapus ${s.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {form.colors.map((c, i) => (
              <div key={i} className="flex items-start gap-3 border border-line rounded-lg p-3">
                <label className="relative h-16 w-16 shrink-0 cursor-pointer grid place-items-center rounded border border-line bg-[#f1ede4] text-2xl text-muted hover:opacity-90">
                  +
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={addVariantImages(i)}
                  />
                </label>
                <div className="flex-1 min-w-0">
                  <input
                    className={field}
                    placeholder="Nama varian (mis. Rose)"
                    value={c.name}
                    onChange={setColorName(i)}
                  />

                  <div className="mt-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {QUICK_SIZES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addVariantSize(i, s)}
                          className="px-2.5 py-1 rounded-full border border-line text-sm hover:bg-paper"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <input
                      className={field}
                      placeholder="Tambah ukuran lalu Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addVariantSize(i, e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(c.sizes ?? []).map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-paper border border-line text-sm"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => removeVariantSize(i, s)}
                            className="text-rose"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {c.gallery.map((g, gi) => (
                      <div key={gi} className="relative">
                        <img
                          src={g.url}
                          alt=""
                          className="h-14 w-14 rounded border border-line object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantImage(i, gi)}
                          className="absolute -top-2 -right-2 bg-rose text-paper rounded-full w-5 h-5 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => removeColor(i)} className="text-rose px-2 mt-1">
                  Hapus
                </button>
              </div>
            ))}
            {form.colors.length === 0 && <p className="text-muted text-sm">Belum ada varian.</p>}
          </div>
        </div>

        {/* Stock (edit only, per variant) */}
        {showStock && (
          <div className="mt-6">
            <label className="text-sm font-medium mb-2 block">Stok per Varian</label>
            <div className="flex flex-col gap-3">
              {form.colors
                .filter((c) => (c.sizes ?? []).length > 0)
                .map((c) => (
                  <div key={c.name} className="border border-line rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">{c.name}</div>
                    <div className="flex flex-wrap gap-3">
                      {c.sizes.map((s) => {
                        const key = `${c.name}|${s}`
                        return (
                          <label key={s} className="flex items-center gap-1 text-sm">
                            <span>{s}</span>
                            <input
                              type="number"
                              min="0"
                              className="w-16 border border-line rounded px-2 py-1 bg-paper"
                              value={form.stock[key] ?? ''}
                              onChange={(e) => setStock(key, e.target.value)}
                            />
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {error && <p className="text-rose text-sm mt-4">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-line hover:bg-paper">
            Batal
          </button>
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-ink text-paper font-medium hover:opacity-90 disabled:opacity-50">
            {busy ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}

const fmtPrice = (n) =>
  'Rp ' + Number(n ?? 0).toLocaleString('id-ID')

export default function Products() {
  const { toast } = useToast()
  const [items, setItems] = useState(null)
  const [modal, setModal] = useState(null) // null | 'new' | product object
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortKey, setSortKey] = useState('newest')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const sorted = useMemo(() => {
    if (!Array.isArray(items)) return []
    const q = query.trim().toLowerCase()
    let list = items.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false
      if (filter === 'sale' && !(p.discount > 0)) return false
      if (filter === 'no-sale' && p.discount > 0) return false
      return true
    })

    const dir = sortDir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'name') {
        return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'id') * dir
      }
      const keyVal = sortKey === 'newest' ? 'id' : sortKey
      return (Number(a[keyVal] ?? 0) - Number(b[keyVal] ?? 0)) * dir
    })
  }, [items, query, filter, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const safePage = Math.min(page, pageCount)
  const visible = useMemo(
    () => sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE),
    [sorted, safePage],
  )

  function setSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
    setPage(1)
  }

  const goPage = (n) => setPage(Math.max(1, Math.min(pageCount, n)))

  const SortTh = ({ active, dir, onClick, children, align = 'text-left' }) => (
    <th className={`font-medium px-4 py-3 ${align}`}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 hover:text-ink transition-colors"
      >
        {children}
        <span className="inline-flex flex-col leading-none text-[9px]">
          <span className={active && dir === 'asc' ? 'text-rose' : 'text-muted/50'}>▲</span>
          <span className={active && dir === 'desc' ? 'text-rose' : 'text-muted/50'}>▼</span>
        </span>
      </button>
    </th>
  )

  function load() {
    api
      .listProducts()
      .then(setItems)
      .catch((e) => toast(e.message))
  }

  useEffect(load, [])

  async function submit(payload) {
    setBusy(true)
    setFormError('')
    const editing = modal && modal !== 'new'
    try {
      if (editing) {
        await api.updateProduct(modal.id, payload)
        toast('Produk diperbarui.')
      } else {
        await api.createProduct(payload)
        toast('Produk ditambahkan.')
      }
      setModal(null)
      load()
    } catch (e) {
      toast(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(p) {
    if (!window.confirm(`Hapus produk "${p.name}"?`)) return
    try {
      await api.deleteProduct(p.id)
      toast(`Produk “${p.name}” dihapus.`)
      load()
    } catch (e) {
      toast(e.message)
    }
  }

  if (!items) return <p className="text-muted p-6">Memuat…</p>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-3xl">Produk</h1>
        <button
          type="button"
          onClick={() => {
            setFormError('')
            setModal('new')
          }}
          className="bg-ink text-paper rounded-lg px-4 py-2.5 font-medium hover:opacity-90"
        >
          + Tambah Produk
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border border-line rounded-xl bg-surface p-10 text-center">
          <p className="text-muted">
            Belum ada produk. Klik “Tambah Produk” di atas untuk membuat produk
            pertama.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Cari nama produk…"
              className="w-full md:flex-1 border border-line rounded-lg px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
            />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setPage(1)
              }}
              className="border border-line rounded-lg px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
            >
              <option value="all">Semua produk</option>
              <option value="sale">Sedang diskon</option>
              <option value="no-sale">Tanpa diskon</option>
            </select>
            <span className="text-sm text-muted whitespace-nowrap">
              Klik judul kolom untuk mengurutkan
            </span>
          </div>

          {visible.length === 0 ? (
            <div className="border border-line rounded-xl bg-surface p-10 text-center">
              <p className="text-muted">
                Tidak ada produk yang cocok dengan pencarian.
              </p>
            </div>
          ) : (
            <>
            <div className="border border-line rounded-xl overflow-hidden bg-surface overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-[#f1ede4] text-muted">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Gambar</th>
                    <SortTh
                      active={sortKey === 'name'}
                      dir={sortDir}
                      onClick={() => setSort('name')}
                    >
                      Nama
                    </SortTh>
                    <SortTh
                      active={sortKey === 'price'}
                      dir={sortDir}
                      onClick={() => setSort('price')}
                    >
                      Harga
                    </SortTh>
                    <SortTh
                      active={sortKey === 'discount'}
                      dir={sortDir}
                      onClick={() => setSort('discount')}
                    >
                      Diskon
                    </SortTh>
                    <th className="text-right font-medium px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        className="h-12 w-10 rounded border border-line object-cover"
                      />
                    ) : (
                      <span
                        className="inline-flex items-center justify-center text-muted"
                        title="Belum ada gambar"
                        aria-label="Belum ada gambar"
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink">{fmtPrice(p.price)}</td>
                  <td className="px-4 py-3 text-ink">
                    {p.discount ? `${p.discount}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setFormError('')
                        setModal(p)
                      }}
                      className="text-rose hover:underline mr-4"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p)}
                      className="text-muted hover:text-rose"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted">
            Menampilkan {sorted.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1}–
            {Math.min(safePage * PER_PAGE, sorted.length)} dari {sorted.length} produk
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goPage(safePage - 1)}
              disabled={safePage <= 1}
              className="px-3 py-1.5 rounded-lg border border-line text-sm hover:bg-paper disabled:opacity-40 disabled:hover:bg-transparent"
            >
              ‹
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1)
              .filter(
                (n) =>
                  n === 1 ||
                  n === pageCount ||
                  Math.abs(n - safePage) <= 1,
              )
              .reduce(
                (acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…')
                  acc.push(n)
                  return acc
                },
                [],
              )
              .map((n, i) =>
                n === '…' ? (
                  <span key={`e${i}`} className="px-2 text-muted text-sm">…</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => goPage(n)}
                    className={`px-3 py-1.5 rounded-lg text-sm border border-transparent ${
                      n === safePage
                        ? 'bg-ink text-paper'
                        : 'hover:bg-paper border-line'
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}
            <button
              type="button"
              onClick={() => goPage(safePage + 1)}
              disabled={safePage >= pageCount}
              className="px-3 py-1.5 rounded-lg border border-line text-sm hover:bg-paper disabled:opacity-40 disabled:hover:bg-transparent"
            >
              ›
            </button>
          </div>
        </div>
            </>
          )
          }
        </>
      )}

      {modal && (
        <ProductForm
          initial={modal === 'new' ? null : modal}
          onSubmit={submit}
          onCancel={() => setModal(null)}
          busy={busy}
          error={formError}
        />
      )}
    </div>
  )
}
