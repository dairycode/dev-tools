# Dev-Tools React + Tailwind 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 Vue 3 开发者工具集重构为 React + Tailwind CSS，采用图标侧边栏布局、Indigo/Slate 配色、工具注册表架构。

**Architecture:** 工具注册表模式驱动侧边栏和内容区渲染，每个工具通过 `ToolDefinition` 自描述并 `React.lazy` 懒加载。ToastContext 提供全局消息提示，useTheme hook 管理深色/浅色主题切换。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, lucide-react, crypto-js, qrcode

---

## 文件结构

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| 修改 | `package.json` | 替换 Vue 依赖为 React + Tailwind |
| 修改 | `vite.config.js` → `vite.config.ts` | 切换为 React 插件 |
| 修改 | `tsconfig.json` | 适配 React JSX |
| 修改 | `index.html` | 挂载点 `#app` → `#root` |
| 创建 | `src/index.css` | Tailwind 入口 |
| 创建 | `src/main.tsx` | React 入口 |
| 创建 | `src/App.tsx` | 主布局：侧边栏 + 内容区 |
| 创建 | `src/types/index.ts` | 类型定义 |
| 创建 | `src/context/ToastContext.tsx` | Toast 消息 Context |
| 创建 | `src/hooks/useTheme.ts` | 主题管理 hook |
| 创建 | `src/hooks/useClipboard.ts` | 剪贴板 hook |
| 创建 | `src/components/layout/Sidebar.tsx` | 图标侧边栏 |
| 创建 | `src/components/layout/Toast.tsx` | Toast 消息组件 |
| 创建 | `src/components/tools/registry.ts` | 工具注册表 |
| 创建 | `src/components/tools/UrlEncoder.tsx` | URL 编码/解码 |
| 创建 | `src/components/tools/Base64Encoder.tsx` | Base64 编码/解码 |
| 创建 | `src/components/tools/HashEncoder.tsx` | 哈希计算 |
| 创建 | `src/components/tools/TimestampConverter.tsx` | 时间戳转换 |
| 创建 | `src/components/tools/QrCodeGenerator.tsx` | 二维码生成 |
| 创建 | `src/components/tools/JsonFormatter/index.tsx` | JSON 格式化 |
| 创建 | `src/components/tools/JsonFormatter/JsonTreeNode.tsx` | JSON 树节点 |
| 删除 | `src/App.vue`, `src/main.ts`, `src/style.css` | Vue 入口文件 |
| 删除 | `src/components/*.vue` | Vue 组件 |
| 删除 | `src/composables/useTheme.ts` | Vue composable |
| 删除 | `src/vite-env.d.ts` | Vue 环境类型 |

---

### Task 1: 项目脚手架 — 依赖替换与构建配置

**Files:**
- 修改: `package.json`
- 删除: `vite.config.js`, `tsconfig.node.json`
- 创建: `vite.config.ts`
- 修改: `tsconfig.json`
- 修改: `index.html`

- [ ] **Step 1: 删除 Vue 源文件和依赖**

删除所有 Vue 相关源文件：

```bash
rm -rf src/App.vue src/main.ts src/style.css src/vite-env.d.ts
rm -rf src/components/*.vue src/composables
rm -f vite.config.js tsconfig.node.json
```

- [ ] **Step 2: 更新 package.json**

替换为以下内容（保留 crypto-js 和 qrcode）：

```json
{
  "name": "dev-tools",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "crypto-js": "^4.2.0",
    "lucide-react": "^0.511.0",
    "qrcode": "^1.5.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/crypto-js": "^4.2.2",
    "@types/qrcode": "^1.5.6",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "tailwindcss": "^4.1.4",
    "@tailwindcss/vite": "^4.1.4",
    "typescript": "~5.8.3",
    "vite": "^6.3.2"
  }
}
```

- [ ] **Step 3: 创建 vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
  },
})
```

- [ ] **Step 4: 更新 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: 更新 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>开发工具包</title>
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 6: 创建 Tailwind 入口 CSS**

创建 `src/index.css`：

```css
@import "tailwindcss";
```

- [ ] **Step 7: 创建 React 入口和占位 App**

创建 `src/main.tsx`：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

创建 `src/App.tsx`：

```tsx
export default function App() {
  return <div className="text-slate-900">Dev Tools</div>
}
```

- [ ] **Step 8: 安装依赖并验证构建**

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

预期：构建成功，无错误。

- [ ] **Step 9: 启动开发服务器验证**

```bash
npm run dev
```

预期：浏览器打开 localhost:3000，显示 "Dev Tools" 文本。

- [ ] **Step 10: 提交**

```bash
git add -A
git commit -m "chore: 替换 Vue 为 React + Tailwind 脚手架"
```

---

### Task 2: 类型定义与公共 Hooks

**Files:**
- 创建: `src/types/index.ts`
- 创建: `src/hooks/useTheme.ts`
- 创建: `src/hooks/useClipboard.ts`

- [ ] **Step 1: 创建类型定义**

创建 `src/types/index.ts`：

```ts
import type { ComponentType, LazyExoticComponent } from 'react'

export type MessageType = 'success' | 'error'

export interface ToolDefinition {
  key: string
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  component: LazyExoticComponent<ComponentType>
}

export interface TimestampResult {
  localTime: string
  utcTime: string
  isoTime: string
  seconds: string
  milliseconds: string
}

export interface DateResult {
  selectedDateTime: string
  seconds: string
  milliseconds: string
  localTime: string
  utcTime: string
}

export type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512'
```

- [ ] **Step 2: 创建 useTheme hook**

创建 `src/hooks/useTheme.ts`：

```ts
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
```

- [ ] **Step 3: 创建 useClipboard hook**

创建 `src/hooks/useClipboard.ts`：

```ts
import { useCallback } from 'react'

export function useClipboard() {
  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    }
  }, [])

  return { copy }
}
```

- [ ] **Step 4: 提交**

```bash
git add src/types/index.ts src/hooks/useTheme.ts src/hooks/useClipboard.ts
git commit -m "feat: 添加类型定义和公共 hooks (useTheme, useClipboard)"
```

---

### Task 3: Toast Context 与 Toast 组件

**Files:**
- 创建: `src/context/ToastContext.tsx`
- 创建: `src/components/layout/Toast.tsx`

- [ ] **Step 1: 创建 ToastContext**

创建 `src/context/ToastContext.tsx`：

```tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { MessageType } from '../types'

interface ToastState {
  message: string
  type: MessageType
  visible: boolean
}

interface ToastContextValue {
  showToast: (message: string, type: MessageType) => void
  toast: ToastState
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    visible: false,
  })

  const showToast = useCallback((message: string, type: MessageType) => {
    setToast({ message, type, visible: true })
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
```

- [ ] **Step 2: 创建 Toast 组件**

创建 `src/components/layout/Toast.tsx`：

```tsx
import { useToast } from '../../context/ToastContext'

export default function Toast() {
  const { toast } = useToast()

  if (!toast.visible) return null

  return (
    <div
      className={`fixed top-5 right-5 z-50 max-w-xs px-4 py-3 rounded-lg text-sm font-medium shadow-lg animate-slide-in ${
        toast.type === 'success'
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
          : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
      }`}
    >
      {toast.message}
    </div>
  )
}
```

- [ ] **Step 3: 在 index.css 中添加 slide-in 动画**

更新 `src/index.css`：

```css
@import "tailwindcss";

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

- [ ] **Step 4: 提交**

```bash
git add src/context/ToastContext.tsx src/components/layout/Toast.tsx src/index.css
git commit -m "feat: 添加 Toast Context 和 Toast 组件"
```

---

### Task 4: 侧边栏布局与 App 主框架

**Files:**
- 创建: `src/components/layout/Sidebar.tsx`
- 修改: `src/App.tsx`

- [ ] **Step 1: 创建 Sidebar 组件**

创建 `src/components/layout/Sidebar.tsx`：

```tsx
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
      {/* 桌面端侧边栏 */}
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

      {/* 移动端底部工具条 */}
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
```

- [ ] **Step 2: 更新 App.tsx 主框架**

更新 `src/App.tsx`：

```tsx
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
```

- [ ] **Step 3: 创建占位注册表**

创建 `src/components/tools/registry.ts`（先用占位组件，后续 Task 逐个替换）：

```ts
import { lazy } from 'react'
import { Link, Lock, Hash, Clock, QrCode, Braces } from 'lucide-react'
import type { ToolDefinition } from '../../types'

export const tools: ToolDefinition[] = [
  {
    key: 'url',
    title: 'URL 编码/解码',
    description: 'URL编码和解码工具，支持特殊字符转换',
    icon: Link,
    component: lazy(() => import('./UrlEncoder')),
  },
  {
    key: 'base64',
    title: 'Base64 编码/解码',
    description: 'Base64编码和解码工具',
    icon: Lock,
    component: lazy(() => import('./Base64Encoder')),
  },
  {
    key: 'hash',
    title: 'Hash 编码',
    description: 'MD5、SHA等Hash计算工具',
    icon: Hash,
    component: lazy(() => import('./HashEncoder')),
  },
  {
    key: 'timestamp',
    title: '时间戳转换',
    description: 'Unix时间戳与日期时间互转工具',
    icon: Clock,
    component: lazy(() => import('./TimestampConverter')),
  },
  {
    key: 'qrcode',
    title: '二维码生成',
    description: '生成文本、URL的二维码图片',
    icon: QrCode,
    component: lazy(() => import('./QrCodeGenerator')),
  },
  {
    key: 'json',
    title: 'JSON 格式化',
    description: 'JSON格式化和美化工具',
    icon: Braces,
    component: lazy(() => import('./JsonFormatter')),
  },
]
```

- [ ] **Step 4: 创建 6 个占位工具组件**

每个工具先创建一个占位组件，确保 App 能正常渲染。

`src/components/tools/UrlEncoder.tsx`：
```tsx
export default function UrlEncoder() {
  return <div className="text-slate-500">URL 编码/解码 - 待实现</div>
}
```

`src/components/tools/Base64Encoder.tsx`：
```tsx
export default function Base64Encoder() {
  return <div className="text-slate-500">Base64 编码/解码 - 待实现</div>
}
```

`src/components/tools/HashEncoder.tsx`：
```tsx
export default function HashEncoder() {
  return <div className="text-slate-500">Hash 编码 - 待实现</div>
}
```

`src/components/tools/TimestampConverter.tsx`：
```tsx
export default function TimestampConverter() {
  return <div className="text-slate-500">时间戳转换 - 待实现</div>
}
```

`src/components/tools/QrCodeGenerator.tsx`：
```tsx
export default function QrCodeGenerator() {
  return <div className="text-slate-500">二维码生成 - 待实现</div>
}
```

`src/components/tools/JsonFormatter/index.tsx`：
```tsx
export default function JsonFormatter() {
  return <div className="text-slate-500">JSON 格式化 - 待实现</div>
}
```

- [ ] **Step 5: 验证构建和开发服务器**

```bash
npm run build
```

预期：构建成功。启动 dev server 后应看到图标侧边栏 + 内容区占位文本，点击图标可切换工具，深色/浅色主题切换正常。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: 添加侧边栏布局、App 主框架和工具注册表"
```

---

### Task 5: URL 编码/解码工具

**Files:**
- 修改: `src/components/tools/UrlEncoder.tsx`

- [ ] **Step 1: 实现 UrlEncoder 组件**

替换 `src/components/tools/UrlEncoder.tsx`：

```tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { useToast } from '../../context/ToastContext'

export default function UrlEncoder() {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { showToast } = useToast()

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => { autoResize() }, [text, autoResize])

  const encode = () => {
    if (!text.trim()) return showToast('请输入要编码的文本', 'error')
    try {
      setText(encodeURIComponent(text))
      showToast('URL编码成功', 'success')
    } catch (e) {
      showToast('编码失败：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const decode = () => {
    if (!text.trim()) return showToast('请输入要解码的文本', 'error')
    try {
      setText(decodeURIComponent(text))
      showToast('URL解码成功', 'success')
    } catch {
      try {
        setText(globalThis.decodeURI(text))
        showToast('URI解码成功', 'success')
      } catch (e) {
        showToast('解码失败：' + (e instanceof Error ? e.message : String(e)), 'error')
      }
    }
  }

  const encodeUri = () => {
    if (!text.trim()) return showToast('请输入要编码的文本', 'error')
    try {
      setText(globalThis.encodeURI(text))
      showToast('URI编码成功', 'success')
    } catch (e) {
      showToast('编码失败：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') encode()
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">输入文本</label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入要编码或解码的文本..."
        className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
      />
      <div className="flex gap-2 flex-wrap">
        <button onClick={encode} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">编码</button>
        <button onClick={decode} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">解码</button>
        <button onClick={encodeUri} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">URI编码</button>
        <button onClick={() => setText('')} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证**

启动 dev server，切换到 URL 编码工具，测试编码/解码/URI编码/清空功能，验证 Toast 提示正常。

- [ ] **Step 3: 提交**

```bash
git add src/components/tools/UrlEncoder.tsx
git commit -m "feat: 实现 URL 编码/解码工具"
```

---

### Task 6: Base64 编码/解码工具

**Files:**
- 修改: `src/components/tools/Base64Encoder.tsx`

- [ ] **Step 1: 实现 Base64Encoder 组件**

替换 `src/components/tools/Base64Encoder.tsx`：

```tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { useToast } from '../../context/ToastContext'

export default function Base64Encoder() {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { showToast } = useToast()

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => { autoResize() }, [text, autoResize])

  const encode = () => {
    if (!text.trim()) return showToast('请输入要编码的文本', 'error')
    try {
      setText(btoa(text))
      showToast('Base64编码成功', 'success')
    } catch (e) {
      showToast('编码失败：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const decode = () => {
    if (!text.trim()) return showToast('请输入要解码的文本', 'error')
    try {
      const clean = text.trim()
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 !== 0) {
        return showToast('请输入有效的Base64编码文本', 'error')
      }
      setText(atob(text))
      showToast('Base64解码成功', 'success')
    } catch (e) {
      showToast('解码失败：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') encode()
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">输入文本</label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入要编码或解码的文本..."
        className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
      />
      <div className="flex gap-2 flex-wrap">
        <button onClick={encode} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">编码</button>
        <button onClick={decode} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">解码</button>
        <button onClick={() => setText('')} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证并提交**

```bash
git add src/components/tools/Base64Encoder.tsx
git commit -m "feat: 实现 Base64 编码/解码工具"
```

---

### Task 7: Hash 编码工具

**Files:**
- 修改: `src/components/tools/HashEncoder.tsx`

- [ ] **Step 1: 实现 HashEncoder 组件**

替换 `src/components/tools/HashEncoder.tsx`：

```tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import CryptoJS from 'crypto-js'
import { useToast } from '../../context/ToastContext'
import { useClipboard } from '../../hooks/useClipboard'
import type { HashType } from '../../types'

const hashFns: Record<HashType, (text: string) => string> = {
  md5: t => CryptoJS.MD5(t).toString(),
  sha1: t => CryptoJS.SHA1(t).toString(),
  sha256: t => CryptoJS.SHA256(t).toString(),
  sha512: t => CryptoJS.SHA512(t).toString(),
}

export default function HashEncoder() {
  const [text, setText] = useState('')
  const [hashType, setHashType] = useState<HashType>('md5')
  const [result, setResult] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { showToast } = useToast()
  const { copy } = useClipboard()

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => { autoResize() }, [text, autoResize])

  useEffect(() => {
    if (!text.trim()) { setResult(''); return }
    try {
      setResult(hashFns[hashType](text.trim()))
    } catch (e) {
      showToast('Hash计算失败：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }, [text, hashType, showToast])

  const copyResult = async () => {
    if (!result) return
    const ok = await copy(result)
    if (ok) showToast('Hash值已复制到剪贴板', 'success')
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">输入文本</label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="请输入要计算Hash的文本..."
        className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
      />
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Hash算法</label>
        <select
          value={hashType}
          onChange={e => setHashType(e.target.value as HashType)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="md5">MD5</option>
          <option value="sha1">SHA-1</option>
          <option value="sha256">SHA-256</option>
          <option value="sha512">SHA-512</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setText(''); setResult('') }} className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
      </div>
      {result && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Hash结果</label>
          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-slate-100 break-all">
            {result}
          </div>
          <button onClick={copyResult} className="self-start px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">复制结果</button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 验证并提交**

```bash
git add src/components/tools/HashEncoder.tsx
git commit -m "feat: 实现 Hash 编码工具"
```

---

### Task 8: 时间戳转换工具

**Files:**
- 修改: `src/components/tools/TimestampConverter.tsx`

- [ ] **Step 1: 实现 TimestampConverter 组件**

替换 `src/components/tools/TimestampConverter.tsx`：

```tsx
import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import type { TimestampResult, DateResult } from '../../types'

const emptyTimestamp: TimestampResult = { localTime: '', utcTime: '', isoTime: '', seconds: '', milliseconds: '' }
const emptyDate: DateResult = { selectedDateTime: '', seconds: '', milliseconds: '', localTime: '', utcTime: '' }

export default function TimestampConverter() {
  const [tsInput, setTsInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [tsResult, setTsResult] = useState<TimestampResult>(emptyTimestamp)
  const [dateResult, setDateResult] = useState<DateResult>(emptyDate)
  const { showToast } = useToast()

  const convertTs = () => {
    if (!tsInput.trim()) return showToast('请输入时间戳', 'error')
    const ts = parseInt(tsInput)
    if (isNaN(ts)) return showToast('无效的时间戳格式', 'error')
    const d = new Date(ts > 1e12 ? ts : ts * 1000)
    setTsResult({
      localTime: d.toLocaleString('zh-CN'),
      utcTime: d.toUTCString(),
      isoTime: d.toISOString(),
      seconds: Math.floor(d.getTime() / 1000).toString(),
      milliseconds: d.getTime().toString(),
    })
    showToast('时间戳转换成功', 'success')
  }

  const convertDate = () => {
    if (!dateInput || !timeInput) return showToast('请选择日期和时间', 'error')
    const d = new Date(`${dateInput}T${timeInput}`)
    if (isNaN(d.getTime())) return showToast('无效的日期时间格式', 'error')
    setDateResult({
      selectedDateTime: d.toLocaleString('zh-CN'),
      seconds: Math.floor(d.getTime() / 1000).toString(),
      milliseconds: d.getTime().toString(),
      localTime: d.toLocaleString('zh-CN'),
      utcTime: d.toUTCString(),
    })
    showToast('日期转换成功', 'success')
  }

  const getNow = () => {
    const now = Math.floor(Date.now() / 1000)
    setTsInput(now.toString())
  }

  const setNowDate = () => {
    const now = new Date()
    setDateInput(now.toISOString().split('T')[0])
    setTimeInput(now.toTimeString().split(' ')[0])
  }

  useEffect(() => { getNow(); setNowDate() }, [])

  const ResultRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded break-all max-w-[60%] text-right">{value || '-'}</span>
    </div>
  )

  const sectionClass = "p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"

  return (
    <div className="flex flex-col gap-6">
      <section className={sectionClass}>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 pb-3 border-b-2 border-indigo-500">时间戳转换为日期</h3>
        <div className="flex flex-col gap-4">
          <input value={tsInput} onChange={e => setTsInput(e.target.value)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') convertTs() }} placeholder="请输入Unix时间戳（秒或毫秒）..." className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="flex gap-2 flex-wrap">
            <button onClick={convertTs} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">转换</button>
            <button onClick={getNow} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">当前时间戳</button>
            <button onClick={() => { setTsInput(''); setTsResult(emptyTimestamp) }} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
            <ResultRow label="北京时间" value={tsResult.localTime} />
            <ResultRow label="UTC时间" value={tsResult.utcTime} />
            <ResultRow label="ISO格式" value={tsResult.isoTime} />
            <ResultRow label="秒级时间戳" value={tsResult.seconds} />
            <ResultRow label="毫秒时间戳" value={tsResult.milliseconds} />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 pb-3 border-b-2 border-indigo-500">日期转换为时间戳</h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="time" value={timeInput} onChange={e => setTimeInput(e.target.value)} step="1" className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={convertDate} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">转换</button>
            <button onClick={setNowDate} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">当前时间</button>
            <button onClick={() => { setDateInput(''); setTimeInput(''); setDateResult(emptyDate) }} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
            <ResultRow label="选择的日期时间" value={dateResult.selectedDateTime} />
            <ResultRow label="秒级时间戳" value={dateResult.seconds} />
            <ResultRow label="毫秒时间戳" value={dateResult.milliseconds} />
            <ResultRow label="北京时间" value={dateResult.localTime} />
            <ResultRow label="UTC时间" value={dateResult.utcTime} />
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: 验证并提交**

```bash
git add src/components/tools/TimestampConverter.tsx
git commit -m "feat: 实现时间戳转换工具"
```

---

### Task 9: 二维码生成工具

**Files:**
- 修改: `src/components/tools/QrCodeGenerator.tsx`

- [ ] **Step 1: 实现 QrCodeGenerator 组件**

替换 `src/components/tools/QrCodeGenerator.tsx`：

```tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'
import { useToast } from '../../context/ToastContext'

export default function QrCodeGenerator() {
  const [text, setText] = useState('')
  const [hasQr, setHasQr] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { showToast } = useToast()

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => { autoResize() }, [text, autoResize])

  const generate = async () => {
    if (!text.trim()) return showToast('请输入要生成二维码的内容', 'error')
    try {
      setHasQr(true)
      await new Promise(r => setTimeout(r, 0))
      if (!canvasRef.current) return
      await QRCode.toCanvas(canvasRef.current, text, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      })
      showToast('二维码生成成功', 'success')
    } catch (e) {
      showToast('二维码生成失败：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const download = () => {
    if (!canvasRef.current || !hasQr) return showToast('请先生成二维码', 'error')
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvasRef.current.toDataURL()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('二维码下载成功', 'success')
  }

  const clear = () => {
    setText('')
    setHasQr(false)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate()
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">输入内容</label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入要生成二维码的文本、URL等..."
        className="w-full min-h-[96px] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
      />
      <div className="flex gap-2 flex-wrap">
        <button onClick={generate} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">生成二维码</button>
        <button onClick={download} disabled={!hasQr} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">下载二维码</button>
        <button onClick={clear} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
      </div>
      <div className="flex justify-center">
        <div className="inline-flex items-center justify-center p-6 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-[200px]">
          {hasQr ? (
            <canvas ref={canvasRef} />
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500">二维码将在这里显示</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证并提交**

```bash
git add src/components/tools/QrCodeGenerator.tsx
git commit -m "feat: 实现二维码生成工具"
```

---

### Task 10: JSON 格式化工具

**Files:**
- 修改: `src/components/tools/JsonFormatter/index.tsx`
- 创建: `src/components/tools/JsonFormatter/JsonTreeNode.tsx`

- [ ] **Step 1: 创建 JsonTreeNode 组件**

创建 `src/components/tools/JsonFormatter/JsonTreeNode.tsx`：

```tsx
import { useMemo } from 'react'

interface JsonTreeNodeProps {
  data: unknown
  keyName: string | number
  level: number
  expandedPaths: Set<string>
  parentPath?: string
  onToggle: (path: string) => void
}

export default function JsonTreeNode({ data, keyName, level, expandedPaths, parentPath = '', onToggle }: JsonTreeNodeProps) {
  const currentPath = parentPath ? `${parentPath}.${keyName}` : String(keyName)
  const isExpandable = data !== null && typeof data === 'object'
  const isArray = Array.isArray(data)
  const isExpanded = expandedPaths.has(currentPath)

  const displayKey = typeof keyName === 'number' ? `[${keyName}]` : keyName

  const displayValue = useMemo(() => {
    if (data === null) return 'null'
    if (typeof data === 'string') return `"${data}"`
    return String(data)
  }, [data])

  const valueColorClass = useMemo(() => {
    if (data === null) return 'text-slate-400'
    if (typeof data === 'string') return 'text-emerald-600 dark:text-emerald-400'
    if (typeof data === 'number') return 'text-amber-600 dark:text-amber-400'
    if (typeof data === 'boolean') return 'text-indigo-600 dark:text-indigo-400'
    return 'text-slate-500'
  }, [data])

  const preview = useMemo(() => {
    if (!isExpandable) return ''
    if (isArray) {
      const len = (data as unknown[]).length
      return len === 0 ? '' : `${len} item${len !== 1 ? 's' : ''}`
    }
    const keys = Object.keys(data as object)
    return keys.length === 0 ? '' : `${keys.length} key${keys.length !== 1 ? 's' : ''}`
  }, [data, isExpandable, isArray])

  return (
    <div className="select-none">
      <div className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: level * 20 }}>
        {isExpandable ? (
          <span onClick={() => onToggle(currentPath)} className="w-3.5 h-3.5 text-[10px] text-slate-400 hover:text-indigo-500 cursor-pointer leading-3.5 text-center inline-block">
            {isExpanded ? '▼' : '▶'}
          </span>
        ) : (
          <span className="w-3.5 h-3.5 inline-block" />
        )}
        <span className="text-indigo-600 dark:text-indigo-400 font-medium">{displayKey}</span>
        <span className="text-slate-400">:</span>
        {isExpandable ? (
          <span className="text-slate-400">
            {isArray ? '[' : '{'}
            {!isExpanded && <span className="italic text-xs opacity-70 mx-1.5">{preview}</span>}
            {!isExpanded && (isArray ? ']' : '}')}
          </span>
        ) : (
          <span className={valueColorClass}>{displayValue}</span>
        )}
      </div>
      {isExpandable && isExpanded && (
        <>
          {Object.entries(data as object).map(([k, v]) => (
            <JsonTreeNode
              key={k}
              data={v}
              keyName={isArray ? Number(k) : k}
              level={level + 1}
              expandedPaths={expandedPaths}
              parentPath={currentPath}
              onToggle={onToggle}
            />
          ))}
          <div className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: level * 20 }}>
            <span className="w-3.5 h-3.5 inline-block" />
            <span className="text-slate-400">{isArray ? ']' : '}'}</span>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 实现 JsonFormatter 组件**

替换 `src/components/tools/JsonFormatter/index.tsx`：

```tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { useToast } from '../../../context/ToastContext'
import JsonTreeNode from './JsonTreeNode'

export default function JsonFormatter() {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<unknown>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const parseTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const { showToast } = useToast()

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => { autoResize() }, [text, autoResize])

  const expandAll = useCallback((obj: unknown, prefix = 'root') => {
    const paths = new Set<string>()
    const walk = (o: unknown, p: string) => {
      if (o && typeof o === 'object') {
        paths.add(p)
        Object.keys(o).forEach(k => walk((o as Record<string, unknown>)[k], `${p}.${k}`))
      }
    }
    walk(obj, prefix)
    return paths
  }, [])

  useEffect(() => {
    if (parseTimerRef.current) clearTimeout(parseTimerRef.current)
    if (!text.trim()) { setParsed(null); return }
    parseTimerRef.current = setTimeout(() => {
      try {
        const obj = JSON.parse(text)
        setParsed(obj)
        setExpandedPaths(expandAll(obj))
      } catch {
        setParsed(null)
      }
    }, 500)
    return () => { if (parseTimerRef.current) clearTimeout(parseTimerRef.current) }
  }, [text, expandAll])

  const format = () => {
    if (!text.trim()) return showToast('请输入要格式化的JSON数据', 'error')
    try {
      const obj = JSON.parse(text)
      setText(JSON.stringify(obj, null, 2))
      setParsed(obj)
      setExpandedPaths(expandAll(obj))
      showToast('JSON格式化成功', 'success')
    } catch (e) {
      showToast('JSON格式错误：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const compress = () => {
    if (!text.trim()) return showToast('请输入要压缩的JSON数据', 'error')
    try {
      const obj = JSON.parse(text)
      setText(JSON.stringify(obj))
      setParsed(obj)
      setExpandedPaths(expandAll(obj))
      showToast('JSON压缩成功', 'success')
    } catch (e) {
      showToast('JSON格式错误：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') format()
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">输入JSON</label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入要格式化的JSON数据..."
        className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
      />
      <div className="flex gap-2 flex-wrap">
        <button onClick={format} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">格式化</button>
        <button onClick={compress} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">压缩</button>
        <button onClick={() => { setText(''); setParsed(null); setExpandedPaths(new Set()) }} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
      </div>
      {parsed !== null && (
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm overflow-auto max-h-[600px]">
          <JsonTreeNode data={parsed} keyName="root" level={0} expandedPaths={expandedPaths} onToggle={togglePath} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 验证并提交**

```bash
git add src/components/tools/JsonFormatter/
git commit -m "feat: 实现 JSON 格式化工具（含树形展示）"
```

---

### Task 11: 最终验证与清理

**Files:**
- 删除: `src/components/` 下残留的 Vue 文件（如有）
- 删除: `src/composables/`（如有）

- [ ] **Step 1: 清理残留文件**

```bash
# 确认没有残留的 Vue 文件
find src -name "*.vue" -type f
# 如果有，删除它们
find src -name "*.vue" -type f -delete
# 删除空目录
find src -type d -empty -delete
```

- [ ] **Step 2: 构建验证**

```bash
npm run build
```

预期：构建成功，无 TypeScript 错误，无警告。

- [ ] **Step 3: 全功能验证**

启动 dev server，逐一验证：

1. 侧边栏图标点击切换工具正常
2. 深色/浅色主题切换正常
3. URL 编码/解码/URI编码/清空
4. Base64 编码/解码/清空
5. Hash 实时计算、算法切换、复制结果
6. 时间戳 ↔ 日期双向转换、当前时间
7. 二维码生成、下载、清空
8. JSON 格式化、压缩、树形展开/折叠
9. Toast 消息正常显示和自动消失
10. 移动端响应式布局（底部工具条）

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore: 清理残留文件，完成 React + Tailwind 重构"
```
