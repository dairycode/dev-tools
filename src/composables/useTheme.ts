import { ref, watch, onMounted, type Ref } from 'vue'

const THEME_KEY = 'dev-tools-theme'
const isDark = ref<boolean>(false)

interface UseThemeReturn {
  isDark: Ref<boolean>
  toggleTheme: () => void
  initTheme: () => void
}

export function useTheme(): UseThemeReturn {
  // 初始化主题
  const initTheme = (): void => {
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 如果没有保存的主题,检查系统偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  // 应用主题到 DOM
  const applyTheme = (): void => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题
  const toggleTheme = (): void => {
    isDark.value = !isDark.value
  }

  // 监听主题变化并保存
  watch(isDark, (newValue: boolean) => {
    localStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light')
    applyTheme()
  })

  // 监听系统主题变化
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent): void => {
      if (!localStorage.getItem(THEME_KEY)) {
        isDark.value = e.matches
      }
    }
    mediaQuery.addEventListener('change', handleChange)
  })

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
