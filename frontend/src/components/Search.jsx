import { useMemo, useState } from 'react'
import { effectivePrice } from '../data/products'
import { useLanguage } from '../i18n.jsx'
import ProductCard from './ProductCard'

export default function Search({ products, onClose, onOpen, onAdd, query: extQuery, onSearch: extOnSearch }) {
  const { t } = useLanguage()
  const [intQuery, setIntQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [onSale, setOnSale] = useState(false)

  const query = extQuery ?? intQuery
  const setQuery = extOnSearch ?? setIntQuery

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter((p) => {
      if (q && !`${p.name} ${p.blurb ?? ''}`.toLowerCase().includes(q)) return false
      if (onSale && !(p.discount > 0)) return false
      return true
    })
    if (sort === 'price-asc') list.sort((a, b) => effectivePrice(a) - effectivePrice(b))
    else if (sort === 'price-desc')
      list.sort((a, b) => effectivePrice(b) - effectivePrice(a))
    else if (sort === 'newest') list.sort((a, b) => b.id - a.id)
    return list
  }, [products, query, onSale, sort])

  const hasFilters = !!(query || onSale)

  return (
    <section className="px-[clamp(22px,5vw,80px)] pb-[110px] pt-[24px]">
      <div className="mx-auto max-w-[1200px]">
        <button
          type="button"
          className="mb-[28px] mt-[8px] inline-flex items-center gap-[8px] border-0 bg-transparent p-0 font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-muted cursor-pointer transition-colors duration-[180ms] hover:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[5px]"
          onClick={onClose}
        >
          <span aria-hidden="true">←</span> {t('back')}
        </button>

        <h1 className="m-0 font-serif text-[clamp(28px,4vw,40px)] tracking-[0.01em] text-ink">
          {t('searchTitle')}
        </h1>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchAria')}
          className="mt-[20px] w-full rounded-[2px] border border-line bg-paper px-[16px] py-[16px] font-sans text-[16px] leading-none text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-2 min-[721px]:hidden"
        />

        <div className="mt-[24px] flex flex-wrap items-center gap-[18px] border-y border-line py-[20px]">
          <button
            type="button"
            className={
              'cursor-pointer rounded-[2px] border border-line bg-surface px-[14px] py-[10px] font-medium text-[12px] leading-none tracking-[0.08em] text-ink transition-[border-color,color,background-color] duration-[150ms] focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[3px] [&.is-active]:border-rose [&.is-active]:bg-rose [&.is-active]:text-paper ' +
              (onSale ? 'is-active' : '')
            }
            onClick={() => setOnSale((prev) => !prev)}
            aria-pressed={onSale}
          >
            {t('onSale')}
          </button>

          <label className="ml-auto flex items-center gap-[10px] font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-muted">
            {t('sortLabel')}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="cursor-pointer rounded-[2px] border border-line bg-surface px-[14px] py-[10px] font-medium text-[12px] leading-none tracking-[0.08em] text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[3px]"
            >
              <option value="featured">{t('sortFeatured')}</option>
              <option value="price-asc">{t('sortPriceAsc')}</option>
              <option value="price-desc">{t('sortPriceDesc')}</option>
              <option value="newest">{t('sortNewest')}</option>
            </select>
          </label>

          {hasFilters && (
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 font-medium text-[10px] leading-none tracking-[0.18em] uppercase text-muted underline underline-offset-[3px] hover:text-ink"
              onClick={() => {
                setQuery('')
                setOnSale(false)
              }}
            >
              {t('clearFilters')}
            </button>
          )}
        </div>

        <p className="mb-[18px] mt-[28px] font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-muted">
          {t('resultsCount', {
            n: results.length,
            s: results.length === 1 ? '' : 's',
          })}
        </p>

        {results.length === 0 ? (
          <p className="m-0 font-serif text-[16px] italic leading-[1.6] text-muted">
            {t('noResults')}
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-[36px] gap-y-[48px] max-[720px]:gap-x-[22px] max-[720px]:gap-y-[36px]">
            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAdd}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
