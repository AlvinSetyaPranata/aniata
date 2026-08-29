import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { useLanguage } from '../i18n.jsx'

const TOAST_MS = 4000
const MAX_STACK = 4

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message) => {
    const id = ++counter.current
    setToasts((prev) => {
      const next = [...prev, { id, message }]
      return next.slice(-MAX_STACK)
    })
    window.setTimeout(() => remove(id), TOAST_MS)
  }, [remove])

  return (
    <ToastContext.Provider value={{ toast, remove }}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastViewport({ toasts, onClose }) {
  return (
    <div className="pointer-events-none fixed bottom-[24px] right-[24px] z-[90] flex w-[min(92vw,360px)] flex-col items-end gap-[12px]">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }) {
  const { t } = useLanguage()
  return (
    <div className="pointer-events-auto w-full overflow-hidden rounded-[3px] border border-line bg-surface text-ink shadow-[0_10px_34px_rgba(21,19,14,0.14)] motion-safe:animate-pd-rise">
      <div className="px-[18px] py-[14px]">
        <p className="m-0 font-sans text-[13px] leading-[1.5] text-ink">
          {toast.message}
        </p>
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="mt-[10px] cursor-pointer border-0 bg-transparent p-0 font-medium text-[10px] leading-none tracking-[0.18em] uppercase text-muted transition-colors duration-[180ms] hover:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-rose focus-visible:outline-offset-2"
        >
          {t('close')}
        </button>
      </div>

      <div className="h-[3px] w-full overflow-hidden bg-line">
        <div className="h-full w-full origin-left bg-rose motion-safe:animate-[toast-bar_4000ms_linear_forwards]" />
      </div>
    </div>
  )
}
