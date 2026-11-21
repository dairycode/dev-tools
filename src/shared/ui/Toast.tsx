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
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {message && (
          <div
            className={`toast toast-${message.kind}`}
            role={message.kind === 'error' ? 'alert' : 'status'}
          >
            <span>{message.text}</span>
            <button type="button" onClick={dismiss} aria-label="关闭提示">
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
