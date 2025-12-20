import { ref, watch, onMounted } from 'vue'

const THEME_KEY = 'dev-tools-theme'
const isDark = ref(false)

export function useTheme() {
  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 如果没有保存的主题，检查系统偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  // 应用主题到 DOM
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // 监听主题变化并保存
  watch(isDark, (newValue) => {
    localStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light')
    applyTheme()
  })

  // 监听系统主题变化
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
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
