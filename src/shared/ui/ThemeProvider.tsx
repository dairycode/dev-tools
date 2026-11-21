import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { readTheme, saveTheme, THEME_KEY, type ThemePreference } from '../browser/theme'
import { useToast } from './Toast'

const ThemeContext = createContext<{
  isDark: boolean
  preference: ThemePreference
  choose: (preference: ThemePreference) => void
} | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState(readTheme)
  const [systemDark, setSystemDark] = useState(
    () => matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const { notify } = useToast()
  const isDark = preference === 'dark' || (preference === 'system' && systemDark)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  }, [isDark])
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const onMedia = () => setSystemDark(media.matches)
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY || event.key === null) setPreference(readTheme())
    }
    media.addEventListener('change', onMedia)
    window.addEventListener('storage', onStorage)
    return () => {
      media.removeEventListener('change', onMedia)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  function choose(next: ThemePreference) {
    setPreference(next)
    if (!saveTheme(next)) notify('主题已切换，但浏览器禁止保存设置', 'error')
  }
  return (
    <ThemeContext.Provider value={{ isDark, preference, choose }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('主题组件必须置于 ThemeProvider 中')
  return context
}
