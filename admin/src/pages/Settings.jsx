import { useEffect, useState } from 'react'
import { api } from '../api'
import { useToast } from '../components/Toast.jsx'



const field = 'w-full border border-line rounded-lg px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose'
const label = 'block text-sm font-medium mb-1'

export default function Settings() {
  const { toast } = useToast()
  const [pw, setPw] = useState({ current: '', password: '', confirm: '' })
  const [pwBusy, setPwBusy] = useState(false)

  const [cs, setCs] = useState('')
  const [cashier, setCashier] = useState('')
  const [sameAsCs, setSameAsCs] = useState(false)
  const [csLocked, setCsLocked] = useState(true)
  const [cashierLocked, setCashierLocked] = useState(true)
  const [waBusy, setWaBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api
      .getSettings()
      .then((s) => {
        const c = s.cs_wa ?? ''
        const k = s.cashier_wa ?? ''
        setCs(c)
        setCashier(k)
        setSameAsCs(k !== '' && k === c)
        setCsLocked(c !== '')
        setCashierLocked(k !== '')
      })
      .catch((e) => toast(e.message || 'Gagal memuat pengaturan.'))
      .finally(() => setLoaded(true))
  }, [])

  function submitPassword(e) {
    e.preventDefault()
    setPwBusy(true)
    api
      .changePassword(pw)
      .then(() => {
        toast('Password diperbarui.')
        setPw({ current: '', password: '', confirm: '' })
      })
      .catch((err) => toast(err.message))
      .finally(() => setPwBusy(false))
  }

  function submitWa(e) {
    e.preventDefault()
    setWaBusy(true)
    api
      .updateSettings({ cs_wa: cs, cashier_wa: sameAsCs ? cs : cashier })
      .then(() => {
        toast('Nomor WhatsApp disimpan.')
        setCsLocked(cs !== '')
        setCashierLocked(sameAsCs ? cs !== '' : cashier !== '')
      })
      .catch((err) => toast(err.message))
      .finally(() => setWaBusy(false))
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="font-serif text-2xl">Pengaturan</h1>

      <section className="bg-surface border border-line rounded-xl p-6">
        <h2 className="font-medium mb-4">Kata Sandi</h2>
        <form onSubmit={submitPassword} className="grid grid-cols-1 gap-4">
          <div>
            <label className={label}>Password Saat Ini</label>
            <input
              type="password"
              className={field}
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={label}>Password Baru</label>
            <input
              type="password"
              className={field}
              value={pw.password}
              onChange={(e) => setPw({ ...pw, password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className={label}>Konfirmasi Password Baru</label>
            <input
              type="password"
              className={field}
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={pwBusy}
              className="px-4 py-2 rounded-lg bg-ink text-paper font-medium hover:opacity-90 disabled:opacity-50"
            >
              {pwBusy ? 'Menyimpan…' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-surface border border-line rounded-xl p-6">
        <h2 className="font-medium mb-4">WhatsApp</h2>
        {!loaded ? (
          <p className="text-muted text-sm">Memuat…</p>
        ) : (
          <form onSubmit={submitWa} className="grid grid-cols-1 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <label className={label}>Customer Service</label>
                {cs !== '' && !csLocked && (
                  <button
                    type="button"
                    onClick={() => setCsLocked(true)}
                    className="text-xs text-rose hover:underline"
                  >
                    Sembunyikan
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  className={field}
                  value={cs}
                  onChange={(e) => {
                    setCs(e.target.value)
                    if (sameAsCs) setCashier(e.target.value)
                  }}
                  placeholder="62812xxxxxx"
                  readOnly={csLocked}
                  disabled={csLocked}
                />
                {csLocked && (
                  <button
                    type="button"
                    onClick={() => setCsLocked(false)}
                    className="shrink-0 px-3 py-2 rounded-lg border border-line hover:bg-paper text-sm text-ink"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sameAsCs}
                onChange={(e) => {
                  setSameAsCs(e.target.checked)
                  if (e.target.checked) {
                    setCashier(cs)
                    setCashierLocked(true)
                  }
                }}
              />
              Gunakan nomor yang sama dengan CS
            </label>
            <div>
              <div className="flex items-center justify-between">
                <label className={label}>Kasir</label>
                {cashier !== '' && !cashierLocked && (
                  <button
                    type="button"
                    onClick={() => setCashierLocked(true)}
                    className="text-xs text-rose hover:underline"
                  >
                    Sembunyikan
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  className={field}
                  value={cashier}
                  disabled={sameAsCs || cashierLocked}
                  onChange={(e) => setCashier(e.target.value)}
                  placeholder="62812xxxxxx"
                  readOnly={!sameAsCs && cashierLocked}
                />
                {!sameAsCs && cashierLocked && (
                  <button
                    type="button"
                    onClick={() => setCashierLocked(false)}
                    className="shrink-0 px-3 py-2 rounded-lg border border-line hover:bg-paper text-sm text-ink"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={waBusy}
                className="px-4 py-2 rounded-lg bg-ink text-paper font-medium hover:opacity-90 disabled:opacity-50"
              >
                {waBusy ? 'Menyimpan…' : 'Simpan Nomor'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
