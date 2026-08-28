import { formatPrice, effectivePrice } from '../data/products'
import { useLanguage } from '../i18n.jsx'

export default function ProductCard({ product, onAdd, onOpen }) {
  const { t } = useLanguage()
  const cover = product.images?.length ? product.images[0] : product.image
  const discounted = product.discount > 0
  const hasVariants = (product.colors?.length || product.sizes?.length) > 0

  function quickAdd(e) {
    e.stopPropagation()
    if (hasVariants) onOpen(product)
    else onAdd(product.id)
  }

  return (
    <article
      className="group flex flex-col"
      style={{ '--tile': product.accent }}
    >
      <div
        className="group relative aspect-[3/4] overflow-hidden border border-line bg-[linear-gradient(160deg,#e9e6df_0%,#dcd8ce_100%)] after:absolute after:inset-0 after:z-[1] after:content-[''] after:bg-[color-mix(in_srgb,var(--tile)_16%,transparent)] after:opacity-0 after:transition-opacity after:duration-[450ms] group-hover:after:opacity-100 group-focus-within:after:opacity-100 max-[720px]:after:opacity-100"
        onClick={() => onOpen(product)}
        aria-label={`${product.name} — ${t('viewProduct')}`}
      >
        {discounted && (
          <span className="absolute right-[16px] top-[16px] z-[3] rounded-full bg-rose px-[9px] py-[6px] font-semibold text-[10px] leading-none tracking-[0.1em] text-paper">
            −{product.discount}%
          </span>
        )}
        <img
          className="absolute inset-0 z-0 block h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-focus-within:scale-[1.04]"
          src={cover}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.opacity = '0'
          }}
        />
        <div className="absolute inset-x-0 bottom-0 z-[2] flex translate-y-[101%] flex-col gap-[16px] bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-paper)_94%,transparent),transparent)] p-[22px] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-within:translate-y-0 max-[720px]:translate-y-0">
          <p className="m-0 font-serif text-[15px] italic leading-[1.5] text-ink">
            {product.blurb}
          </p>
          <div className="flex items-center gap-[18px]">
            <button
              type="button"
              className="self-start border-0 border-b border-ink bg-transparent pb-[5px] font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-ink cursor-pointer transition-opacity duration-200 hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[5px]"
              onClick={(e) => {
                e.stopPropagation()
                onOpen(product)
              }}
            >
              {t('viewProduct')}
            </button>
            <button
              type="button"
              className="self-start border-0 border-b border-rose bg-transparent pb-[5px] font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-rose cursor-pointer transition-opacity duration-200 hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[5px]"
              onClick={quickAdd}
            >
              {t('addToBag')}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-[16px] flex items-baseline justify-between gap-[14px] border-t border-line px-[2px] pt-[16px]">
        <h3 className="m-0 font-serif text-[20px] tracking-[0.01em] text-ink">
          {product.name}
        </h3>
        <span className="whitespace-nowrap font-medium text-[12px] leading-none tracking-[0.08em] text-muted">
          {discounted ? (
            <span className="inline-flex items-baseline gap-[8px]">
              <s className="font-medium text-muted">{formatPrice(product.price)}</s>
              <strong className="font-semibold text-rose">
                {formatPrice(effectivePrice(product))}
              </strong>
            </span>
          ) : (
            formatPrice(product.price)
          )}
        </span>
      </div>
    </article>
  )
}
