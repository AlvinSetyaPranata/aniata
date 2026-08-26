import { useLanguage } from '../i18n.jsx'
import { useTheme } from '../theme.jsx'

export default function Header({ count, onOpenCart, onOpenSearch }) {
  const { lang, setLanguage, t } = useLanguage()
  const { theme, toggle } = useTheme()
  const s = count === 1 ? '' : 's'

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line px-[clamp(22px,5vw,80px)] py-[26px] backdrop-blur-[10px] bg-[color-mix(in_srgb,var(--color-paper)_86%,transparent)] max-[720px]:px-[22px]">
      <div className="flex items-center gap-3">
        <img
          className="block h-12 w-auto object-contain"
          src="/logo.png"
          alt="Aniata"
          width="96"
          height="32"
        />
      </div>

      <div className="flex items-center gap-[18px]">
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

        <button
          type="button"
          className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink transition-colors duration-[180ms] hover:border-rose hover:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-2"
          onClick={onOpenSearch}
          aria-label={t('searchAria')}
        >
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
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-[10px] border-0 bg-transparent py-1 font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-ink cursor-pointer transition-colors duration-[180ms] hover:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[6px]"
          onClick={onOpenCart}
          aria-label={t('cartAria', { n: count, s })}
        >
          {t('cart')}
          <span className="inline-grid min-w-[22px] h-[22px] place-items-center rounded-full bg-rose px-[6px] font-semibold text-[11px] leading-none tracking-normal text-paper">
            {count}
          </span>
        </button>
      </div>
    </header>
  )
}
