import { useState } from 'react'
import { formatPrice } from '../data/products'
import { useLanguage } from '../i18n.jsx'

const LINK_COLUMNS = (t) => [
  {
    title: t('shop'),
    links: [t('linkNewIn'), t('linkClothing'), t('linkObjects'), t('linkGift')],
  },
  {
    title: t('house'),
    links: [
      t('linkStory'),
      t('linkSustain'),
      t('linkStockists'),
      t('linkJournal'),
    ],
  },
  {
    title: t('care'),
    links: [
      t('linkShipping'),
      t('linkReturns'),
      t('linkContact'),
      t('linkFaq'),
    ],
  },
]

export default function Footer({ products = [], hideNewIn = false, hideSignup = false }) {
  const { t } = useLanguage()
  const newIn = products.slice(0, 3)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function onSubscribe(e) {
    e.preventDefault()
    if (!email) return
    setSent(true)
    setEmail('')
  }

  return (
    <footer className="border-t border-line bg-surface">
      {!hideNewIn && (
        <section className="px-[clamp(22px,5vw,80px)] pb-[40px] pt-[clamp(48px,6vw,84px)]" aria-label={t('newIn')}>
          <div className="mb-[28px] flex items-baseline justify-between">
            <h2 className="m-0 font-serif text-[26px] tracking-[0.01em] text-ink">
              {t('newIn')}
            </h2>
            <a
              className="border-b border-line pb-[4px] font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-muted no-underline transition-colors hover:border-rose hover:text-rose"
              href="#collection"
            >
              {t('viewAll')}
            </a>
          </div>
          <div className="grid grid-cols-3 gap-[36px] max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
            {newIn.map((product) => (
              <article key={product.id} className="group">
                <div className="aspect-[4/5] overflow-hidden border border-line bg-[linear-gradient(160deg,#e9e6df,#dcd8ce)]">
                  <img
                    className="block h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>
                <div className="mt-[14px] flex items-baseline justify-between gap-[12px]">
                  <span className="font-serif text-[18px] leading-[1.2] text-ink">
                    {product.name}
                  </span>
                  <span className="whitespace-nowrap font-medium text-[12px] leading-none tracking-[0.08em] text-muted">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <p className="m-0 mt-[8px] font-serif text-[14px] italic leading-[1.5] text-muted">
                  {product.blurb}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!hideSignup && (
        <section className="flex flex-wrap items-end justify-between gap-[24px] border-y border-line px-[clamp(22px,5vw,80px)] py-[44px]">
          <div className="max-w-[40ch]">
            <h2 className="m-0 font-serif text-[26px] tracking-[0.01em] text-ink">
              {t('stayClose')}
            </h2>
            <p className="m-0 mt-[10px] font-sans text-[15px] leading-[1.6] text-muted">
              {t('signupText')}
            </p>
          </div>
          {sent ? (
            <p className="m-0 font-serif text-[17px] italic leading-[1.5] text-ink">
              {t('thanks')}
            </p>
          ) : (
            <form className="flex w-[min(420px,100%)] gap-[10px]" onSubmit={onSubscribe}>
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                className="flex-1 rounded-[2px] border border-line bg-paper px-[16px] py-[14px] font-sans text-[15px] leading-none text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[2px]"
              />
              <button
                type="submit"
                className="cursor-pointer rounded-[2px] border-0 bg-rose px-[26px] py-[14px] font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-paper transition-opacity duration-200 hover:opacity-85"
              >
                {t('join')}
              </button>
            </form>
          )}
        </section>
      )}

      <nav className="grid grid-cols-3 gap-[36px] px-[clamp(22px,5vw,80px)] py-[clamp(40px,5vw,64px)] max-[860px]:grid-cols-2 max-[560px]:grid-cols-1" aria-label="Footer">
        {LINK_COLUMNS(t).map((col) => (
          <div key={col.title}>
            <h3 className="m-0 mb-[18px] font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-ink">
              {col.title}
            </h3>
            <ul className="m-0 flex flex-col gap-[12px] list-none p-0">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-[15px] leading-none text-muted no-underline transition-colors duration-200 hover:text-rose"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex items-baseline justify-between gap-[16px] border-t border-line px-[clamp(22px,5vw,80px)] py-[26px]">
        <span className="font-serif text-[18px] leading-none tracking-[0.32em] uppercase text-ink">
          Aniata
        </span>
        <span className="font-medium text-[11px] leading-none tracking-[0.06em] text-muted">
          © {new Date().getFullYear()} {t('legal')}
        </span>
      </div>
    </footer>
  )
}
