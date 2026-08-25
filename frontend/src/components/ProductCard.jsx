import { formatPrice } from '../data/products'
import { useLanguage } from '../i18n.jsx'

export default function ProductCard({ product, index, onAdd }) {
  const { t } = useLanguage()
  const num = String(index + 1).padStart(2, '0')

  return (
    <article className="card">
      <div
        className="card__media"
        style={{ '--tile': product.accent }}
      >
        <img
          className="card__img"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
        <span className="card__index">{num}</span>
        <div className="card__overlay">
          <p className="card__blurb">{product.blurb}</p>
          <button
            type="button"
            className="card__add"
            onClick={() => onAdd(product.id)}
          >
            {t('addToBag')}
          </button>
        </div>
      </div>
      <div className="card__meta">
        <h3 className="card__name">{product.name}</h3>
        <span className="card__price">{formatPrice(product.price)}</span>
      </div>
    </article>
  )
}
