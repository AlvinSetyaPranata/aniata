import { useEffect, useState } from 'react'
import { formatPrice, effectivePrice } from '../data/products'
import { useLanguage } from '../i18n.jsx'
import ProductCard from './ProductCard'

export default function ProductDetail({ product, products, onBack, onOpen, onAdd }) {
  const { t } = useLanguage()
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')

  const discounted = product.discount > 0
  const price = effectivePrice(product)

  const colors = product.colors ?? []
  const sizes = product.sizes ?? []
  const hasVariants = colors.length > 0 || sizes.length > 0

  const stockOf = (c, s) =>
    product.stock ? (product.stock[`${c}|${s}`] ?? 0) : null

  const colorObj = colors.find((c) => c.name === color)
  const gallerySource = colorObj?.images?.length
    ? colorObj.images
    : product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : []
  const gallery = gallerySource

  useEffect(() => {
    setActive(0)
    setQty(1)
    let c = colors[0]?.name ?? ''
    let s = ''
    if (c) {
      s = sizes.find((sz) => stockOf(c, sz) > 0) ?? sizes[0] ?? ''
    } else if (sizes.length) {
      s = sizes[0]
    }
    setColor(c)
    setSize(s)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [product.id])

  function pickColor(c) {
    setColor(c)
    setActive(0)
    if (sizes.length) {
      const ok = sizes.find((sz) => stockOf(c, sz) > 0)
      setSize(ok ?? sizes[0])
    }
  }

  const stock = hasVariants ? stockOf(color, size) : null
  const soldOut = stock === 0
  const variant = hasVariants ? { color, size } : {}

  const recommendations = products.filter((p) => p.id !== product.id).slice(0, 4)

  return (
    <article className="pd">
      <div className="pd__inner">
        <button type="button" className="pd__back" onClick={onBack}>
          <span aria-hidden="true">←</span> {t('back')}
        </button>

        <div className="pd__main">
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
            <h1 className="pd__name">{product.name}</h1>
            <div className="pd__price">
              {discounted ? (
                <>
                  <s>{formatPrice(product.price)}</s>
                  <strong>{formatPrice(price)}</strong>
                  <span className="pd__save">
                    {t('save', { pct: product.discount })}
                  </span>
                </>
              ) : (
                <strong>{formatPrice(price)}</strong>
              )}
            </div>

            {product.description && (
              <p className="pd__desc">{product.description}</p>
            )}

            {hasVariants && (
              <div className="pd__opts">
                {colors.length > 0 && (
                  <div className="pd__opt">
                    <span className="pd__opt-label">
                      {t('selectColor')}
                      {color && <em> — {color}</em>}
                    </span>
                    <div className="pd__swatches">
                      {colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          className={`pd__swatch ${
                            color === c.name ? 'is-active' : ''
                          }`}
                          style={{ '--swatch': c.hex }}
                          onClick={() => pickColor(c.name)}
                          aria-pressed={color === c.name}
                          aria-label={`${t('selectColor')} ${c.name}`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div className="pd__opt">
                    <span className="pd__opt-label">{t('selectSize')}</span>
                    <div className="pd__sizes">
                      {sizes.map((s) => {
                        const out = stockOf(color, s) === 0
                        return (
                          <button
                            key={s}
                            type="button"
                            className={`pd__size ${size === s ? 'is-active' : ''}`}
                            onClick={() => setSize(s)}
                            disabled={out}
                            aria-pressed={size === s}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <p className={`pd__stock ${soldOut ? 'is-out' : ''}`}>
                  {soldOut
                    ? t('outOfStock')
                    : stock != null
                      ? stock <= 5
                        ? t('lowStock', { n: stock })
                        : t('inStock')
                      : ''}
                </p>
              </div>
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
                onClick={() => onAdd(product.id, qty, variant)}
                disabled={soldOut}
              >
                {t('addToBag')}
              </button>
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <section className="pd__rec" aria-label={t('youMayLike')}>
            <h2 className="pd__rec-title">{t('youMayLike')}</h2>
            <div className="pd__rec-grid">
              {recommendations.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  onAdd={onAdd}
                  onOpen={onOpen}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
