import { Fragment } from 'react'
import { useLanguage } from '../i18n.jsx'

const HERO_IMAGE = 'https://picsum.photos/seed/aniata-hero/1000/1300'

export default function Hero() {
  const { t } = useLanguage()
  const titleLines = t('heroTitle').split('\n')

  return (
    <section className="hero">
      <div className="hero__copy">
        <p className="hero__eyebrow">{t('heroEyebrow')}</p>
        <h1 className="hero__title">
          {titleLines.map((line, i) => (
            <Fragment key={i}>
              {line}
              {i < titleLines.length - 1 && <br />}
            </Fragment>
          ))}
        </h1>
        <p className="hero__lede">{t('heroLede')}</p>
        <a className="hero__cta" href="#collection">
          {t('heroCta')}
        </a>
      </div>
      <div className="hero__media">
        <img src={HERO_IMAGE} alt="Featured look from the autumn collection" />
      </div>
    </section>
  )
}
