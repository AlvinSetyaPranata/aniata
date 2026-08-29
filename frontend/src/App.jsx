import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Loader from './components/Loader'
import Hero from './components/Hero'
import ProductCard from './components/ProductCard'
import ProductDetail from './components/ProductDetail'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import Search from './components/Search'
import ProductSkeleton from './components/ProductSkeleton'
import { useCart } from './hooks/useCart'
import { useLanguage } from './i18n.jsx'
import { useToast } from './components/Toast.jsx'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export default function App() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()
  const { toast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      `${p.name} ${p.blurb ?? ''} ${p.description ?? ''}`
        .toLowerCase()
        .includes(q),
    )
  }, [products, query])
  const cart = useCart(productMap)

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleAdd(id, qty = 1) {
    cart.add(id, qty)
    toast(t('addedToCart'))
  }

  return (
    <div className="block min-h-[100svh] bg-paper text-left">
      <Loader />

      <Header
        count={cart.count}
        onOpenCart={() => setDrawerOpen(true)}
        onOpenSearch={(q) => {
          if (typeof q === 'string') setQuery(q)
          setSearchOpen(true)
        }}
        onCloseSearch={() => setSearchOpen(false)}
        searchOpen={searchOpen}
        query={query}
        onSearch={setQuery}
      />

      {detail ? (
        <ProductDetail
          product={detail}
          products={products}
          onBack={() => setDetail(null)}
          onOpen={setDetail}
          onAdd={handleAdd}
        />
        ) : searchOpen ? (
          <Search
            products={products}
            onClose={() => setSearchOpen(false)}
            onOpen={setDetail}
            onAdd={handleAdd}
            query={query}
            onSearch={setQuery}
          />
        ) : (
        <>
          <Hero />

          <main
            className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-[36px] gap-y-[48px] px-[clamp(22px,5vw,80px)] pb-[110px] pt-[24px] max-[720px]:gap-x-[22px] max-[720px]:gap-y-[36px] max-[720px]:px-[22px]"
            id="collection"
            aria-label="Products"
          >
            {query.trim() && !loading && !error ? (
              <p className="col-span-full m-0 font-sans text-[11px] uppercase tracking-[0.22em] text-muted">
                {t('resultsCount', {
                  n: visible.length,
                  s: visible.length === 1 ? '' : 's',
                })}
              </p>
            ) : null}

            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : error ? (
              <p className="col-span-full m-0 font-serif text-[16px] italic leading-[1.6] text-muted">
                {t('loadError', { error })}
              </p>
            ) : visible.length === 0 ? (
              <p className="col-span-full m-0 font-serif text-[16px] italic leading-[1.6] text-muted">
                {t('noResults')}
              </p>
            ) : (
              visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAdd}
                  onOpen={setDetail}
                />
              ))
            )}
          </main>
        </>
      )}

      <Footer
        products={products}
        hideNewIn={!!detail || searchOpen}
        hideSignup={!!detail || searchOpen}
      />

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lines={cart.lines}
        total={cart.total}
        setQty={cart.setQty}
        remove={cart.remove}
        clear={cart.clear}
      />
    </div>
  )
}
