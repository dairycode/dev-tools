import { useToast } from '../../context/ToastContext'

export default function Toast() {
  const { toast } = useToast()

  if (!toast.visible) return null

  return (
    <div
      className={`fixed top-5 right-5 z-50 max-w-xs px-4 py-3 rounded-lg text-sm font-medium shadow-lg animate-slide-in ${
        toast.type === 'success'
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
          : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
      }`}
    >
      {toast.message}
    </div>
  )
}
