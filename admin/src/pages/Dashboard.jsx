import { useEffect, useState } from 'react'
import { api } from '../api'
import { useToast } from '../components/Toast.jsx'

const fmt = (n) => 'Rp ' + Number(n ?? 0).toLocaleString('id-ID')

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 2023 }, (_, i) => CURRENT_YEAR - i)

export default function Dashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')

  useEffect(() => {
    api
      .stats({ year, month })
      .then(setStats)
      .catch((e) => toast(e.message))
  }, [year, month])

  if (!stats) return <p className="text-muted">Memuat…</p>

  const periodLabel =
    month && year
      ? `${MONTHS[Number(month) - 1]} ${year}`
      : year
        ? `${year}`
        : 'Semua periode'

  const cards = [
    { label: 'Total Produk', value: stats.total_products },
    { label: 'Produk Diskon', value: stats.on_sale },
    { label: 'Total Stok', value: stats.total_stock.toLocaleString('id-ID') },
    { label: 'Varian Habis', value: stats.out_of_stock_variants },
    { label: 'Harga Rata-rata', value: fmt(stats.price_avg) },
    { label: 'Nilai Inventori', value: fmt(stats.inventory_value) },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-serif text-3xl mb-6">Dasbor</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface border border-line rounded-xl p-5">
            <div className="text-muted text-sm">{c.label}</div>
            <div className="font-serif text-2xl mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-surface border border-line rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif text-xl">Produk Paling Sering Checkout</h2>
            <span className="text-muted text-sm">Periode: {periodLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-line rounded-lg px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose text-sm"
            >
              <option value="">Semua bulan</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-line rounded-lg px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose text-sm"
            >
              <option value="">Semua tahun</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-4">
          <span className="text-muted text-sm">
            {stats.total_units_checked_out?.toLocaleString('id-ID') ?? 0} unit total
          </span>
        </div>

        <ul className="space-y-3">
          {(stats.top_checked_out ?? []).map((p) => {
            const max = (stats.top_checked_out ?? [])[0]?.units ?? 0
            const pct = max > 0 ? Math.max(4, Math.round((p.units / max) * 100)) : 0
            return (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-40 truncate text-sm text-ink" title={p.name}>
                  {p.name}
                </span>
                <div className="flex-1 h-5 rounded bg-[#f1ede4] overflow-hidden">
                  <div
                    className="h-full bg-rose transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-medium text-ink">
                  {p.units}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
