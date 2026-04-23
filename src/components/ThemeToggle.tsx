import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? '切换到亮色模式' : '切换到黑夜模式'}
      className="flex-1 px-4 py-3 border-none rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-gray-100 text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2.5 hover:bg-gray-100 dark:hover:bg-neutral-600 hover:-translate-y-px active:translate-y-0"
    >
      <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
    </button>
  )
}
