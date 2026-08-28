import { Fragment } from 'react'
import { useLanguage } from '../i18n.jsx'
import SkeletonImage from './SkeletonImage'

const HERO_IMAGE = 'https://picsum.photos/seed/aniata-hero/1000/1300'

export default function Hero() {
  const { t } = useLanguage()
  const titleLines = t('heroTitle').split('\n')

  return (
    <section className="group grid min-h-screen grid-cols-[1.05fr_0.95fr] items-stretch gap-0 max-[860px]:grid-cols-1 max-[860px]:min-h-0">
      <div className="flex flex-col justify-center px-[clamp(22px,5vw,80px)] py-[clamp(56px,8vw,110px)] max-[720px]:px-[22px] max-[860px]:items-center max-[860px]:text-center">
        <p className="m-0 mb-[26px] font-medium text-[11px] leading-none tracking-[0.3em] uppercase text-muted">
          {t('heroEyebrow')}
        </p>
        <h1 className="m-0 mb-[26px] font-serif text-[clamp(44px,7vw,96px)] font-normal leading-[0.98] tracking-[-0.015em] text-ink">
          {titleLines.map((line, i) => (
            <Fragment key={i}>
              {line}
              {i < titleLines.length - 1 && <br />}
            </Fragment>
          ))}
        </h1>
        <p className="m-0 mb-[34px] max-w-[42ch] font-sans text-[17px] leading-[1.6] text-muted max-[860px]:mx-auto">
          {t('heroLede')}
        </p>
        <a
          className="self-start border-b border-rose font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-rose no-underline pb-[5px] transition-opacity duration-200 hover:opacity-60 max-[860px]:self-center"
          href="#collection"
        >
          {t('heroCta')}
        </a>
      </div>
      <div className="relative overflow-hidden max-[860px]:aspect-[4/3]">
        <SkeletonImage
          className="absolute inset-0"
          imgClassName="transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          src={HERO_IMAGE}
          alt="Featured look from the autumn collection"
        />
      </div>
    </section>
  )
}
