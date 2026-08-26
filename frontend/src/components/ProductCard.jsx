import { formatPrice, effectivePrice } from '../data/products'
import { useLanguage } from '../i18n.jsx'

export default function ProductCard({ product, index, onAdd, onOpen }) {
  const { t } = useLanguage()
  const cover = product.images?.length ? product.images[0] : product.image
  const discounted = product.discount > 0

  return (
    <article className="card" style={{ '--tile': product.accent }}>
      <div
        className="card__media"
        onClick={() => onOpen(product)}
        aria-label={`${product.name} — ${t('viewProduct')}`}
      >
        <span className="card__index">{String(index + 1).padStart(2, '0')}</span>
        {discounted && (
          <span className="card__badge">−{product.discount}%</span>
        )}
        <img className="card__img" src={cover} alt={product.name} loading="lazy" />
        <div className="card__overlay">
          <p className="card__blurb">{product.blurb}</p>
          <div className="card__actions">
            <button
              type="button"
              className="card__view"
              onClick={(e) => {
                e.stopPropagation()
                onOpen(product)
              }}
            >
              {t('viewProduct')}
            </button>
            <button
              type="button"
              className="card__add"
              onClick={(e) => {
                e.stopPropagation()
                onAdd(product.id)
              }}
            >
              {t('addToBag')}
            </button>
          </div>
        </div>
      </div>

      <div className="card__meta">
        <h3 className="card__name">{product.name}</h3>
        <span className="card__price">
          {discounted ? (
            <span className="card__price-wrap">
              <s>{formatPrice(product.price)}</s>
              <strong>{formatPrice(effectivePrice(product))}</strong>
            </span>
          ) : (
            formatPrice(product.price)
          )}
        </span>
      </div>
    </article>
  )
}
