import { useState } from 'react'
import { useLanguage } from '../i18n.jsx'
import { useTheme } from '../theme.jsx'
import { useScrollLock } from '../hooks/useScrollLock'

export default function Header({ count, onOpenCart, onOpenSearch }) {
  const { lang, setLanguage, t } = useLanguage()
  const { theme, toggle } = useTheme()
  const s = count === 1 ? '' : 's'
  const [menuOpen, setMenuOpen] = useState(false)

  useScrollLock(menuOpen)

  function closeMenu() {
    setMenuOpen(false)
  }

  const navLink =
    'inline-flex items-center border-0 bg-transparent font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-ink cursor-pointer transition-colors duration-[180ms] hover:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[6px]'

  const cartBadge =
    count > 0 ? (
      <span className="inline-grid min-w-[22px] h-[22px] place-items-center rounded-full bg-rose px-[6px] font-semibold text-[11px] leading-none tracking-normal text-paper">
        {count}
      </span>
    ) : null

  return (
    <>
      <header className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center border-b border-line px-[clamp(22px,5vw,80px)] py-[26px] backdrop-blur-[10px] bg-[color-mix(in_srgb,var(--color-paper)_86%,transparent)] max-[720px]:flex max-[720px]:justify-between max-[720px]:px-[22px]">
        <div className="flex items-center gap-3">
          <img
            className="block h-12 w-auto object-contain"
            src="/logo.png"
            alt="Aniata"
            width="96"
            height="32"
          />
        </div>

        <div className="hidden items-center justify-center gap-[28px] max-[720px]:hidden">
          <button
            type="button"
            className={navLink}
            onClick={onOpenSearch}
            aria-label={t('searchAria')}
          >
            {t('searchProducts')}
          </button>

          <button
            type="button"
            className={`${navLink} gap-[10px]`}
            onClick={onOpenCart}
            aria-label={t('cartAria', { n: count, s })}
          >
            {t('cart')}
            {cartBadge}
          </button>
        </div>

        <div className="hidden items-center justify-end gap-[18px] max-[720px]:hidden">
          <div
            className="inline-flex overflow-hidden rounded-full border border-line"
            role="group"
            aria-label="Language"
          >
            <button
              type="button"
              className={
                'cursor-pointer border-0 bg-transparent px-[11px] py-2 font-semibold text-[10px] leading-none tracking-[0.12em] text-muted transition-colors duration-[180ms] hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-2 [&.is-active]:bg-ink [&.is-active]:text-paper ' +
                (lang === 'en' ? 'is-active' : '')
              }
              onClick={() => setLanguage('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              className={
                'cursor-pointer border-0 bg-transparent px-[11px] py-2 font-semibold text-[10px] leading-none tracking-[0.12em] text-muted transition-colors duration-[180ms] hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-2 [&.is-active]:bg-ink [&.is-active]:text-paper ' +
                (lang === 'id' ? 'is-active' : '')
              }
              onClick={() => setLanguage('id')}
              aria-pressed={lang === 'id'}
            >
              ID
            </button>
          </div>

          <button
            type="button"
            className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border border-line bg-surface text-[15px] leading-none text-ink transition-colors duration-[180ms] hover:border-rose hover:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-2"
            onClick={toggle}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>

        <button
          type="button"
          className="hidden max-[720px]:inline-grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border border-line bg-surface text-[16px] leading-none text-ink transition-colors duration-[180ms] hover:border-rose hover:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-2"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="3" y1="7" x2="21" y2="7" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="17" x2="21" y2="17" />
          </svg>
        </button>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-[rgba(21,19,14,0.4)] transition-opacity duration-300 ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMenu}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[90vw] flex-col border-l border-line bg-paper transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t('menu')}
      >
        <div className="flex items-center justify-between border-b border-line px-[26px] py-[24px]">
          <span className="font-serif text-[20px] tracking-[0.02em] text-ink">
            {t('menu')}
          </span>
          <button
            type="button"
            className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border border-line bg-surface text-[13px] text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink focus-visible:outline-offset-[4px]"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-[26px] px-[26px] py-[30px]">
          <button
            type="button"
            className={navLink}
            onClick={() => {
              closeMenu()
              onOpenSearch()
            }}
            aria-label={t('searchAria')}
          >
            {t('searchProducts')}
          </button>

          <button
            type="button"
            className={`${navLink} gap-[10px]`}
            onClick={() => {
              closeMenu()
              onOpenCart()
            }}
            aria-label={t('cartAria', { n: count, s })}
          >
            {t('cart')}
            {cartBadge}
          </button>

          <div
            className="inline-flex w-fit overflow-hidden rounded-full border border-line"
            role="group"
            aria-label="Language"
          >
            <button
              type="button"
              className={
                'cursor-pointer border-0 bg-transparent px-[14px] py-2 font-semibold text-[10px] leading-none tracking-[0.12em] text-muted transition-colors duration-[180ms] hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-2 [&.is-active]:bg-ink [&.is-active]:text-paper ' +
                (lang === 'en' ? 'is-active' : '')
              }
              onClick={() => setLanguage('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              className={
                'cursor-pointer border-0 bg-transparent px-[14px] py-2 font-semibold text-[10px] leading-none tracking-[0.12em] text-muted transition-colors duration-[180ms] hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-2 [&.is-active]:bg-ink [&.is-active]:text-paper ' +
                (lang === 'id' ? 'is-active' : '')
              }
              onClick={() => setLanguage('id')}
              aria-pressed={lang === 'id'}
            >
              ID
            </button>
          </div>

          <button
            type="button"
            className="inline-flex w-fit items-center gap-[10px] border-0 bg-transparent font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-ink cursor-pointer transition-colors duration-[180ms] hover:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[6px]"
            onClick={toggle}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '☾' : '☀'}
            <span>{theme === 'light' ? t('themeLight') : t('themeDark')}</span>
          </button>
        </nav>
      </aside>
    </>
  )
}
