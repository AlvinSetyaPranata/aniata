import { useState } from 'react'

const QUICK_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

function toPayload(form) {
  const fd = new FormData()
  fd.append('name', form.name)
  fd.append('price', String(form.price))
  if (form.discount !== '') fd.append('discount', String(form.discount))
  if (form.blurb.trim()) fd.append('blurb', form.blurb.trim())
  if (form.description.trim()) fd.append('description', form.description.trim())

  form.colors.forEach((c, i) => {
    fd.append(`colors[${i}][name]`, c.name)
    fd.append(`colors[${i}][hex]`, c.hex)
  })
  form.sizes.forEach((s) => fd.append('sizes[]', s))

  if (form.editing) {
    Object.entries(form.stock).forEach(([key, val]) => {
      if (val !== '') fd.append(`stock[${key}]`, String(val))
    })
  }

  if (form.imageFile) fd.append('image', form.imageFile)
  form.galleryFiles.forEach((f) => fd.append('images[]', f))

  return fd
}

export default function ProductForm({ initial, onSubmit, onCancel, busy, error }) {
  const [form, setForm] = useState(() => {
    const colors = (initial?.colors ?? []).map((c) => ({
      name: c.name ?? '',
      hex: c.hex ?? '#000000',
    }))
    const sizes = initial?.sizes ?? []
    return {
      editing: !!initial,
      name: initial?.name ?? '',
      price: initial?.price ?? '',
      discount: initial?.discount ?? '',
      blurb: initial?.blurb ?? '',
      description: initial?.description ?? '',
      colors,
      sizes,
      stock: initial?.stock ?? {},
      imageFile: null,
      imagePreview: initial?.image ?? '',
      galleryFiles: [],
      galleryPreviews: initial?.images ?? [],
    }
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setColor = (i, k) => (e) =>
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, j) => (j === i ? { ...c, [k]: e.target.value } : c)),
    }))
  const addColor = () =>
    setForm((f) => ({ ...f, colors: [...f.colors, { name: '', hex: '#000000' }] }))
  const removeColor = (i) =>
    setForm((f) => {
      const color = f.colors[i]
      const stock = { ...f.stock }
      Object.keys(stock).forEach((k) => {
        if (k.startsWith(`${color.name}|`)) delete stock[k]
      })
      return { ...f, colors: f.colors.filter((_, j) => j !== i), stock }
    })

  const addSize = (value) => {
    const v = value.trim()
    if (!v || form.sizes.includes(v)) return
    setForm((f) => ({ ...f, sizes: [...f.sizes, v] }))
  }
  const removeSize = (size) =>
    setForm((f) => {
      const stock = { ...f.stock }
      Object.keys(stock).forEach((k) => {
        if (k.endsWith(`|${size}`)) delete stock[k]
      })
      return { ...f, sizes: f.sizes.filter((s) => s !== size), stock }
    })

  const onImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm((f) => ({
      ...f,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }))
  }
  const onGallery = (e) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setForm((f) => ({
      ...f,
      galleryFiles: [...f.galleryFiles, ...files],
      galleryPreviews: [...f.galleryPreviews, ...files.map((x) => URL.createObjectURL(x))],
    }))
  }
  const removeGallery = (idx) =>
    setForm((f) => ({
      ...f,
      galleryFiles: f.galleryFiles.filter((_, i) => i !== idx),
      galleryPreviews: f.galleryPreviews.filter((_, i) => i !== idx),
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
  const showStock = form.editing && form.colors.length > 0 && form.sizes.length > 0

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
            <input type="number" className={field} value={form.price} onChange={set('price')} required min="0" />
          </div>
          <div>
            <label className={label}>Diskon %</label>
            <input type="number" className={field} value={form.discount} onChange={set('discount')} min="0" max="100" />
          </div>
          <div className="col-span-2">
            <label className={label}>Cuplikan</label>
            <input className={field} value={form.blurb} onChange={set('blurb')} />
          </div>
          <div className="col-span-2">
            <label className={label}>Deskripsi</label>
            <textarea className={field} rows={3} value={form.description} onChange={set('description')} />
          </div>
        </div>

        {/* Colors */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Warna</label>
            <button type="button" onClick={addColor} className="text-sm text-rose hover:underline">
              + Tambah Warna
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {form.colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="color" value={c.hex} onChange={setColor(i, 'hex')} className="h-9 w-10 rounded border border-line bg-paper p-0.5" />
                <input
                  className={field}
                  placeholder="Nama warna (mis. Rose)"
                  value={c.name}
                  onChange={setColor(i, 'name')}
                />
                <button type="button" onClick={() => removeColor(i)} className="text-rose px-2">
                  Hapus
                </button>
              </div>
            ))}
            {form.colors.length === 0 && <p className="text-muted text-sm">Belum ada warna.</p>}
          </div>
        </div>

        {/* Sizes */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Ukuran</label>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {QUICK_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSize(s)}
                className="px-2.5 py-1 rounded-full border border-line text-sm hover:bg-paper"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={field}
              placeholder="Tambah ukuran lalu Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSize(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.sizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-paper border border-line text-sm">
                {s}
                <button type="button" onClick={() => removeSize(s)} className="text-rose">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Stock (edit only) */}
        {showStock && (
          <div className="mt-6">
            <label className="text-sm font-medium mb-2 block">Stok per Varian</label>
            <div className="overflow-x-auto border border-line rounded-lg">
              <table className="text-sm">
                <thead className="bg-paper text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Warna</th>
                    {form.sizes.map((s) => (
                      <th key={s} className="px-3 py-2 text-left">{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.colors.map((c) => (
                    <tr key={c.name} className="border-t border-line">
                      <td className="px-3 py-2">{c.name}</td>
                      {form.sizes.map((s) => {
                        const key = `${c.name}|${s}`
                        return (
                          <td key={s} className="px-2 py-1">
                            <input
                              type="number"
                              min="0"
                              className="w-16 border border-line rounded px-2 py-1 bg-paper"
                              value={form.stock[key] ?? ''}
                              onChange={(e) => setStock(key, e.target.value)}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Images */}
        <div className="mt-6">
          <label className="text-sm font-medium mb-2 block">Gambar</label>
          <input type="file" accept="image/*" onChange={onImage} className="block w-full text-sm" />
          {form.imagePreview && (
            <img src={form.imagePreview} alt="" className="mt-2 h-24 rounded border border-line object-cover" />
          )}

          <label className="text-sm font-medium mt-4 mb-2 block">Galeri Gambar</label>
          <input type="file" accept="image/*" multiple onChange={onGallery} className="block w-full text-sm" />
          <div className="flex flex-wrap gap-2 mt-2">
            {form.galleryPreviews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="h-20 w-20 rounded border border-line object-cover" />
                <button
                  type="button"
                  onClick={() => removeGallery(i)}
                  className="absolute -top-2 -right-2 bg-rose text-paper rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

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
