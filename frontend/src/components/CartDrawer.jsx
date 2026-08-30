import { useEffect, useRef, useState } from 'react'
import { formatPrice, effectivePrice } from '../data/products'
import { useLanguage } from '../i18n.jsx'
import { useScrollLock } from '../hooks/useScrollLock'
import ShippingModal from './ShippingModal'
import SkeletonImage from './SkeletonImage'

export default function CartDrawer({
  open,
  onClose,
  lines,
  total,
  setQty,
  remove,
  clear,
}) {
  const closeRef = useRef(null)
  const [shipOpen, setShipOpen] = useState(false)
  const { t } = useLanguage()

  useScrollLock(open || shipOpen)

  const DEFAULT_WA = String(
    import.meta.env.VITE_WHATSAPP_NUMBER ?? '6281234567890',
  ).replace(/\D/g, '')
  const STORE_NAME = import.meta.env.VITE_STORE_NAME ?? 'Aniata'

  function closeAll() {
    setShipOpen(false)
    onClose()
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function recordOrder(shipping) {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        customer_name: shipping?.name ?? null,
        customer_phone: shipping?.phone ?? null,
        customer_address: shipping?.address ?? null,
        items: lines.map((l) => ({
          product_id: l.product.id,
          qty: l.qty,
          price: effectivePrice(l.product),
        })),
      }),
    }).catch(() => {})
  }

  function buildMessage(shipping) {
    const head = `Halo ${STORE_NAME}, saya ingin memesan:\n`
    const body = lines
      .map((l, i) => {
        const variant = [l.color, l.size].filter(Boolean).join(' · ')
        const lineTotal = formatPrice(effectivePrice(l.product) * l.qty)
        return `${i + 1}. ${l.product.name}${variant ? ` (${variant})` : ''} ×${l.qty} — ${lineTotal}`
      })
      .join('\n')
    const foot = `\nTotal: ${formatPrice(total)}`
    const ship = shipping
      ? `\n\n${t('shipTo')}:\n${shipping.name}\n${shipping.address}\n${shipping.phone}`
      : ''
    return head + body + foot + ship
  }

  function handleCheckout() {
    if (!lines.length) return
    setShipOpen(true)
  }

  async function resolveWaNumber() {
    const digitsOnly = (v) => String(v ?? '').replace(/\D/g, '')
    const fallback = DEFAULT_WA
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
      const res = await fetch(`${API}/settings`, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) return fallback
      const settings = await res.json()
      // Checkout targets the Kasir number; fall back to CS, then the env default.
      return digitsOnly(settings.cashier_wa) || digitsOnly(settings.cs_wa) || fallback
    } catch {
      return fallback
    }
  }

  async function handleShipSubmit(shipping) {
    recordOrder(shipping)
    const number = await resolveWaNumber()
    const url = `https://wa.me/${number}?text=${encodeURIComponent(
      buildMessage(shipping),
    )}`
    window.open(url, '_blank', 'noopener')
    setShipOpen(false)
    clear()
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-40 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-[rgba(21,19,14,0.4)] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeAll}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-[min(440px,94vw)] flex-col border-l border-line bg-paper transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label={t('cartTitle')}
        aria-modal="true"
      >
        <div className="flex items-baseline justify-between border-b border-line px-[30px] pb-[22px] pt-[28px]">
          <h2 className="m-0 font-serif text-[26px] tracking-[0.02em] text-ink">
            {t('cartTitle')}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border border-line bg-surface text-[13px] text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink focus-visible:outline-offset-[4px]"
            onClick={closeAll}
            aria-label={t('closeAria')}
          >
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="px-[30px] py-[40px] font-serif text-[16px] italic leading-[1.6] text-muted">
            {t('cartEmpty')}
          </p>
        ) : (
          <>
            <ul className="m-0 flex-1 list-none overflow-y-auto overscroll-contain px-[30px] py-[4px]">
              {lines.map(({ key, product, qty, color, size }) => (
                <li
                  key={key}
                  className="grid grid-cols-[56px_1fr] items-center gap-x-[16px] gap-y-[4px] border-b border-line py-[22px] [grid-template-areas:'tile_info'_'tile_qty']"
                >
                    <SkeletonImage
                      className="[grid-area:tile] block h-[72px] w-[56px] border border-line"
                      imgClassName="object-cover"
                      src={product.image}
                      alt=""
                      loading="lazy"
                    />
                  <div className="[grid-area:info] flex flex-col gap-[4px]">
                    <span className="font-serif text-[17px] leading-[1.2] text-ink">
                      {product.name}
                    </span>
                    {(color || size) && (
                      <span className="text-[13px] leading-[1.3] text-muted">
                        {[color, size].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    <span className="font-medium text-[11px] leading-none tracking-[0.08em] text-muted">
                      {product.discount ? (
                        <span className="inline-flex items-baseline gap-[8px]">
                          <s className="text-muted">{formatPrice(product.price)}</s>
                          <strong className="font-semibold text-rose">
                            {formatPrice(effectivePrice(product))}
                          </strong>
                        </span>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </span>
                  </div>
                  <div className="[grid-area:qty] mt-[4px] inline-flex w-fit items-center gap-[14px] rounded-full border border-line px-[12px] py-[6px]">
                    <button
                      type="button"
                      className="w-[18px] cursor-pointer border-0 bg-transparent text-[15px] leading-none text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink focus-visible:outline-offset-[3px]"
                      onClick={() => setQty(key, qty - 1)}
                      aria-label={t('decAria', { name: product.name })}
                    >
                      −
                    </button>
                    <span className="min-w-[14px] text-center font-semibold text-[13px] leading-none text-ink">
                      {qty}
                    </span>
                    <button
                      type="button"
                      className="w-[18px] cursor-pointer border-0 bg-transparent text-[15px] leading-none text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink focus-visible:outline-offset-[3px]"
                      onClick={() => setQty(key, qty + 1)}
                      aria-label={t('incAria', { name: product.name })}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="col-start-2 mt-[2px] cursor-pointer justify-self-start border-0 bg-transparent p-0 font-medium text-[10px] leading-none tracking-[0.18em] uppercase text-muted underline underline-offset-[3px] hover:text-rose"
                    onClick={() => remove(key)}
                    aria-label={`${t('remove')} ${product.name}`}
                  >
                    {t('remove')}
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-[16px] border-t border-line px-[30px] pb-[30px] pt-[24px]">
              <div className="flex items-baseline justify-between font-medium text-[11px] leading-none tracking-[0.22em] uppercase text-muted">
                <span>{t('subtotal')}</span>
                <strong className="font-serif text-[28px] tracking-normal normal-case text-ink">
                  {formatPrice(total)}
                </strong>
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-[2px] border-0 bg-rose p-[18px] font-medium text-[11px] leading-none tracking-[0.24em] uppercase text-paper transition-opacity duration-200 hover:opacity-85 focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-[4px]"
                onClick={handleCheckout}
              >
                {t('checkout')}
              </button>
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 font-medium text-[10px] leading-none tracking-[0.18em] uppercase text-muted underline underline-offset-[3px] hover:text-ink"
                onClick={clear}
              >
                {t('clear')}
              </button>
            </div>
          </>
        )}
      </aside>

      <ShippingModal
        open={shipOpen}
        onClose={() => setShipOpen(false)}
        onConfirm={handleShipSubmit}
      />
    </div>
  )
}
