import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'aniata_cart'

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    /* corrupt entry — start clean */
  }
  return {}
}

function writeStorage(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  } catch {
    /* storage full or unavailable — keep in-memory state */
  }
}

export function useCart(productMap = {}) {
  const [cart, setCart] = useState(readStorage)

  useEffect(() => {
    writeStorage(cart)
  }, [cart])

  const add = useCallback(
    (id, qty = 1) => {
      if (!productMap[id]) return
      setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + qty }))
    },
    [productMap],
  )

  const setQty = useCallback((id, qty) => {
    setCart((prev) => {
      const next = { ...prev }
      if (qty <= 0) delete next[id]
      else next[id] = qty
      return next
    })
  }, [])

  const remove = useCallback((id) => {
    setCart((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const clear = useCallback(() => setCart({}), [])

  const lines = Object.entries(cart)
    .filter(([id]) => productMap[id])
    .map(([id, qty]) => ({ product: productMap[id], qty }))

  const count = lines.reduce((sum, { qty }) => sum + qty, 0)
  const total = lines.reduce((sum, { product, qty }) => sum + product.price * qty, 0)

  return { lines, count, total, add, setQty, remove, clear }
}
