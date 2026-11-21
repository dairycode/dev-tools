export type ThemePreference = 'light' | 'dark' | 'system'
export const THEME_KEY = 'dev-tools-theme'

export function readTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    // 隐私模式/禁用存储时仍允许本次会话正常使用。
    return 'system'
  }
}

export function saveTheme(preference: ThemePreference): boolean {
  try {
    if (preference === 'system') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, preference)
    return true
  } catch {
    return false
  }
}
