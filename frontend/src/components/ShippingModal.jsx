import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n.jsx'
import { useScrollLock } from '../hooks/useScrollLock'

export default function ShippingModal({ open, onClose, onConfirm }) {
  const { t } = useLanguage()
  const closeRef = useRef(null)
  const [form, setForm] = useState({ name: '', address: '', phone: '' })
  const [error, setError] = useState(false)

  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      if (error) setError(false)
    }
  }

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) {
      setError(true)
      return
    }
    onConfirm({
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
    })
  }

  const field =
    'w-full resize-none rounded-[2px] border border-line bg-surface px-[14px] py-[12px] font-sans text-[14px] leading-[1.4] text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink focus-visible:outline-offset-[3px]'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-[24px] ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-[rgba(21,19,14,0.55)] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('shippingTitle')}
        className={`relative flex max-h-[90vh] w-[min(460px,94vw)] flex-col border border-line bg-paper shadow-[0_24px_60px_rgba(21,19,14,0.28)] transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-baseline justify-between border-b border-line px-[30px] pb-[18px] pt-[26px]">
          <h2 className="m-0 font-serif text-[24px] tracking-[0.02em] text-ink">
            {t('shippingTitle')}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border border-line bg-surface text-[13px] text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink focus-visible:outline-offset-[4px]"
            onClick={onClose}
            aria-label={t('closeAria')}
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-[18px] overflow-y-auto overscroll-contain px-[30px] py-[24px]">
          <p className="m-0 font-serif text-[15px] italic leading-[1.5] text-muted">
            {t('shippingIntro')}
          </p>

          <label className="flex flex-col gap-[8px]">
            <span className="font-medium text-[11px] leading-none tracking-[0.18em] uppercase text-muted">
              {t('shipName')}
            </span>
            <input
              type="text"
              className={field}
              value={form.name}
              onChange={update('name')}
              autoComplete="name"
              placeholder={t('shipName')}
            />
          </label>

          <label className="flex flex-col gap-[8px]">
            <span className="font-medium text-[11px] leading-none tracking-[0.18em] uppercase text-muted">
              {t('shipAddress')}
            </span>
            <textarea
              rows={3}
              className={field}
              value={form.address}
              onChange={update('address')}
              autoComplete="street-address"
              placeholder={t('shipAddress')}
            />
          </label>

          <label className="flex flex-col gap-[8px]">
            <span className="font-medium text-[11px] leading-none tracking-[0.18em] uppercase text-muted">
              {t('shipPhone')}
            </span>
            <input
              type="tel"
              className={field}
              value={form.phone}
              onChange={update('phone')}
              autoComplete="tel"
              placeholder={t('shipPhone')}
            />
          </label>

          {error && (
            <p className="m-0 font-medium text-[12px] leading-none tracking-[0.04em] text-rose">
              {t('shipRequired')}
            </p>
          )}

          <div className="mt-[4px] flex items-center gap-[12px]">
            <button
              type="submit"
              className="flex-1 cursor-pointer rounded-[2px] border-0 bg-rose p-[16px] font-medium text-[11px] leading-none tracking-[0.24em] uppercase text-paper transition-opacity duration-200 hover:opacity-85 focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[4px]"
            >
              {t('continueWa')}
            </button>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 font-medium text-[10px] leading-none tracking-[0.18em] uppercase text-muted underline underline-offset-[3px] hover:text-ink"
              onClick={onClose}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
