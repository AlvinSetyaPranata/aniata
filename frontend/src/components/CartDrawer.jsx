import { useEffect, useRef } from 'react'
import { formatPrice, effectivePrice } from '../data/products'
import { useLanguage } from '../i18n.jsx'

export default function CartDrawer({
  open,
  onClose,
  lines,
  total,
  setQty,
  remove,
  clear,
}) {
  const closeRef = useRef(null)
  const { t } = useLanguage()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`drawer ${open ? 'drawer--open' : ''}`} aria-hidden={!open}>
      <div className="drawer__scrim" onClick={onClose} />
      <aside
        className="drawer__panel"
        role="dialog"
        aria-label={t('cartTitle')}
        aria-modal="true"
      >
        <div className="drawer__head">
          <h2 className="drawer__title">{t('cartTitle')}</h2>
          <button
            ref={closeRef}
            type="button"
            className="drawer__close"
            onClick={onClose}
            aria-label={t('closeAria')}
          >
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="drawer__empty">{t('cartEmpty')}</p>
        ) : (
          <>
            <ul className="drawer__lines">
              {lines.map(({ product, qty }) => (
                <li key={product.id} className="line">
                  <img
                    className="line__tile"
                    src={product.image}
                    alt=""
                    loading="lazy"
                    style={{ '--tile': product.accent }}
                  />
                  <div className="line__info">
                    <span className="line__name">{product.name}</span>
                    <span className="line__price">
                      {product.discount ? (
                        <span className="line__price-wrap">
                          <s>{formatPrice(product.price)}</s>
                          <strong>{formatPrice(effectivePrice(product))}</strong>
                        </span>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </span>
                  </div>
                  <div className="line__qty">
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty - 1)}
                      aria-label={t('decAria', { name: product.name })}
                    >
                      −
                    </button>
                    <span aria-live="polite">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty + 1)}
                      aria-label={t('incAria', { name: product.name })}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="line__remove"
                    onClick={() => remove(product.id)}
                    aria-label={`${t('remove')} ${product.name}`}
                  >
                    {t('remove')}
                  </button>
                </li>
              ))}
            </ul>

            <div className="drawer__foot">
              <div className="drawer__total">
                <span>{t('subtotal')}</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <button type="button" className="drawer__checkout">
                {t('checkout')}
              </button>
              <button
                type="button"
                className="drawer__clear"
                onClick={clear}
              >
                {t('clear')}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
