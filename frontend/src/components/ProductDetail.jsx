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
    <article className="px-[clamp(22px,5vw,80px)] pb-[110px] pt-[24px]">
      <div className="mx-auto max-w-[1200px] animate-pd-rise">
        <button
          type="button"
          className="mb-[28px] mt-[8px] inline-flex items-center gap-[8px] border-0 bg-transparent p-0 font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-muted cursor-pointer transition-colors duration-[180ms] hover:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[5px]"
          onClick={onBack}
        >
          <span aria-hidden="true">←</span> {t('back')}
        </button>

        <div className="grid grid-cols-[1.05fr_0.95fr] items-start gap-[clamp(28px,5vw,72px)] max-[720px]:grid-cols-1">
          <div className="min-w-0">
            <div className="relative aspect-[3/4] overflow-hidden bg-[linear-gradient(160deg,#e9e6df,#dcd8ce)]">
              {discounted && (
                <span className="absolute left-[16px] top-[16px] z-[2] rounded-full bg-rose px-[10px] py-[7px] font-semibold text-[11px] leading-none tracking-[0.1em] text-paper">
                  −{product.discount}%
                </span>
              )}
              {gallery[active] && (
                <img
                  className="absolute inset-0 block h-full w-full object-cover"
                  src={gallery[active]}
                  alt={product.name}
                />
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex flex-wrap gap-[10px] p-[14px]">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={
                      'h-[80px] w-[64px] cursor-pointer overflow-hidden border border-line bg-transparent p-0 outline-2 outline-offset-[-2px] outline-transparent transition-[outline-color] duration-[180ms] after:absolute after:inset-[-5px] after:content-[""] after:rounded-full after:border after:border-transparent after:transition-[border-color] after:duration-[150ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose focus-visible:outline-offset-2 [&.is-active]:after:border-ink ' +
                      (i === active ? 'is-active' : '')
                    }
                    onClick={() => setActive(i)}
                    aria-label={`${product.name} ${i + 1}`}
                  >
                    <img className="block h-full w-full object-cover" src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-[18px] pb-[8px]">
            <h1 className="m-0 font-serif text-[clamp(28px,4vw,40px)] leading-[1.04] tracking-[0.01em] text-ink">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-[12px] font-medium text-[14px] leading-none text-muted">
              {discounted ? (
                <>
                  <s className="text-muted">{formatPrice(product.price)}</s>
                  <strong className="font-serif text-[28px] tracking-normal text-ink">
                    {formatPrice(price)}
                  </strong>
                  <span className="rounded-full border border-rose px-[10px] py-[6px] font-semibold text-[11px] leading-none tracking-[0.08em] uppercase text-rose">
                    {t('save', { pct: product.discount })}
                  </span>
                </>
              ) : (
                <strong className="font-serif text-[28px] tracking-normal text-ink">
                  {formatPrice(price)}
                </strong>
              )}
            </div>

            {product.description && (
              <p className="m-0 font-sans text-[16px] leading-[1.7] text-muted">
                {product.description}
              </p>
            )}

            {hasVariants && (
              <div className="mt-[4px] flex flex-col gap-[20px]">
                {colors.length > 0 && (
                  <div>
                    <span className="mb-[12px] block font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-muted">
                      {t('selectColor')}
                      {color && <em className="not-italic text-ink"> — {color}</em>}
                    </span>
                    <div className="flex flex-wrap gap-[12px]">
                      {colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          className={
                            'relative h-[30px] w-[30px] cursor-pointer rounded-full border border-line p-0 transition-transform duration-[150ms] after:absolute after:inset-[-5px] after:content-[""] after:rounded-full after:border after:border-transparent after:transition-[border-color] after:duration-[150ms] focus-visible:outline-none focus-visible:after:border-rose [&.is-active]:after:border-ink ' +
                            (color === c.name ? 'is-active' : '')
                          }
                          style={{ background: c.hex }}
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
                  <div>
                    <span className="mb-[12px] block font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-muted">
                      {t('selectSize')}
                    </span>
                    <div className="flex flex-wrap gap-[10px]">
                      {sizes.map((s) => {
                        const out = stockOf(color, s) === 0
                        return (
                          <button
                            key={s}
                            type="button"
                            className={
                              'min-w-[52px] cursor-pointer rounded-[2px] border border-line bg-surface px-[14px] py-[12px] font-medium text-[12px] leading-none tracking-[0.08em] text-ink transition-[border-color,color,opacity] duration-[150ms] focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through [&.is-active]:border-ink [&.is-active]:text-ink [&.is-active]:shadow-[inset_0_0_0_1px_var(--color-ink)] ' +
                              (size === s ? 'is-active' : '')
                            }
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

                <p
                  className={
                    'm-0 font-medium text-[11px] leading-none tracking-[0.12em] uppercase text-muted [&.is-out]:text-rose ' +
                    (soldOut ? 'is-out' : '')
                  }
                >
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

            <div className="mt-[8px] flex flex-wrap items-center gap-[16px]">
              <div className="inline-flex items-center gap-[12px] rounded-full border border-line px-[12px] py-[6px]">
                <button
                  type="button"
                  className="h-[22px] w-[22px] cursor-pointer border-0 bg-transparent text-[18px] leading-none text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[3px]"
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
                  className="w-[40px] border-0 bg-transparent text-center font-semibold text-[15px] leading-none text-ink [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[3px]"
                />
                <button
                  type="button"
                  className="h-[22px] w-[22px] cursor-pointer border-0 bg-transparent text-[18px] leading-none text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[3px]"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label={t('incAria', { name: product.name })}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="min-w-[200px] flex-1 cursor-pointer rounded-[2px] border-0 bg-rose p-[18px] font-medium text-[11px] leading-none tracking-[0.24em] uppercase text-paper transition-opacity duration-200 hover:opacity-85 focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[4px] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => onAdd(product.id, qty, variant)}
                disabled={soldOut}
              >
                {t('addToBag')}
              </button>
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <section className="mt-[clamp(56px,8vw,96px)] border-t border-line pt-[clamp(40px,5vw,64px)]" aria-label={t('youMayLike')}>
            <h2 className="m-0 mb-[32px] font-serif text-[clamp(24px,3vw,32px)] tracking-[0.01em] text-ink">
              {t('youMayLike')}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-[36px] gap-y-[48px] max-[720px]:gap-x-[22px] max-[720px]:gap-y-[36px]">
              {recommendations.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
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
