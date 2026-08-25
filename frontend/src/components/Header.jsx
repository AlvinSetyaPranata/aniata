import { useLanguage } from '../i18n.jsx'
import { useTheme } from '../theme.jsx'

export default function Header({ count, onOpenCart }) {
  const { lang, setLanguage, t } = useLanguage()
  const { theme, toggle } = useTheme()
  const s = count === 1 ? '' : 's'

  return (
    <header className="site-header">
      <div className="site-header__brand">
        <span className="site-header__name">Aniata</span>
        <span className="site-header__tag">Atelier</span>
      </div>

      <div className="site-header__tools">
        <div className="lang" role="group" aria-label="Language">
          <button
            type="button"
            className={lang === 'en' ? 'lang__opt is-active' : 'lang__opt'}
            onClick={() => setLanguage('en')}
            aria-pressed={lang === 'en'}
          >
            EN
          </button>
          <button
            type="button"
            className={lang === 'id' ? 'lang__opt is-active' : 'lang__opt'}
            onClick={() => setLanguage('id')}
            aria-pressed={lang === 'id'}
          >
            ID
          </button>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '☾' : '☀'}
        </button>

        <button
          type="button"
          className="site-header__cart"
          onClick={onOpenCart}
          aria-label={t('cartAria', { n: count, s })}
        >
          {t('cart')}
          <span className="site-header__count">{count}</span>
        </button>
      </div>
    </header>
  )
}
