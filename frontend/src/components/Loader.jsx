import { useEffect, useState } from 'react'

const BOOT_MS = 1500

export default function Loader() {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / BOOT_MS)
      setPct(Math.round(p * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const id = window.setTimeout(() => setDone(true), BOOT_MS)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(id)
    }
  }, [])

  useEffect(() => {
    if (!done) return
    const id = window.setTimeout(() => setHidden(true), 700)
    return () => window.clearTimeout(id)
  }, [done])

  if (hidden) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-paper transition-opacity duration-[600ms] ${
        done ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-label="Loading"
    >
      <img
        src="/logo.png"
        alt="Aniata"
        className="w-[40vw] max-w-[680px] h-auto motion-safe:animate-[boot-pulse_1500ms_ease-in-out_infinite]"
      />

      <span
        className="absolute bottom-[16px] -translate-x-1/2 font-serif text-[12px] leading-none tracking-[0.18em] text-rose"
        style={{ left: `clamp(6%, ${pct}%, 94%)` }}
      >
        {pct}%
      </span>

      <div className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden bg-line">
        <div
          className="h-full w-full origin-left bg-rose"
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
    </div>
  )
}
