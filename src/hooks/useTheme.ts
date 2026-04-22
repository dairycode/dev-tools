import { useState, useEffect, useCallback } from 'react'

const THEME_KEY = 'dev-tools-theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_KEY)) {
        setIsDark(e.matches)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), [])

  return { isDark, toggleTheme }
}
