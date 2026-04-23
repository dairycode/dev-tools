import type { MessageType } from '../types'

interface ToastProps {
  message: string
  type: MessageType
}

export default function Toast({ message, type }: ToastProps) {
  if (!message) return null

  const bgClass = type === 'success'
    ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
    : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700'

  return (
    <div className={`fixed top-5 right-5 z-[1000] max-w-[300px] px-4 py-3 rounded-lg border text-sm font-medium shadow-lg animate-slide-in ${bgClass}`}>
      {message}
    </div>
  )
}
