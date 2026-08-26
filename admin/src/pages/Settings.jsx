import { useEffect, useState } from 'react'
import { api } from '../api'

const field = 'w-full border border-line rounded-lg px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose'
const label = 'block text-sm font-medium mb-1'

export default function Settings() {
  const [pw, setPw] = useState({ current: '', password: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [pwBusy, setPwBusy] = useState(false)

  const [cs, setCs] = useState('')
  const [cashier, setCashier] = useState('')
  const [sameAsCs, setSameAsCs] = useState(false)
  const [waMsg, setWaMsg] = useState('')
  const [waErr, setWaErr] = useState('')
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
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  function submitPassword(e) {
    e.preventDefault()
    setPwBusy(true)
    setPwMsg('')
    setPwErr('')
    api
      .changePassword(pw)
      .then(() => {
        setPwMsg('Password diperbarui.')
        setPw({ current: '', password: '', confirm: '' })
      })
      .catch((err) => setPwErr(err.message))
      .finally(() => setPwBusy(false))
  }

  function submitWa(e) {
    e.preventDefault()
    setWaBusy(true)
    setWaMsg('')
    setWaErr('')
    api
      .updateSettings({ cs_wa: cs, cashier_wa: sameAsCs ? cs : cashier })
      .then(() => setWaMsg('Nomor WhatsApp disimpan.'))
      .catch((err) => setWaErr(err.message))
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
          {pwMsg && <p className="text-green-600 text-sm">{pwMsg}</p>}
          {pwErr && <p className="text-rose text-sm">{pwErr}</p>}
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
              <label className={label}>Customer Service</label>
              <input
                className={field}
                value={cs}
                onChange={(e) => {
                  setCs(e.target.value)
                  if (sameAsCs) setCashier(e.target.value)
                }}
                placeholder="62812xxxxxx"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sameAsCs}
                onChange={(e) => {
                  setSameAsCs(e.target.checked)
                  if (e.target.checked) setCashier(cs)
                }}
              />
              Gunakan nomor yang sama dengan CS
            </label>
            <div>
              <label className={label}>Kasir</label>
              <input
                className={field}
                value={cashier}
                disabled={sameAsCs}
                onChange={(e) => setCashier(e.target.value)}
                placeholder="62812xxxxxx"
              />
            </div>
            {waMsg && <p className="text-green-600 text-sm">{waMsg}</p>}
            {waErr && <p className="text-rose text-sm">{waErr}</p>}
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
