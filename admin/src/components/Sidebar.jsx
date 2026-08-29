function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function IconProducts() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

const ITEMS = [
  { key: 'dashboard', label: 'Dasbor', Icon: IconDashboard },
  { key: 'products', label: 'Produk', Icon: IconProducts },
  { key: 'settings', label: 'Pengaturan', Icon: IconSettings },
]

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function Sidebar({ view, setView, onLogout, open, onClose }) {
  return (
    <aside
      className={
        'fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-surface border-r border-line flex flex-col min-h-screen transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:z-auto ' +
        (open ? 'translate-x-0' : '-translate-x-full')
      }
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <div className="font-serif text-lg leading-none">Aniata</div>
          <div className="text-muted text-[10px] tracking-[0.18em] uppercase mt-1">
            Admin
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Tutup menu"
          className="lg:hidden -mr-1 p-1.5 rounded-lg text-muted hover:bg-paper hover:text-ink transition-colors"
        >
          <IconClose />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {ITEMS.map(({ key, label, Icon }) => {
          const active = view === key
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              className={
                'relative flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ' +
                (active
                  ? 'bg-paper text-ink font-medium'
                  : 'text-muted hover:bg-paper hover:text-ink')
              }
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-rose" />
              )}
              <Icon />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-line">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left text-sm text-muted hover:text-rose hover:bg-paper transition-colors"
        >
          <IconLogout />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
