import { useCallback, useEffect, useState } from 'react'
import { effectivePrice } from '../data/products'

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

function variantKey(id, variant = {}) {
  const color = variant?.color || ''
  const size = variant?.size || ''
  return `${id}::${color}::${size}`
}

export function useCart(productMap = {}) {
  const [cart, setCart] = useState(readStorage)

  useEffect(() => {
    writeStorage(cart)
  }, [cart])

  const add = useCallback(
    (id, qty = 1, variant = {}) => {
      if (!productMap[id]) return
      const key = variantKey(id, variant)
      setCart((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + qty }))
    },
    [productMap],
  )

  const setQty = useCallback((key, qty) => {
    setCart((prev) => {
      const next = { ...prev }
      if (qty <= 0) delete next[key]
      else next[key] = qty
      return next
    })
  }, [])

  const remove = useCallback((key) => {
    setCart((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const clear = useCallback(() => setCart({}), [])

  const lines = Object.entries(cart)
    .map(([key, qty]) => {
      const [id, color, size] = key.split('::')
      const product = productMap[id]
      if (!product) return null
      return { key, product, qty, color, size }
    })
    .filter(Boolean)

  const count = lines.reduce((sum, { qty }) => sum + qty, 0)
  const total = lines.reduce(
    (sum, { product, qty }) => sum + effectivePrice(product) * qty,
    0,
  )

  return { lines, count, total, add, setQty, remove, clear }
}
