import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  activeTab: string
  onTabChange: (key: string) => void
  children: ReactNode
}

export default function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-200 max-md:flex-col max-md:h-auto">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900">
        <div className="flex-1 p-8 overflow-y-auto max-md:p-6">
          {children}
        </div>
        <div className="px-8 py-4 text-center">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 text-xs no-underline transition-colors duration-200 hover:text-primary"
          >
            沪ICP备2026013272号-1
          </a>
        </div>
      </div>
    </div>
  )
}
