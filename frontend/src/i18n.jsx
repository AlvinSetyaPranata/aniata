import { createContext, useContext, useState, useCallback } from 'react'

const dict = {
  en: {
    cart: 'Cart',
    cartAria: 'Open cart, {n} item{s}',
    heroEyebrow: 'Autumn Collection — No account required',
    heroTitle: 'Considered\nclothing, kept.',
    heroLede:
      'A small house of pieces made to outlast the season. Choose what you want, it waits in your bag — and stays there long after you leave.',
    heroCta: 'View the collection',
    addToBag: 'Add to bag',
    cartTitle: 'Your cart',
    cartEmpty: 'Nothing here yet. Pick something you like — no account needed.',
    subtotal: 'Subtotal',
    checkout: 'Checkout',
    clear: 'Clear cart',
    remove: 'Remove',
    incAria: 'Increase {name}',
    decAria: 'Decrease {name}',
    closeAria: 'Close cart',
    newIn: 'New in',
    viewAll: 'View all',
    stayClose: 'Stay close',
    signupText: 'A short note when something new lands. No noise, no account.',
    join: 'Join',
    thanks: 'Thank you — we’ll be in touch.',
    shop: 'Shop',
    house: 'The House',
    care: 'Care',
    linkNewIn: 'New in',
    linkClothing: 'Clothing',
    linkObjects: 'Objects',
    linkGift: 'Gift cards',
    linkStory: 'Our story',
    linkSustain: 'Sustainability',
    linkStockists: 'Stockists',
    linkJournal: 'Journal',
    linkShipping: 'Shipping',
    linkReturns: 'Returns',
    linkContact: 'Contact',
    linkFaq: 'FAQ',
    legal: 'Aniata. Made to be kept.',
    loadError: 'Could not load products: {error}',
    viewProduct: 'View',
    qty: 'Qty',
    save: 'Save {pct}%',
    addedToCart: 'Added to cart',
  },
  id: {
    cart: 'Tas',
    cartAria: 'Buka tas, {n} item',
    heroEyebrow: 'Koleksi Musim Gugur — Tanpa akun',
    heroTitle: 'Pakaian\nterurai, dijaga.',
    heroLede:
      'Rumah kecil dari pieces yang dibuat untuk bertahan semusim. Pilih yang Anda inginkan, ia menunggu di tas Anda — dan tetap di sana lama setelah Anda pergi.',
    heroCta: 'Lihat koleksi',
    addToBag: 'Tambah ke tas',
    cartTitle: 'Tas Anda',
    cartEmpty: 'Masih kosong. Pilih yang Anda suka — tanpa akun.',
    subtotal: 'Subtotal',
    checkout: 'Bayar',
    clear: 'Kosongkan tas',
    remove: 'Hapus',
    incAria: 'Tambah {name}',
    decAria: 'Kurangi {name}',
    closeAria: 'Tutup tas',
    newIn: 'Baru',
    viewAll: 'Lihat semua',
    stayClose: 'Tetap terhubung',
    signupText: 'Satu pesan saat ada yang baru. Tanpa spam, tanpa akun.',
    join: 'Gabung',
    thanks: 'Terima kasih — kami akan menghubungi Anda.',
    shop: 'Toko',
    house: 'Rumah',
    care: 'Bantuan',
    linkNewIn: 'Baru',
    linkClothing: 'Pakaian',
    linkObjects: 'Objek',
    linkGift: 'Kartu hadiah',
    linkStory: 'Cerita kami',
    linkSustain: 'Keberlanjutan',
    linkStockists: 'Toko resmi',
    linkJournal: 'Jurnal',
    linkShipping: 'Pengiriman',
    linkReturns: 'Pengembalian',
    linkContact: 'Kontak',
    linkFaq: 'FAQ',
    legal: 'Aniata. Dibuat untuk dijaga.',
    loadError: 'Tidak dapat memuat produk: {error}',
    viewProduct: 'Lihat',
    qty: 'Jml',
    save: 'Hemat {pct}%',
    addedToCart: 'Ditambah ke tas',
  },
}

const STORAGE_KEY = 'aniata_lang'

function readLang() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'id') return v
  } catch {
    /* ignore */
  }
  return 'en'
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readLang)

  const persist = useCallback((next) => {
    setLang(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const setLanguage = useCallback(
    (l) => {
      if (l === 'en' || l === 'id') persist(l)
    },
    [persist],
  )

  const toggle = useCallback(() => {
    persist(lang === 'en' ? 'id' : 'en')
  }, [lang, persist])

  const t = useCallback(
    (key, vars) => {
      let str = dict[lang]?.[key] ?? dict.en[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, v)
        }
      }
      return str
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
