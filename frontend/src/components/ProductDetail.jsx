import { useEffect, useRef, useState } from 'react'
import { formatPrice, effectivePrice } from '../data/products'
import { useLanguage } from '../i18n.jsx'

export default function ProductDetail({ product, onClose, onAdd }) {
  const { t } = useLanguage()
  const closeRef = useRef(null)
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)

  const gallery = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : []
  const discounted = product.discount > 0
  const price = effectivePrice(product)

  useEffect(() => {
    setActive(0)
    setQty(1)
  }, [product.id])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="pd" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="pd__scrim" onClick={onClose} />
      <div className="pd__panel">
        <button
          ref={closeRef}
          type="button"
          className="pd__close"
          onClick={onClose}
          aria-label={t('closeAria')}
        >
          ✕
        </button>

        <div className="pd__media">
          <div className="pd__stage">
            {discounted && <span className="pd__badge">−{product.discount}%</span>}
            {gallery[active] && (
              <img src={gallery[active]} alt={product.name} />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="pd__thumbs">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`pd__thumb ${i === active ? 'is-active' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`${product.name} ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd__body">
          <h2 className="pd__name">{product.name}</h2>
          <div className="pd__price">
            {discounted ? (
              <>
                <s>{formatPrice(product.price)}</s>
                <strong>{formatPrice(price)}</strong>
                <span className="pd__save">{t('save', { pct: product.discount })}</span>
              </>
            ) : (
              <strong>{formatPrice(price)}</strong>
            )}
          </div>

          {product.description && (
            <p className="pd__desc">{product.description}</p>
          )}

          <div className="pd__buy">
            <div className="pd__qty">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label={t('decAria', { name: product.name })}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  setQty(v > 0 ? v : 1)
                }}
                aria-label={t('qty')}
              />
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label={t('incAria', { name: product.name })}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="pd__add"
              onClick={() => onAdd(product.id, qty)}
            >
              {t('addToBag')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
