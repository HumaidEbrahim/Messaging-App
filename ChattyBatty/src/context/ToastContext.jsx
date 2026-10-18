import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { LuX } from 'react-icons/lu'

const ToastContext = createContext(null)

const DURATION_MS = 4500

// Written out in full so Tailwind generates each class.
const TONE_CLASSES = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
}
let nextId = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const stackRef = useRef(null)

  // Modal dialogs live in the browser's top layer, above any z-index. Showing
  // the stack as a popover puts it in the top layer too; re-showing it on
  // each new toast keeps it above dialogs that opened since.
  useEffect(() => {
    const stack = stackRef.current
    if (!stack?.showPopover) return
    if (stack.matches(':popover-open')) stack.hidePopover()
    if (toasts.length > 0) stack.showPopover()
  }, [toasts])

  const dismiss = useCallback(
    (id) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    [],
  )

  const show = useCallback(
    (message, tone) => {
      const id = ++nextId
      setToasts((current) => [...current.slice(-2), { id, message, tone }])
      setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  const api = useMemo(
    () => ({
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      info: (message) => show(message, 'info'),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Always present, so screen readers announce each new message. */}
      <div className="sr-only" role="status" aria-live="polite">
        {toasts.at(-1)?.message}
      </div>
      <div
        ref={stackRef}
        popover="manual"
        className="fixed z-[1000] m-0 p-0 border-0 bg-transparent overflow-visible flex flex-col items-center gap-2 w-max max-w-[calc(100vw-2rem)]"
        style={{
          inset: 'auto',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`alert ${TONE_CLASSES[toast.tone]} alert-soft shadow-lg max-w-sm whitespace-normal`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
            >
              <LuX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
