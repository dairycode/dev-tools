import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { MessageType } from '../types'

interface ToastState {
  message: string
  type: MessageType
  visible: boolean
}

interface ToastContextValue {
  showToast: (message: string, type: MessageType) => void
  toast: ToastState
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    visible: false,
  })

  const showToast = useCallback((message: string, type: MessageType) => {
    setToast({ message, type, visible: true })
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
