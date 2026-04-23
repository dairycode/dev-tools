import { useState, Suspense } from 'react'
import { ToastProvider } from './context/ToastContext'
import Toast from './components/layout/Toast'
import Sidebar from './components/layout/Sidebar'
import { tools } from './components/tools/registry'

export default function App() {
  const [activeKey, setActiveKey] = useState(tools[0].key)
  const activeTool = tools.find(t => t.key === activeKey) ?? tools[0]
  const ActiveComponent = activeTool.component

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <Sidebar tools={tools} activeKey={activeKey} onSelect={setActiveKey} />
        <main className="md:pl-16 pb-14 md:pb-0">
          <div className="max-w-3xl mx-auto px-6 py-10">
            <Suspense fallback={<div className="text-slate-400 dark:text-slate-500">加载中...</div>}>
              <ActiveComponent />
            </Suspense>
          </div>
        </main>
        <footer className="md:pl-16 pb-14 md:pb-0 text-center py-4">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 dark:text-slate-600 hover:text-indigo-500 transition-colors"
          >
            沪ICP备2026013272号-1
          </a>
        </footer>
        <Toast />
      </div>
    </ToastProvider>
  )
}
