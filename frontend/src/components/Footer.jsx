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

export default function Footer({ products = [], hideNewIn = false }) {
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
    <footer className="footer">
      {!hideNewIn && (
        <section className="footer__new" aria-label={t('newIn')}>
          <div className="footer__new-head">
            <h2 className="footer__title">{t('newIn')}</h2>
            <a className="footer__more" href="#collection">
              {t('viewAll')}
            </a>
          </div>
          <div className="footer__new-grid">
            {newIn.map((product) => (
              <article key={product.id} className="footer__new-card">
                <div className="footer__new-media">
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>
                <div className="footer__new-meta">
                  <span className="footer__new-name">{product.name}</span>
                  <span className="footer__new-price">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <p className="footer__new-blurb">{product.blurb}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="footer__signup">
        <div className="footer__signup-copy">
          <h2 className="footer__title">{t('stayClose')}</h2>
          <p className="footer__signup-text">{t('signupText')}</p>
        </div>
        {sent ? (
          <p className="footer__signup-thanks">{t('thanks')}</p>
        ) : (
          <form className="footer__form" onSubmit={onSubscribe}>
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button type="submit">{t('join')}</button>
          </form>
        )}
      </section>

      <nav className="footer__cols" aria-label="Footer">
        {LINK_COLUMNS(t).map((col) => (
          <div key={col.title} className="footer__col">
            <h3 className="footer__col-title">{col.title}</h3>
            <ul>
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="footer__base">
        <span className="footer__wordmark">Aniata</span>
        <span className="footer__legal">
          © {new Date().getFullYear()} {t('legal')}
        </span>
      </div>
    </footer>
  )
}
