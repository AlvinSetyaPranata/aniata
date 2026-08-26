import { useEffect, useState } from 'react'
import { api } from '../api'

const fmt = (n) => 'Rp ' + Number(n ?? 0).toLocaleString('id-ID')

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="text-rose">{error}</p>
  if (!stats) return <p className="text-muted">Memuat…</p>

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
        <h2 className="font-serif text-xl mb-2">Penjualan</h2>
        <p className="text-muted text-sm leading-relaxed">
          Pencatatan penjualan belum tersedia. Kasir toko menggunakan WhatsApp untuk
          checkout, sehingga pesanan tidak disimpan di server — statistik di atas
          mencakup produk dan nilai inventori, bukan transaksi aktual. Hubungi
          pengembang jika ingin mengaktifkan pelacakan pesanan.
        </p>
      </div>
    </div>
  )
}
