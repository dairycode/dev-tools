import type { NavItem } from '../types'
import ThemeToggle from './ThemeToggle'

const navItems: NavItem[] = [
  { key: 'url', title: 'URL编码/解码', icon: '🔗' },
  { key: 'base64', title: 'Base64编码/解码', icon: '🔐' },
  { key: 'hash', title: 'Hash编码', icon: '🔒' },
  { key: 'timestamp', title: '时间戳转换', icon: '⏰' },
  { key: 'qrcode', title: '二维码生成', icon: '📱' },
  { key: 'json', title: 'JSON格式化', icon: '📄' },
]

interface SidebarProps {
  activeTab: string
  onTabChange: (key: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-[280px] bg-gray-50 dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 flex flex-col max-md:w-full max-md:border-r-0 max-md:border-b">
      <div className="px-5 py-6 border-b border-gray-200 dark:border-neutral-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">🔧 开发工具包</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">实用的在线开发工具</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto max-md:flex max-md:overflow-x-auto max-md:px-4 max-md:py-3">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`w-full px-5 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-200 border-none bg-transparent cursor-pointer text-left max-md:shrink-0 max-md:px-4 max-md:py-2 max-md:rounded-lg max-md:whitespace-nowrap ${
              activeTab === item.key
                ? 'bg-blue-50 dark:bg-blue-900/30 text-primary border-r-[3px] border-r-primary max-md:border-r-0'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <span className="text-lg w-6 text-center">{item.icon}</span>
            <span className="flex-1">{item.title}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-neutral-700 flex gap-2 max-md:border-t-0 max-md:px-4 max-md:py-3">
        <a
          href="https://github.com/dairycode/dev-tools"
          target="_blank"
          rel="noopener noreferrer"
          title="查看 GitHub 项目"
          className="flex-1 px-4 py-3 border-none rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-gray-100 text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center no-underline hover:bg-gray-100 dark:hover:bg-neutral-600 hover:-translate-y-px active:translate-y-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <ThemeToggle />
      </div>
    </div>
  )
}
