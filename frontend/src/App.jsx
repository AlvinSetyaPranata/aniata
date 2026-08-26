import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ProductCard from './components/ProductCard'
import ProductDetail from './components/ProductDetail'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import { useCart } from './hooks/useCart'
import { useLanguage } from './i18n.jsx'
import './store.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export default function App() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const { t } = useLanguage()

  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products],
  )
  const cart = useCart(productMap)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [lastAdded, setLastAdded] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(setProducts)
      .catch((err) => setError(err.message))
  }, [])

  function handleAdd(id, qty = 1) {
    cart.add(id, qty)
    setLastAdded(id)
    window.clearTimeout(handleAdd._t)
    handleAdd._t = window.setTimeout(() => setLastAdded(null), 1600)
  }

  const detail = detailId ? productMap[detailId] : null

  return (
    <div className="store">
      <Header count={cart.count} onOpenCart={() => setDrawerOpen(true)} />

      {detail ? (
        <ProductDetail
          product={detail}
          products={products}
          onBack={() => setDetailId(null)}
          onOpen={setDetailId}
          onAdd={handleAdd}
        />
      ) : (
        <>
          <Hero />

          <main className="grid" id="collection" aria-label="Products">
            {error && <p className="grid__error">{t('loadError', { error })}</p>}
            {!error &&
              products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onAdd={handleAdd}
                  onOpen={setDetailId}
                />
              ))}
          </main>
        </>
      )}

      <Footer products={products} />

      <div className={`toast ${lastAdded ? 'toast--show' : ''}`} role="status">
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
