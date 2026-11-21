import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Icon } from './Icon'

type Message = { text: string; kind: 'success' | 'error' }
const ToastContext = createContext<{
  notify: (text: string, kind?: Message['kind']) => void
  dismiss: () => void
} | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<Message | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setMessage(null)
  }, [])
  const notify = useCallback((text: string, kind: Message['kind'] = 'success') => {
    if (timer.current) clearTimeout(timer.current)
    setMessage({ text, kind })
    timer.current = setTimeout(() => setMessage(null), kind === 'error' ? 6000 : 3000)
  }, [])
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  return (
    <ToastContext.Provider value={{ notify, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 z-50 max-w-[min(440px,calc(100vw-32px))]"
        aria-live="polite"
        aria-atomic="true"
      >
        {message && (
          <div
            className={`pointer-events-auto flex items-start gap-4 rounded-xl border border-line px-4 py-3 text-sm shadow-lg [overflow-wrap:anywhere] ${message.kind === 'error' ? 'bg-error-surface text-error-ink' : 'bg-success-surface text-success-ink'}`}
            role={message.kind === 'error' ? 'alert' : 'status'}
          >
            <span>{message.text}</span>
            <button
              className="inline-flex min-h-6 min-w-6 shrink-0 items-center justify-center p-1"
              type="button"
              onClick={dismiss}
              aria-label="关闭提示"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('消息组件必须置于 ToastProvider 中')
  return context
}
