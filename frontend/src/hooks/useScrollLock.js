import { useEffect } from 'react'

let locks = 0
let previous = ''

export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    if (locks === 0) {
      previous = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    locks += 1
    return () => {
      locks = Math.max(0, locks - 1)
      if (locks === 0) document.body.style.overflow = previous
    }
  }, [active])
}
