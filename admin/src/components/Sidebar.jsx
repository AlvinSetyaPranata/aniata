import { useState } from 'react'

export default function Sidebar({ view, setView, onLogout }) {
  const items = [
    { key: 'dashboard', label: 'Dasbor' },
    { key: 'products', label: 'Produk' },
  ]

  return (
    <aside className="w-60 shrink-0 bg-surface border-r border-line p-4 flex flex-col min-h-screen">
      <div className="font-serif text-2xl mb-8 px-2">Aniata</div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = view === item.key
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={
                'text-left px-3 py-2 rounded-lg font-medium ' +
                (active
                  ? 'bg-ink text-paper'
                  : 'text-ink hover:bg-paper')
              }
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      <button
        onClick={onLogout}
        className="mt-auto px-3 py-2 rounded-lg text-rose hover:bg-paper text-left"
      >
        Keluar
      </button>
    </aside>
  )
}
