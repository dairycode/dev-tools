import type { ThemePreference } from '../browser/theme'
import { Icon, type IconName } from './Icon'
import { useTheme } from './ThemeProvider'
import { utilityActionClassName } from './Controls'

const modes = {
  system: { label: '跟随系统', icon: 'monitor', next: 'light' },
  light: { label: '亮色模式', icon: 'sun', next: 'dark' },
  dark: { label: '暗色模式', icon: 'moon', next: 'system' },
} as const satisfies Record<
  ThemePreference,
  { label: string; icon: IconName; next: ThemePreference }
>

export function ThemeToggle() {
  const { preference, choose } = useTheme()
  const mode = modes[preference]
  const nextLabel = modes[mode.next].label
  return (
    <button
      type="button"
      className={utilityActionClassName}
      onClick={() => choose(mode.next)}
      aria-label={`主题：${mode.label}，切换到${nextLabel}`}
      title={`切换到${nextLabel}`}
    >
      <Icon name={mode.icon} size={16} />
      <span>{mode.label}</span>
    </button>
  )
}
