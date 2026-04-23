# Vue → React + Tailwind CSS v4 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 Vue 3 开发者工具集 1:1 迁移到 React 18 + Tailwind CSS v4，保持功能和 UI 不变。

**Architecture:** 扁平结构，pages/ 放工具页面，components/ 放共享布局组件，hooks/ 放可复用逻辑。React Router v6 管理路由，Tailwind v4 CSS-first 配置处理样式，`dark:` 变体实现暗色主题。

**Tech Stack:** React 18, TypeScript, Vite, React Router v6, Tailwind CSS v4, crypto-js, qrcode

---

## File Structure

| File | Responsibility |
|------|---------------|
| `package.json` | 新建，React 依赖 |
| `vite.config.ts` | Vite + React 插件配置 |
| `tsconfig.json` | TypeScript 配置（JSX） |
| `tsconfig.app.json` | App 级 TS 配置 |
| `tsconfig.node.json` | Node 级 TS 配置 |
| `index.html` | 入口 HTML |
| `src/main.tsx` | React 入口，挂载 App |
| `src/index.css` | Tailwind v4 指令 + 自定义 theme |
| `src/App.tsx` | 根组件，BrowserRouter + Layout |
| `src/router.tsx` | 路由配置 |
| `src/types/index.ts` | 共享类型定义 |
| `src/hooks/useTheme.ts` | 暗色主题 hook |
| `src/hooks/useClipboard.ts` | 剪贴板 hook |
| `src/hooks/useAutoResize.ts` | textarea 自动高度 hook |
| `src/hooks/useMessage.ts` | toast 消息 hook |
| `src/components/Layout.tsx` | 主布局：侧边栏 + Outlet |
| `src/components/Sidebar.tsx` | 导航侧边栏 |
| `src/components/ThemeToggle.tsx` | 主题切换按钮 |
| `src/components/Toast.tsx` | Toast 消息组件 |
| `src/pages/UrlEncoder.tsx` | URL 编解码 |
| `src/pages/Base64Encoder.tsx` | Base64 编解码 |
| `src/pages/HashEncoder.tsx` | Hash 编码 |
| `src/pages/TimestampConverter.tsx` | 时间戳转换 |
| `src/pages/QrCodeGenerator.tsx` | 二维码生成 |
| `src/pages/JsonFormatter.tsx` | JSON 格式化 |
| `src/pages/JsonTreeNode.tsx` | JSON 树形节点 |
| `src/vite-env.d.ts` | Vite 类型声明 |

---

## Task 1: 项目脚手架 — 初始化 React + Vite + Tailwind v4

**Files:**
- Delete: `src/` (全部 Vue 源码)
- Delete: `vite.config.js`, `tsconfig.json`, `tsconfig.node.json`, `package.json`, `package-lock.json`
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/vite-env.d.ts`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.tsx`

- [ ] **Step 1: 删除旧 Vue 源码和配置**

```bash
rm -rf src/ vite.config.js tsconfig.json tsconfig.node.json package.json package-lock.json node_modules/
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "dev-tools",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "crypto-js": "^4.2.0",
    "qrcode": "^1.5.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@types/crypto-js": "^4.2.2",
    "@types/qrcode": "^1.5.6",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "typescript": "~5.6.2",
    "vite": "^6.0.0"
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
    open: true
  }
})
```

- [ ] **Step 4: 创建 tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 5: 创建 tsconfig.app.json**

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

- [ ] **Step 6: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 7: 创建 index.html**

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

- [ ] **Step 8: 创建 src/vite-env.d.ts**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 9: 创建 src/index.css**

```css
@import "tailwindcss";

@theme {
  --color-primary: #1976d2;
  --color-primary-hover: #1565c0;
  --color-primary-light: rgba(25, 118, 210, 0.1);
  --color-success: #28a745;
  --color-success-hover: #1e7e34;
  --color-danger: #dc3545;
  --color-danger-hover: #c82333;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

- [ ] **Step 10: 创建 src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 11: 创建 src/App.tsx（最小占位）**

```tsx
export default function App() {
  return <div className="text-lg p-8">Dev Tools - React Migration</div>
}
```

- [ ] **Step 12: 安装依赖并验证**

```bash
npm install
npm run dev
```

Expected: 开发服务器在 http://localhost:3000 启动，页面显示 "Dev Tools - React Migration"。

- [ ] **Step 13: 提交**

```bash
git add -A
git commit -m "chore: init React + Vite + Tailwind v4 scaffold"
```

---

## Task 2: 共享类型定义 + Hooks

**Files:**
- Create: `src/types/index.ts`
- Create: `src/hooks/useTheme.ts`
- Create: `src/hooks/useClipboard.ts`
- Create: `src/hooks/useAutoResize.ts`
- Create: `src/hooks/useMessage.ts`

- [ ] **Step 1: 创建 src/types/index.ts**

```ts
export type MessageType = 'success' | 'error'

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

export interface NavItem {
  path: string
  title: string
  icon: string
}
```

- [ ] **Step 2: 创建 src/hooks/useTheme.ts**

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
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_KEY)) {
        setIsDark(e.matches)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), [])

  return { isDark, toggleTheme }
}
```

- [ ] **Step 3: 创建 src/hooks/useClipboard.ts**

```ts
import { useCallback } from 'react'

export function useClipboard() {
  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  }, [])

  return { copy }
}
```

- [ ] **Step 4: 创建 src/hooks/useAutoResize.ts**

```ts
import { useCallback, useEffect, type RefObject } from 'react'

export function useAutoResize(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  const resize = useCallback(() => {
    const area = ref.current
    if (area) {
      area.style.height = 'auto'
      area.style.height = area.scrollHeight + 'px'
    }
  }, [ref])

  useEffect(() => {
    resize()
  }, [value, resize])

  return resize
}
```

- [ ] **Step 5: 创建 src/hooks/useMessage.ts**

```ts
import { useState, useCallback, useRef } from 'react'
import type { MessageType } from '../types'

export function useMessage() {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('success')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const showMessage = useCallback((text: string, type: MessageType) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessage(text)
    setMessageType(type)
    timerRef.current = setTimeout(() => setMessage(''), 3000)
  }, [])

  const clearMessage = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessage('')
  }, [])

  return { message, messageType, showMessage, clearMessage }
}
```

- [ ] **Step 6: 提交**

```bash
git add src/types/ src/hooks/
git commit -m "feat: add shared types and hooks"
```

---

## Task 3: 布局组件 + 路由

**Files:**
- Create: `src/components/Toast.tsx`
- Create: `src/components/ThemeToggle.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Layout.tsx`
- Create: `src/router.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建 src/components/Toast.tsx**

```tsx
import type { MessageType } from '../types'

interface ToastProps {
  message: string
  type: MessageType
}

export default function Toast({ message, type }: ToastProps) {
  if (!message) return null

  const bgClass = type === 'success'
    ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
    : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700'

  return (
    <div className={`fixed top-5 right-5 z-[1000] max-w-[300px] px-4 py-3 rounded-lg border text-sm font-medium shadow-lg animate-slide-in ${bgClass}`}>
      {message}
    </div>
  )
}
```

- [ ] **Step 2: 创建 src/components/ThemeToggle.tsx**

```tsx
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? '切换到亮色模式' : '切换到黑夜模式'}
      className="flex-1 px-4 py-3 border-none rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-gray-100 text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2.5 hover:bg-gray-100 dark:hover:bg-neutral-600 hover:-translate-y-px active:translate-y-0"
    >
      <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
    </button>
  )
}
```

- [ ] **Step 3: 创建 src/components/Sidebar.tsx**

```tsx
import { NavLink } from 'react-router-dom'
import type { NavItem } from '../types'
import ThemeToggle from './ThemeToggle'

const navItems: NavItem[] = [
  { path: '/url-encoder', title: 'URL编码/解码', icon: '🔗' },
  { path: '/base64', title: 'Base64编码/解码', icon: '🔐' },
  { path: '/hash', title: 'Hash编码', icon: '🔒' },
  { path: '/timestamp', title: '时间戳转换', icon: '⏰' },
  { path: '/qrcode', title: '二维码生成', icon: '📱' },
  { path: '/json', title: 'JSON格式化', icon: '📄' },
]

export default function Sidebar() {
  return (
    <div className="w-[280px] bg-gray-50 dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 flex flex-col max-md:w-full max-md:border-r-0 max-md:border-b">
      <div className="px-5 py-6 border-b border-gray-200 dark:border-neutral-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">🔧 开发工具包</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">实用的在线开发工具</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto max-md:flex max-md:overflow-x-auto max-md:px-4 max-md:py-3">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `w-full px-5 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-200 max-md:shrink-0 max-md:px-4 max-md:py-2 max-md:rounded-lg max-md:whitespace-nowrap ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-primary border-r-[3px] border-primary max-md:border-r-0'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-gray-600 dark:hover:text-gray-300'
              }`
            }
          >
            <span className="text-lg w-6 text-center">{item.icon}</span>
            <span className="flex-1">{item.title}</span>
          </NavLink>
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
```

- [ ] **Step 4: 创建 src/components/Layout.tsx**

```tsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-200 max-md:flex-col max-md:h-auto">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900">
        <div className="flex-1 p-8 overflow-y-auto max-md:p-6">
          <Outlet />
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
```

- [ ] **Step 5: 创建 src/router.tsx（占位页面）**

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'

function Placeholder({ name }: { name: string }) {
  return <div className="text-lg">{name} - Coming Soon</div>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/url-encoder" replace /> },
      { path: 'url-encoder', element: <Placeholder name="URL编码/解码" /> },
      { path: 'base64', element: <Placeholder name="Base64编码/解码" /> },
      { path: 'hash', element: <Placeholder name="Hash编码" /> },
      { path: 'timestamp', element: <Placeholder name="时间戳转换" /> },
      { path: 'qrcode', element: <Placeholder name="二维码生成" /> },
      { path: 'json', element: <Placeholder name="JSON格式化" /> },
    ],
  },
])
```

- [ ] **Step 6: 更新 src/App.tsx**

```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

export default function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 7: 更新 src/index.css — 添加 slide-in 动画和 dark 选择器配置**

在 `src/index.css` 末尾追加：

```css
@utility animate-slide-in {
  animation: slide-in 0.3s ease;
}

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
```

- [ ] **Step 8: 验证**

```bash
npm run dev
```

Expected: 侧边栏导航正常显示 6 个工具链接，点击可切换路由，暗色主题切换正常，GitHub 链接和备案链接正常。

- [ ] **Step 9: 提交**

```bash
git add src/components/ src/router.tsx src/App.tsx src/index.css
git commit -m "feat: add layout, sidebar, routing, and theme toggle"
```

---

## Task 4: URL 编解码页面

**Files:**
- Create: `src/pages/UrlEncoder.tsx`
- Modify: `src/router.tsx` — 替换占位组件

- [ ] **Step 1: 创建 src/pages/UrlEncoder.tsx**

```tsx
import { useState, useRef } from 'react'
import { useAutoResize } from '../hooks/useAutoResize'
import { useMessage } from '../hooks/useMessage'
import Toast from '../components/Toast'

export default function UrlEncoder() {
  const [inputText, setInputText] = useState('')
  const { message, messageType, showMessage, clearMessage } = useMessage()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useAutoResize(inputRef, inputText)

  const handleEncode = () => {
    if (!inputText.trim()) {
      showMessage('请输入要编码的文本', 'error')
      return
    }
    try {
      setInputText(encodeURIComponent(inputText))
      showMessage('URL编码成功！', 'success')
    } catch (error) {
      showMessage('编码失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const handleDecode = () => {
    if (!inputText.trim()) {
      showMessage('请输入要解码的文本', 'error')
      return
    }
    try {
      setInputText(decodeURIComponent(inputText))
      showMessage('URL解码成功！', 'success')
    } catch {
      try {
        setInputText(decodeURI(inputText))
        showMessage('URI解码成功！', 'success')
      } catch (error) {
        showMessage('解码失败：' + (error instanceof Error ? error.message : String(error)), 'error')
      }
    }
  }

  const handleEncodeURI = () => {
    if (!inputText.trim()) {
      showMessage('请输入要编码的文本', 'error')
      return
    }
    try {
      setInputText(encodeURI(inputText))
      showMessage('URI编码成功！', 'success')
    } catch (error) {
      showMessage('编码失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    clearMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleEncode()
  }

  return (
    <div className="flex flex-col gap-8 items-center pt-[10vh] min-h-full max-md:gap-6 max-md:pt-[5vh]">
      <div className="flex flex-col gap-6 w-full max-w-[800px]">
        <div className="mb-0">
          <label htmlFor="url-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">
            输入文本
          </label>
          <textarea
            id="url-input"
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入要编码或解码的文本..."
            className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 min-h-[120px] resize-none overflow-y-hidden leading-relaxed transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light max-md:min-h-[100px] max-md:px-3.5 max-md:py-3 max-md:text-sm"
          />
        </div>

        <div className="flex gap-3 flex-wrap max-md:flex-col">
          <button onClick={handleEncode} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
            编码
          </button>
          <button onClick={handleDecode} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">
            解码
          </button>
          <button onClick={handleEncodeURI} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">
            URI编码
          </button>
          <button onClick={handleClear} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">
            清空
          </button>
        </div>
      </div>
      <Toast message={message} type={messageType} />
    </div>
  )
}
```

- [ ] **Step 2: 更新 src/router.tsx — 替换 url-encoder 占位**

将 `url-encoder` 路由的 `element` 改为：

```tsx
import UrlEncoder from './pages/UrlEncoder'
// ...
{ path: 'url-encoder', element: <UrlEncoder /> },
```

- [ ] **Step 3: 验证**

```bash
npm run dev
```

Expected: 访问 `/url-encoder`，输入文本后点击编码/解码/URI编码/清空按钮均正常工作，Ctrl+Enter 快捷键触发编码，toast 消息 3 秒后消失。

- [ ] **Step 4: 提交**

```bash
git add src/pages/UrlEncoder.tsx src/router.tsx
git commit -m "feat: add URL encoder/decoder page"
```

---

## Task 5: Base64 编解码页面

**Files:**
- Create: `src/pages/Base64Encoder.tsx`
- Modify: `src/router.tsx`

- [ ] **Step 1: 创建 src/pages/Base64Encoder.tsx**

```tsx
import { useState, useRef } from 'react'
import { useAutoResize } from '../hooks/useAutoResize'
import { useMessage } from '../hooks/useMessage'
import Toast from '../components/Toast'

export default function Base64Encoder() {
  const [inputText, setInputText] = useState('')
  const { message, messageType, showMessage, clearMessage } = useMessage()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useAutoResize(inputRef, inputText)

  const handleEncode = () => {
    if (!inputText.trim()) {
      showMessage('请输入要编码的文本', 'error')
      return
    }
    try {
      setInputText(btoa(inputText))
      showMessage('Base64编码成功！', 'success')
    } catch (error) {
      showMessage('编码失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const handleDecode = () => {
    if (!inputText.trim()) {
      showMessage('请输入要解码的文本', 'error')
      return
    }
    try {
      const cleanInput = inputText.trim()
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
      if (!base64Regex.test(cleanInput) || cleanInput.length % 4 !== 0) {
        showMessage('请输入有效的Base64编码文本', 'error')
        return
      }
      setInputText(atob(inputText))
      showMessage('Base64解码成功！', 'success')
    } catch (error) {
      showMessage('解码失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    clearMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleEncode()
  }

  return (
    <div className="flex flex-col gap-8 items-center pt-[10vh] min-h-full max-md:gap-6 max-md:pt-[5vh]">
      <div className="flex flex-col gap-6 w-full max-w-[800px]">
        <div className="mb-0">
          <label htmlFor="base64-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">
            输入文本
          </label>
          <textarea
            id="base64-input"
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入要编码或解码的文本..."
            className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 min-h-[120px] resize-none overflow-y-hidden leading-relaxed transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light max-md:min-h-[100px] max-md:px-3.5 max-md:py-3 max-md:text-sm"
          />
        </div>

        <div className="flex gap-3 flex-wrap max-md:flex-col">
          <button onClick={handleEncode} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg max-md:flex-none">
            编码
          </button>
          <button onClick={handleDecode} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">
            解码
          </button>
          <button onClick={handleClear} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">
            清空
          </button>
        </div>
      </div>
      <Toast message={message} type={messageType} />
    </div>
  )
}
```

- [ ] **Step 2: 更新 src/router.tsx — 替换 base64 占位**

```tsx
import Base64Encoder from './pages/Base64Encoder'
// ...
{ path: 'base64', element: <Base64Encoder /> },
```

- [ ] **Step 3: 验证并提交**

```bash
npm run dev
# 验证 /base64 页面功能正常
git add src/pages/Base64Encoder.tsx src/router.tsx
git commit -m "feat: add Base64 encoder/decoder page"
```

---

## Task 6: Hash 编码页面

**Files:**
- Create: `src/pages/HashEncoder.tsx`
- Modify: `src/router.tsx`

- [ ] **Step 1: 创建 src/pages/HashEncoder.tsx**

```tsx
import { useState, useRef, useEffect } from 'react'
import CryptoJS from 'crypto-js'
import { useAutoResize } from '../hooks/useAutoResize'
import { useMessage } from '../hooks/useMessage'
import { useClipboard } from '../hooks/useClipboard'
import type { HashType } from '../types'
import Toast from '../components/Toast'

export default function HashEncoder() {
  const [inputText, setInputText] = useState('')
  const [hashResult, setHashResult] = useState('')
  const [selectedHashType, setSelectedHashType] = useState<HashType>('md5')
  const { message, messageType, showMessage } = useMessage()
  const { copy } = useClipboard()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useAutoResize(inputRef, inputText)

  const calculateHash = (text: string, type: HashType) => {
    if (!text.trim()) {
      setHashResult('')
      return
    }
    try {
      const trimmed = text.trim()
      let result = ''
      switch (type) {
        case 'md5': result = CryptoJS.MD5(trimmed).toString(); break
        case 'sha1': result = CryptoJS.SHA1(trimmed).toString(); break
        case 'sha256': result = CryptoJS.SHA256(trimmed).toString(); break
        case 'sha512': result = CryptoJS.SHA512(trimmed).toString(); break
      }
      setHashResult(result)
    } catch (error) {
      showMessage('Hash计算失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  useEffect(() => {
    calculateHash(inputText, selectedHashType)
  }, [inputText, selectedHashType])

  const handleCopy = async () => {
    if (!hashResult) return
    const ok = await copy(hashResult)
    if (ok) showMessage('Hash值已复制到剪贴板！', 'success')
  }

  const handleClear = () => {
    setInputText('')
    setHashResult('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') calculateHash(inputText, selectedHashType)
  }

  return (
    <div className="flex flex-col gap-8 items-center pt-[10vh] min-h-full w-full max-w-[800px] mx-auto max-md:gap-6 max-md:pt-[5vh] max-md:px-4">
      <div className="w-full flex flex-col gap-6">
        <div>
          <label htmlFor="input-text" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">
            输入文本
          </label>
          <textarea
            id="input-text"
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入要计算Hash的文本..."
            className="w-full px-3 py-3 border-[1.5px] border-gray-300 dark:border-neutral-600 rounded-lg text-[13px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 min-h-[120px] resize-none overflow-y-hidden leading-relaxed transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light max-md:min-h-[100px]"
          />
        </div>

        <div>
          <label htmlFor="hash-type" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">
            选择Hash算法：
          </label>
          <select
            id="hash-type"
            value={selectedHashType}
            onChange={e => setSelectedHashType(e.target.value as HashType)}
            className="appearance-none cursor-pointer border-[1.5px] border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2.5 pr-9 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 shadow-sm min-w-[180px] transition-all duration-300 hover:border-primary hover:shadow-md hover:-translate-y-px focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23495057%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] bg-[length:14px]"
          >
            <option value="md5">MD5</option>
            <option value="sha1">SHA-1</option>
            <option value="sha256">SHA-256</option>
            <option value="sha512">SHA-512</option>
          </select>
        </div>

        <div className="flex gap-3 flex-wrap max-md:flex-col">
          <button onClick={() => calculateHash(inputText, selectedHashType)} className="px-5 py-2.5 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 min-w-[100px] bg-primary text-white hover:bg-primary-hover hover:-translate-y-px max-md:w-full">
            计算Hash
          </button>
          <button onClick={handleClear} className="px-5 py-2.5 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 min-w-[100px] bg-gray-500 dark:bg-gray-600 text-white hover:bg-gray-600 dark:hover:bg-gray-500 hover:-translate-y-px max-md:w-full">
            清空
          </button>
        </div>
      </div>

      {hashResult && (
        <div className="w-full flex flex-col gap-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">Hash结果：</label>
            <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg border border-gray-300 dark:border-neutral-600">
              <div className="font-mono text-sm break-all text-gray-900 dark:text-gray-100 leading-relaxed">{hashResult}</div>
            </div>
            <button onClick={handleCopy} className="mt-2 px-5 py-2.5 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 bg-success text-white hover:bg-success-hover hover:-translate-y-px">
              复制结果
            </button>
          </div>
        </div>
      )}
      <Toast message={message} type={messageType} />
    </div>
  )
}
```

- [ ] **Step 2: 更新 src/router.tsx — 替换 hash 占位**

```tsx
import HashEncoder from './pages/HashEncoder'
// ...
{ path: 'hash', element: <HashEncoder /> },
```

- [ ] **Step 3: 验证并提交**

```bash
npm run dev
# 验证 /hash 页面：输入文本实时计算，切换算法重新计算，复制功能正常
git add src/pages/HashEncoder.tsx src/router.tsx
git commit -m "feat: add Hash encoder page"
```

---

## Task 7: 时间戳转换页面

**Files:**
- Create: `src/pages/TimestampConverter.tsx`
- Modify: `src/router.tsx`

- [ ] **Step 1: 创建 src/pages/TimestampConverter.tsx**

```tsx
import { useState, useEffect, useRef } from 'react'
import { useMessage } from '../hooks/useMessage'
import type { TimestampResult, DateResult } from '../types'
import Toast from '../components/Toast'

const emptyTimestampResult: TimestampResult = { localTime: '', utcTime: '', isoTime: '', seconds: '', milliseconds: '' }
const emptyDateResult: DateResult = { selectedDateTime: '', seconds: '', milliseconds: '', localTime: '', utcTime: '' }

export default function TimestampConverter() {
  const [timestampInput, setTimestampInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [timestampResult, setTimestampResult] = useState<TimestampResult>(emptyTimestampResult)
  const [dateResult, setDateResult] = useState<DateResult>(emptyDateResult)
  const { message, messageType, showMessage } = useMessage()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)

  const convertTimestampToDate = (input?: string) => {
    const val = input ?? timestampInput
    if (!val.trim()) {
      showMessage('请输入时间戳', 'error')
      return
    }
    try {
      const timestamp = parseInt(val)
      if (isNaN(timestamp)) throw new Error('无效的时间戳格式')
      const isMilliseconds = timestamp > 1000000000000
      const date = new Date(isMilliseconds ? timestamp : timestamp * 1000)
      setTimestampResult({
        localTime: date.toLocaleString('zh-CN'),
        utcTime: date.toUTCString(),
        isoTime: date.toISOString(),
        seconds: Math.floor(date.getTime() / 1000).toString(),
        milliseconds: date.getTime().toString(),
      })
      showMessage('时间戳转换成功！', 'success')
    } catch (error) {
      showMessage('转换失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const convertDateToTimestamp = (d?: string, t?: string) => {
    const dVal = d ?? dateInput
    const tVal = t ?? timeInput
    if (!dVal || !tVal) {
      showMessage('请选择日期和时间', 'error')
      return
    }
    try {
      const date = new Date(`${dVal}T${tVal}`)
      if (isNaN(date.getTime())) throw new Error('无效的日期时间格式')
      setDateResult({
        selectedDateTime: date.toLocaleString('zh-CN'),
        seconds: Math.floor(date.getTime() / 1000).toString(),
        milliseconds: date.getTime().toString(),
        localTime: date.toLocaleString('zh-CN'),
        utcTime: date.toUTCString(),
      })
      showMessage('日期转换成功！', 'success')
    } catch (error) {
      showMessage('转换失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const getCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000).toString()
    setTimestampInput(now)
    convertTimestampToDate(now)
  }

  const setCurrentDateTime = () => {
    const now = new Date()
    const d = now.toISOString().split('T')[0]
    const t = now.toTimeString().split(' ')[0]
    setDateInput(d)
    setTimeInput(t)
    convertDateToTimestamp(d, t)
  }

  const clearTimestamp = () => {
    setTimestampInput('')
    setTimestampResult(emptyTimestampResult)
  }

  const clearDateTime = () => {
    setDateInput('')
    setTimeInput('')
    setDateResult(emptyDateResult)
  }

  useEffect(() => {
    getCurrentTimestamp()
    setCurrentDateTime()
  }, [])

  const resultRow = (label: string, value: string) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-neutral-700 last:border-b-0 max-md:flex-col max-md:items-start max-md:gap-1">
      <span className="font-medium text-gray-600 dark:text-gray-300 text-sm">{label}</span>
      <span className="font-mono text-[13px] text-primary bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded break-all max-md:w-full max-md:text-left">{value || '-'}</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-10 items-center pt-[5vh] min-h-full max-md:gap-6 max-md:pt-[3vh]">
      {/* 时间戳转日期 */}
      <div className="w-full max-w-[800px] bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm dark:shadow-neutral-800/50 max-md:p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 pb-3 border-b-2 border-primary">时间戳转换为日期</h3>
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="timestamp-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">时间戳</label>
            <input
              type="text"
              id="timestamp-input"
              value={timestampInput}
              onChange={e => setTimestampInput(e.target.value)}
              onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') convertTimestampToDate() }}
              placeholder="请输入Unix时间戳（秒或毫秒）..."
              className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light"
            />
          </div>
          <div className="flex gap-3 flex-wrap max-md:flex-col">
            <button onClick={() => convertTimestampToDate()} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg max-md:flex-none">转换</button>
            <button onClick={getCurrentTimestamp} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">当前时间戳</button>
            <button onClick={clearTimestamp} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">清空</button>
          </div>
          <div className="mt-2">
            <label className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">转换结果</label>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              {resultRow('北京时间：', timestampResult.localTime)}
              {resultRow('UTC时间：', timestampResult.utcTime)}
              {resultRow('ISO格式：', timestampResult.isoTime)}
              {resultRow('秒级时间戳：', timestampResult.seconds)}
              {resultRow('毫秒时间戳：', timestampResult.milliseconds)}
            </div>
          </div>
        </div>
      </div>

      {/* 日期转时间戳 */}
      <div className="w-full max-w-[800px] bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm dark:shadow-neutral-800/50 max-md:p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 pb-3 border-b-2 border-primary">日期转换为时间戳</h3>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-3">
            <div>
              <label htmlFor="date-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">日期</label>
              <input
                type="date"
                id="date-input"
                ref={dateInputRef}
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                onClick={() => dateInputRef.current?.showPicker()}
                className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light"
              />
            </div>
            <div>
              <label htmlFor="time-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">时间</label>
              <input
                type="time"
                id="time-input"
                ref={timeInputRef}
                value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
                onClick={() => timeInputRef.current?.showPicker()}
                className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light"
              />
            </div>
          </div>
          <div className="flex gap-3 flex-wrap max-md:flex-col">
            <button onClick={() => convertDateToTimestamp()} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg max-md:flex-none">转换</button>
            <button onClick={setCurrentDateTime} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">当前时间</button>
            <button onClick={clearDateTime} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">清空</button>
          </div>
          <div className="mt-2">
            <label className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">转换结果</label>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              {resultRow('选择的日期时间：', dateResult.selectedDateTime)}
              {resultRow('秒级时间戳：', dateResult.seconds)}
              {resultRow('毫秒时间戳：', dateResult.milliseconds)}
              {resultRow('北京时间：', dateResult.localTime)}
              {resultRow('UTC时间：', dateResult.utcTime)}
            </div>
          </div>
        </div>
      </div>
      <Toast message={message} type={messageType} />
    </div>
  )
}
```

- [ ] **Step 2: 更新 src/router.tsx — 替换 timestamp 占位**

```tsx
import TimestampConverter from './pages/TimestampConverter'
// ...
{ path: 'timestamp', element: <TimestampConverter /> },
```

- [ ] **Step 3: 验证并提交**

```bash
npm run dev
# 验证 /timestamp：双向转换、当前时间戳、日期选择器、清空
git add src/pages/TimestampConverter.tsx src/router.tsx
git commit -m "feat: add timestamp converter page"
```

---

## Task 8: 二维码生成页面

**Files:**
- Create: `src/pages/QrCodeGenerator.tsx`
- Modify: `src/router.tsx`

- [ ] **Step 1: 创建 src/pages/QrCodeGenerator.tsx**

```tsx
import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { useAutoResize } from '../hooks/useAutoResize'
import { useMessage } from '../hooks/useMessage'
import Toast from '../components/Toast'

export default function QrCodeGenerator() {
  const [inputText, setInputText] = useState('')
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { message, messageType, showMessage, clearMessage } = useMessage()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useAutoResize(inputRef, inputText)

  const generateQR = async () => {
    if (!inputText.trim()) {
      showMessage('请输入要生成二维码的内容', 'error')
      return
    }
    setIsLoading(true)
    setQrCodeGenerated(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 0))
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      await QRCode.toCanvas(canvasRef.current, inputText, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      })
      showMessage('二维码生成成功！', 'success')
    } catch (error) {
      showMessage('二维码生成失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadQR = () => {
    if (!qrCodeGenerated || !canvasRef.current) {
      showMessage('请先生成二维码', 'error')
      return
    }
    try {
      const link = document.createElement('a')
      link.download = 'qrcode.png'
      link.href = canvasRef.current.toDataURL()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showMessage('二维码下载成功！', 'success')
    } catch (error) {
      showMessage('下载失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    setQrCodeGenerated(false)
    clearMessage()
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generateQR()
  }

  return (
    <div className="flex flex-col gap-8 items-center pt-[10vh] min-h-full max-md:gap-6 max-md:pt-[5vh]">
      <div className="flex flex-col gap-6 w-full max-w-[800px]">
        <div>
          <label htmlFor="qr-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">输入内容</label>
          <textarea
            id="qr-input"
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入要生成二维码的文本、URL等..."
            className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 min-h-[96px] resize-none overflow-y-hidden leading-relaxed transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light max-md:min-h-[72px]"
          />
        </div>

        <div className="flex gap-3 flex-wrap max-md:flex-col">
          <button onClick={generateQR} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg max-md:flex-none">生成二维码</button>
          <button onClick={downloadQR} disabled={!qrCodeGenerated} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">下载二维码</button>
          <button onClick={handleClear} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">清空</button>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-[800px]">
        <div className="text-center mt-6">
          <div className="inline-flex p-6 bg-gray-50 dark:bg-neutral-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-600 min-h-[200px] items-center justify-center max-md:min-h-[150px]">
            {isLoading && <div className="inline-block w-5 h-5 border-2 border-gray-300 dark:border-neutral-600 border-t-primary rounded-full animate-spin" />}
            <canvas ref={canvasRef} className={`max-w-[200px] h-auto ${qrCodeGenerated ? 'block' : 'hidden'}`} style={{ margin: '0 auto' }} />
            {!qrCodeGenerated && !isLoading && <p className="text-gray-500 dark:text-gray-400 m-0">二维码将在这里显示</p>}
          </div>
        </div>
      </div>
      <Toast message={message} type={messageType} />
    </div>
  )
}
```

- [ ] **Step 2: 更新 src/router.tsx — 替换 qrcode 占位**

```tsx
import QrCodeGenerator from './pages/QrCodeGenerator'
// ...
{ path: 'qrcode', element: <QrCodeGenerator /> },
```

- [ ] **Step 3: 验证并提交**

```bash
npm run dev
# 验证 /qrcode：生成、下载、清空、加载状态
git add src/pages/QrCodeGenerator.tsx src/router.tsx
git commit -m "feat: add QR code generator page"
```

---

## Task 9: JSON 格式化页面（含 JsonTreeNode）

**Files:**
- Create: `src/pages/JsonTreeNode.tsx`
- Create: `src/pages/JsonFormatter.tsx`
- Modify: `src/router.tsx`

- [ ] **Step 1: 创建 src/pages/JsonTreeNode.tsx**

```tsx
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
  const isExpanded = expandedPaths.has(currentPath)
  const isExpandable = data !== null && typeof data === 'object'
  const isArray = Array.isArray(data)

  const displayKey = typeof keyName === 'number' ? `[${keyName}]` : keyName

  const getDisplayValue = () => {
    if (data === null) return 'null'
    if (typeof data === 'string') return `"${data}"`
    return String(data)
  }

  const getValueClass = () => {
    if (data === null) return 'text-primary'
    if (typeof data === 'string') return 'text-primary'
    if (typeof data === 'number') return 'text-primary'
    if (typeof data === 'boolean') return 'text-primary'
    return ''
  }

  const getCollapsedPreview = () => {
    if (!isExpandable) return ''
    if (isArray) {
      const len = (data as unknown[]).length
      return len === 0 ? '' : `${len} item${len !== 1 ? 's' : ''}`
    }
    const keys = Object.keys(data as object)
    return keys.length === 0 ? '' : `${keys.length} key${keys.length !== 1 ? 's' : ''}`
  }

  return (
    <div className="select-none">
      <div className="flex items-center gap-1.5 py-0.5 leading-relaxed" style={{ paddingLeft: level * 20 }}>
        {isExpandable ? (
          <span
            onClick={() => onToggle(currentPath)}
            className="inline-block w-3.5 h-3.5 cursor-pointer text-gray-500 dark:text-gray-400 text-[10px] text-center leading-[14px] transition-transform duration-200 hover:text-primary"
          >
            {isExpanded ? '▼' : '▶'}
          </span>
        ) : (
          <span className="inline-block w-3.5 h-3.5" />
        )}

        <span className="text-primary font-medium">{displayKey}</span>
        <span className="text-gray-500 dark:text-gray-400">:</span>

        {!isExpandable ? (
          <span className={`ml-1 ${getValueClass()}`}>{getDisplayValue()}</span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            {isArray ? '[' : '{'}
            {!isExpanded && (
              <>
                <span className="italic mx-1.5 text-xs opacity-70">{getCollapsedPreview()}</span>
                {isArray ? ']' : '}'}
              </>
            )}
          </span>
        )}
      </div>

      {isExpandable && isExpanded && (
        <div>
          {(isArray ? (data as unknown[]) : Object.entries(data as object)).map((item, index) => {
            const childKey = isArray ? index : (item as [string, unknown])[0]
            const childValue = isArray ? item : (item as [string, unknown])[1]
            return (
              <JsonTreeNode
                key={childKey}
                data={childValue}
                keyName={childKey}
                level={level + 1}
                expandedPaths={expandedPaths}
                parentPath={currentPath}
                onToggle={onToggle}
              />
            )
          })}
          <div className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: level * 20 }}>
            <span className="inline-block w-3.5 h-3.5" />
            <span className="text-gray-500 dark:text-gray-400">{isArray ? ']' : '}'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 创建 src/pages/JsonFormatter.tsx**

```tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { useAutoResize } from '../hooks/useAutoResize'
import { useMessage } from '../hooks/useMessage'
import JsonTreeNode from './JsonTreeNode'
import Toast from '../components/Toast'

export default function JsonFormatter() {
  const [inputText, setInputText] = useState('')
  const [parsedJson, setParsedJson] = useState<unknown>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const { message, messageType, showMessage, clearMessage } = useMessage()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useAutoResize(inputRef, inputText)

  const expandAll = useCallback((obj: unknown, currentPath = 'root') => {
    const paths = new Set<string>()
    const collect = (o: unknown, p: string) => {
      if (o && typeof o === 'object') {
        paths.add(p)
        Object.keys(o as object).forEach(key => {
          collect((o as Record<string, unknown>)[key], `${p}.${key}`)
        })
      }
    }
    collect(obj, currentPath)
    return paths
  }, [])

  useEffect(() => {
    if (!inputText.trim()) {
      setParsedJson(null)
      return
    }
    const timer = setTimeout(() => {
      try {
        const parsed = JSON.parse(inputText)
        setParsedJson(parsed)
        setExpandedPaths(expandAll(parsed))
      } catch {
        setParsedJson(null)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [inputText, expandAll])

  const formatJson = () => {
    if (!inputText.trim()) {
      showMessage('请输入要格式化的JSON数据', 'error')
      return
    }
    try {
      const parsed = JSON.parse(inputText)
      setInputText(JSON.stringify(parsed, null, 2))
      setParsedJson(parsed)
      setExpandedPaths(expandAll(parsed))
      showMessage('JSON格式化成功！', 'success')
    } catch (error) {
      setParsedJson(null)
      showMessage('JSON格式错误：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const compressJson = () => {
    if (!inputText.trim()) {
      showMessage('请输入要压缩的JSON数据', 'error')
      return
    }
    try {
      const parsed = JSON.parse(inputText)
      setInputText(JSON.stringify(parsed))
      setParsedJson(parsed)
      setExpandedPaths(expandAll(parsed))
      showMessage('JSON压缩成功！', 'success')
    } catch (error) {
      setParsedJson(null)
      showMessage('JSON格式错误：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    setParsedJson(null)
    setExpandedPaths(new Set())
    clearMessage()
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') formatJson()
  }

  return (
    <div className="flex flex-col gap-8 items-center pt-[10vh] min-h-full max-md:gap-6 max-md:pt-[5vh]">
      <div className="flex flex-col gap-6 w-full max-w-[800px]">
        <div>
          <label htmlFor="json-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">输入JSON</label>
          <textarea
            id="json-input"
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入要格式化的JSON数据..."
            className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[13px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 min-h-[120px] resize-none overflow-y-hidden leading-relaxed transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light max-md:min-h-[100px]"
          />
        </div>

        <div className="flex gap-3 flex-wrap max-md:flex-col">
          <button onClick={formatJson} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg max-md:flex-none">格式化</button>
          <button onClick={compressJson} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">压缩</button>
          <button onClick={handleClear} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">清空</button>
        </div>

        {parsedJson !== null && (
          <div className="w-full mt-6">
            <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg p-4 font-mono text-[13px] leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto max-md:max-h-[400px]">
              <JsonTreeNode
                data={parsedJson}
                keyName="root"
                level={0}
                expandedPaths={expandedPaths}
                onToggle={togglePath}
              />
            </div>
          </div>
        )}
      </div>
      <Toast message={message} type={messageType} />
    </div>
  )
}
```

- [ ] **Step 3: 更新 src/router.tsx — 最终版本，替换所有占位**

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import UrlEncoder from './pages/UrlEncoder'
import Base64Encoder from './pages/Base64Encoder'
import HashEncoder from './pages/HashEncoder'
import TimestampConverter from './pages/TimestampConverter'
import QrCodeGenerator from './pages/QrCodeGenerator'
import JsonFormatter from './pages/JsonFormatter'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/url-encoder" replace /> },
      { path: 'url-encoder', element: <UrlEncoder /> },
      { path: 'base64', element: <Base64Encoder /> },
      { path: 'hash', element: <HashEncoder /> },
      { path: 'timestamp', element: <TimestampConverter /> },
      { path: 'qrcode', element: <QrCodeGenerator /> },
      { path: 'json', element: <JsonFormatter /> },
    ],
  },
])
```

- [ ] **Step 4: 验证并提交**

```bash
npm run dev
# 验证 /json：格式化、压缩、清空、树形视图展开/折叠、500ms 防抖自动解析
git add src/pages/JsonTreeNode.tsx src/pages/JsonFormatter.tsx src/router.tsx
git commit -m "feat: add JSON formatter page with tree view"
```

---

## Task 10: 全量验证 + TypeScript 检查 + 构建

**Files:** 无新文件

- [ ] **Step 1: TypeScript 类型检查**

```bash
npx tsc -b
```

Expected: 无错误输出。如有类型错误，逐一修复。

- [ ] **Step 2: 生产构建**

```bash
npm run build
```

Expected: 构建成功，输出到 `dist/` 目录。

- [ ] **Step 3: 预览生产构建**

```bash
npm run preview
```

Expected: 所有 6 个工具页面功能正常，路由切换正常，暗色主题正常，响应式布局正常。

- [ ] **Step 4: 全量功能验证清单**

逐一验证：
1. URL 编解码：编码、解码、URI编码、清空、Ctrl+Enter
2. Base64 编解码：编码、解码、格式校验、清空
3. Hash 编码：MD5/SHA-1/SHA-256/SHA-512 实时计算、复制
4. 时间戳转换：双向转换、当前时间戳、日期选择器
5. 二维码生成：生成、下载 PNG、清空、加载状态
6. JSON 格式化：格式化、压缩、树形视图、防抖解析
7. 主题切换：Light/Dark 切换、localStorage 持久化
8. 路由：NavLink 高亮、默认重定向、浏览器前进后退
9. 响应式：768px 以下侧边栏变顶部导航

- [ ] **Step 5: 提交最终状态**

```bash
git add -A
git commit -m "chore: final verification and build pass"
```
