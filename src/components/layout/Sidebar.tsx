import { Sun, Moon, Github } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import type { ToolDefinition } from '../../types'

interface SidebarProps {
  tools: ToolDefinition[]
  activeKey: string
  onSelect: (key: string) => void
}

export default function Sidebar({ tools, activeKey, onSelect }: SidebarProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-16 flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-40">
        <nav className="flex-1 flex flex-col items-center gap-1 pt-4">
          {tools.map(tool => {
            const Icon = tool.icon
            const isActive = activeKey === tool.key
            return (
              <button
                key={tool.key}
                onClick={() => onSelect(tool.key)}
                title={tool.title}
                className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-r" />
                )}
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </nav>
        <div className="flex flex-col items-center gap-2 pb-4">
          <a
            href="https://github.com/dairycode/dev-tools"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <button
            onClick={toggleTheme}
            title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-40">
        {tools.map(tool => {
          const Icon = tool.icon
          const isActive = activeKey === tool.key
          return (
            <button
              key={tool.key}
              onClick={() => onSelect(tool.key)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          )
        })}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </nav>
    </>
  )
}
