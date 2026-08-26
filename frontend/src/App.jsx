import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ProductCard from './components/ProductCard'
import ProductDetail from './components/ProductDetail'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import Search from './components/Search'
import ProductSkeleton from './components/ProductSkeleton'
import { useCart } from './hooks/useCart'
import { useLanguage } from './i18n.jsx'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export default function App() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products],
  )
  const cart = useCart(productMap)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState(null)

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
    setLastAdded(id)
    window.clearTimeout(handleAdd._t)
    handleAdd._t = window.setTimeout(() => setLastAdded(null), 1600)
  }

  return (
    <div className="block min-h-[100svh] bg-paper text-left">
      <Header
        count={cart.count}
        onOpenCart={() => setDrawerOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
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
        />
      ) : (
        <>
          <Hero />

          <main
            className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-[36px] gap-y-[48px] px-[clamp(22px,5vw,80px)] pb-[110px] pt-[24px] max-[720px]:gap-x-[22px] max-[720px]:gap-y-[36px] max-[720px]:px-[22px]"
            id="collection"
            aria-label="Products"
          >
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : error ? (
              <p className="col-span-full m-0 font-serif text-[16px] italic leading-[1.6] text-muted">
                {t('loadError', { error })}
              </p>
            ) : (
              products.map((product) => (
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

      <div
        className={`fixed bottom-[32px] left-1/2 z-[30] -translate-x-1/2 translate-y-[16px] rounded-full bg-ink px-[22px] py-[14px] font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-paper opacity-0 pointer-events-none transition-[opacity,transform] duration-[250ms] ${
          lastAdded ? 'translate-y-0 opacity-100' : 'opacity-0'
        }`}
        role="status"
      >
        {t('addedToCart')}
      </div>

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
