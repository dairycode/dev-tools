# Dev-Tools React + Tailwind 重构设计

## 概述

将现有 Vue 3 开发者工具集重构为 React + Tailwind CSS，同时升级 UI/UX 设计。保留现有 6 个工具的全部功能，采用可扩展架构方便后续新增工具。

## 技术栈

- React 18 + TypeScript
- Vite（沿用，切换为 `@vitejs/plugin-react`）
- Tailwind CSS v4（纯手写，不使用组件库）
- useState / useContext（不引入状态管理库）
- lucide-react（图标库）
- crypto-js（哈希计算）
- qrcode（二维码生成）

## 项目结构

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # 图标侧边栏
│   │   ├── ThemeToggle.tsx      # 深色/浅色切换按钮
│   │   └── Toast.tsx            # 消息提示组件
│   └── tools/
│       ├── UrlEncoder.tsx
│       ├── Base64Encoder.tsx
│       ├── HashEncoder.tsx
│       ├── TimestampConverter.tsx
│       ├── QrCodeGenerator.tsx
│       ├── JsonFormatter/
│       │   ├── index.tsx
│       │   └── JsonTreeNode.tsx
│       └── registry.ts          # 工具注册表
├── hooks/
│   ├── useTheme.ts              # 主题管理 hook
│   └── useClipboard.ts          # 剪贴板 hook（多工具共用）
├── context/
│   └── ToastContext.tsx          # Toast 消息 Context
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css                    # Tailwind 入口
```

## 架构设计

### 工具注册表

每个工具通过 `ToolDefinition` 接口自描述，注册到统一数组中：

```ts
interface ToolDefinition {
  key: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  component: React.LazyExoticComponent<() => JSX.Element>
}
```

新增工具只需：创建组件文件 → 在 `registry.ts` 加一行。侧边栏和内容区均从注册表驱动渲染。

### 数据流

```
App (activeToolKey state)
├── ToastContext.Provider
│   ├── Sidebar ← 读取 registry，点击回调 setActiveToolKey
│   └── ContentArea ← 根据 activeToolKey 渲染对应 component
│        └── <Suspense> 包裹懒加载组件
```

- 主题：`useTheme` hook 管理，读写 localStorage，监听系统 `prefers-color-scheme`
- 工具状态：各组件内部 useState 自管理，互不干扰
- Toast：通过 ToastContext 提供 `showToast(message, type)` 方法
- 懒加载：每个工具用 `React.lazy` 按需加载，首屏只加载当前工具

## UI 设计

### 布局：图标侧边栏

- 侧边栏宽度 64px，固定左侧
- 图标按钮 40x40，选中态：左侧 2px indigo 指示条 + 图标高亮
- 悬停显示 tooltip（工具名称），不展开侧边栏
- 底部：主题切换按钮 + GitHub 链接
- 内容区：左侧 padding 64px，内容 `max-w-3xl` 居中

### 配色：Indigo + Slate

| 元素 | 浅色模式 | 深色模式 |
|------|---------|---------|
| 页面背景 | `bg-slate-50` | `dark:bg-slate-900` |
| 侧边栏 | `bg-white border-r` | `dark:bg-slate-950` |
| 内容卡片 | `bg-white` | `dark:bg-slate-800` |
| 主按钮 | `bg-indigo-600 text-white` | 同 |
| 次按钮 | `border-indigo-600 text-indigo-600` | `dark:border-indigo-400` |
| 输入框 | `bg-slate-50 border-slate-200` | `dark:bg-slate-900 dark:border-slate-700` |
| focus 态 | `ring-2 ring-indigo-500` | 同 |

深色模式使用 Tailwind `class` 策略，通过 `<html class="dark">` 切换。

### 响应式

- `md:` 以上：左侧固定侧边栏 + 右侧内容区
- `md:` 以下：侧边栏收起为底部横向工具条，图标水平排列

### 组件样式规范

- 输入/输出 textarea：圆角 `rounded-lg`，统一高度，focus 时 indigo ring
- 操作按钮组：水平排列，`gap-2`，主/次按钮区分
- Toast：右上角固定定位，3 秒自动消失，success 绿色 / error 红色

## 错误处理

- 编码/解码操作 try-catch 包裹，错误通过 Toast 展示
- 早返回：输入为空时直接 return
- JSON 解析错误实时提示，不阻塞输入
- 剪贴板操作失败时 Toast 提示

## 迁移策略

1. 同仓库原地重构，删除 Vue 相关文件（`.vue` 组件、vue 依赖）
2. 保留 `vite.config`，插件切换为 `@vitejs/plugin-react`
3. 安装 React、Tailwind、lucide-react 等新依赖
4. 逐个迁移工具组件，核心逻辑（编码/哈希/格式化算法）直接复用
5. 保留 crypto-js 和 qrcode 依赖不变

## 现有工具清单

| 工具 | 功能 | 核心依赖 |
|------|------|---------|
| URL 编码 | encodeURIComponent / decodeURIComponent / encodeURI | 无 |
| Base64 | btoa / atob，格式校验 | 无 |
| 哈希计算 | MD5、SHA-1/256/512，实时计算 | crypto-js |
| 时间戳转换 | Unix 时间戳 ↔ 日期，秒/毫秒切换 | 无 |
| 二维码生成 | 文本/URL → QR，canvas 渲染，PNG 下载 | qrcode |
| JSON 格式化 | 格式化/压缩，递归树形展示，展开/折叠 | 无 |
