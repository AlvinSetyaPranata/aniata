import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n.jsx'
import { useTheme } from '../theme.jsx'
import { useScrollLock } from '../hooks/useScrollLock'

const TEXT_FADE = 320
const EXPAND = 620
const CART_FADE = 460

const SearchGlyph = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const BagGlyph = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const MenuGlyph = () => (
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
)

export default function Header({ count, onOpenCart, onOpenSearch, onCloseSearch, searchOpen, query, onSearch }) {
  const { lang, setLanguage, t } = useLanguage()
  const { theme, toggle } = useTheme()
  const s = count === 1 ? '' : 's'
  const [menuOpen, setMenuOpen] = useState(false)
  // 'closed' -> 'opening' (text fades out) -> 'open' (input expands, cart icon fades in)
  // reverse on close: 'open' -> 'closing' (input collapses, cart icon fades out) -> 'closed' (text fades in)
  const [searchState, setSearchState] = useState('closed')
  const inputRef = useRef(null)
  const timers = useRef([])

  useScrollLock(menuOpen)

  const searching = searchState !== 'closed'

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }

  useEffect(() => clearTimers, [])

  function closeMenu() {
    setMenuOpen(false)
  }

  function activateSearch() {
    if (searchState !== 'closed') return
    clearTimers()
    setSearchState('opening')
    timers.current.push(
      window.setTimeout(() => setSearchState('open'), TEXT_FADE),
    )
    onOpenSearch(query)
  }

  function deactivateSearch() {
    if (searchState === 'closed') return
    clearTimers()
    setSearchState('closing')
    timers.current.push(
      window.setTimeout(() => {
        setSearchState('closed')
        onSearch('')
        onCloseSearch?.()
      }, EXPAND),
    )
  }

  useEffect(() => {
    if (searchState === 'open') inputRef.current?.focus()
  }, [searchState])

  // When the Search page is closed (e.g. its back button), revert the navbar
  // search input with the same animated close.
  useEffect(() => {
    if (!searchOpen) deactivateSearch()
  }, [searchOpen])

  const navLink =
    'inline-flex items-center border-0 bg-transparent font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-ink cursor-pointer transition-colors duration-[180ms] hover:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[6px]'

  const cartBadge =
    count > 0 ? (
      <span className="inline-grid min-w-[22px] h-[22px] place-items-center rounded-full bg-rose px-[6px] font-semibold text-[11px] leading-none tracking-normal text-paper">
        {count}
      </span>
    ) : null

  const headerCls = `sticky top-0 z-30 grid items-center border-b border-line px-[clamp(22px,5vw,80px)] py-[26px] backdrop-blur-[10px] bg-[color-mix(in_srgb,var(--color-paper)_86%,transparent)] ${
    searching ? 'grid-cols-[1fr_minmax(0,52%)_1fr]' : 'grid-cols-[1fr_auto_1fr]'
  } max-[720px]:flex max-[720px]:justify-between max-[720px]:px-[22px]`

  const formVisible = searchState === 'open' || searchState === 'closing'
  const cartIcon = searchState === 'open'

  // Text button: fade out immediately on open, fade in only after the input has collapsed (delay).
  const textBtnCls =
    searchState === 'closed'
      ? 'opacity-100 transition-opacity duration-[320ms] delay-[320ms]'
      : 'opacity-0 transition-opacity duration-[320ms] delay-0'

  return (
    <>
      <header className={headerCls}>
        <div className="flex items-center gap-3">
          <img
            className="block h-12 w-auto object-contain"
            src="/logo.png"
            alt="Aniata"
            width="96"
            height="32"
          />
        </div>

        <div
          className={`hidden items-center justify-center gap-[22px] min-[721px]:flex ${
            searching ? 'min-[721px]:w-full' : ''
          }`}
        >
          {formVisible ? (
            <form
              className={`flex flex-1 items-center gap-[10px] overflow-hidden border-b border-line py-[6px] ${
                searchState === 'open'
                  ? 'max-w-full opacity-100 motion-safe:animate-[search-expand_620ms_ease]'
                  : 'max-w-0 opacity-0 transition-[max-width,opacity] [transition-duration:620ms,300ms] [transition-delay:0ms,320ms] ease-out'
              }`}
              onSubmit={(e) => {
                e.preventDefault()
                onOpenSearch(query)
              }}
            >
              <span className="shrink-0 text-muted">
                <SearchGlyph />
              </span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => onSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') deactivateSearch()
                }}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchAria')}
                className="w-full bg-transparent border-0 p-0 font-sans text-[13px] leading-none tracking-[0.02em] text-ink placeholder:text-muted focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={deactivateSearch}
                aria-label={t('closeAria')}
                className="shrink-0 cursor-pointer border-0 bg-transparent text-[13px] leading-none text-muted transition-colors duration-[180ms] hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-2"
              >
                ✕
              </button>
            </form>
          ) : null}

          {searchState !== 'open' ? (
            <button
              type="button"
              className={`${navLink} ${textBtnCls}`}
              onClick={activateSearch}
              aria-label={t('searchAria')}
            >
              {t('searchProducts')}
            </button>
          ) : null}

          <button
            type="button"
            className={`${navLink} relative gap-[10px]`}
            onClick={onOpenCart}
            aria-label={t('cartAria', { n: count, s })}
          >
            <span
              className={`inline-flex items-center gap-[10px] transition-opacity duration-[460ms] ${
                cartIcon ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {t('cart')}
              {cartBadge}
            </span>
            <span
              className={`absolute left-0 top-1/2 inline-flex -translate-y-1/2 items-center gap-[10px] transition-opacity duration-[460ms] ${
                cartIcon ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <BagGlyph />
              {cartBadge}
            </span>
          </button>
        </div>

        <div className="hidden items-center justify-end gap-[18px] min-[721px]:flex">
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
          <MenuGlyph />
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
