# Dev-Tools: Vue → React + Tailwind 重构设计

## 概述

将现有 Vue 3 开发者工具集项目迁移到 React + Tailwind CSS 技术栈。纯技术栈迁移，功能和 UI 1:1 还原。

## 技术栈

- React 18 + TypeScript
- Vite + npm
- React Router v6
- Tailwind CSS v4（CSS-first 配置，无 tailwind.config.js）
- crypto-js（Hash 算法）
- qrcode（二维码生成）

## 项目结构

```
src/
├── components/
│   ├── Layout.tsx           # 主布局：侧边栏 + 内容区
│   ├── Sidebar.tsx          # 导航侧边栏
│   └── ThemeToggle.tsx      # 主题切换按钮
├── pages/
│   ├── UrlEncoder.tsx       # URL 编解码
│   ├── Base64Encoder.tsx    # Base64 编解码
│   ├── HashEncoder.tsx      # Hash 编码（MD5, SHA-1/256/512）
│   ├── TimestampConverter.tsx # 时间戳转换
│   ├── QrCodeGenerator.tsx  # 二维码生成
│   ├── JsonFormatter.tsx    # JSON 格式化
│   └── JsonTreeNode.tsx     # JSON 树形节点（递归子组件）
├── hooks/
│   ├── useTheme.ts          # 暗色主题管理
│   └── useClipboard.ts     # 复制到剪贴板
├── router.tsx               # 路由配置
├── App.tsx                  # 根组件，挂载 Router + Layout
├── main.tsx                 # 入口
└── index.css                # Tailwind 指令 + 自定义 theme token
```

## 路由设计

| 路径 | 组件 | 工具名 |
|------|------|--------|
| `/` | 重定向到 `/url-encoder` | — |
| `/url-encoder` | UrlEncoder | URL 编解码 |
| `/base64` | Base64Encoder | Base64 编解码 |
| `/hash` | HashEncoder | Hash 编码 |
| `/timestamp` | TimestampConverter | 时间戳转换 |
| `/qrcode` | QrCodeGenerator | 二维码生成 |
| `/json` | JsonFormatter | JSON 格式化 |

默认路由 `/` 重定向到 `/url-encoder`。

## 组件映射

### Vue → React 对应关系

| Vue 组件 | React 组件 | 迁移要点 |
|----------|-----------|---------|
| `App.vue` | `App.tsx` + `Layout.tsx` + `Sidebar.tsx` | 拆分职责：App 挂 Router，Layout 管布局，Sidebar 管导航 |
| `useTheme.ts` composable | `useTheme.ts` hook | `ref()` → `useState()`，`watchEffect` → `useEffect()` |
| `UrlEncoder.vue` | `UrlEncoder.tsx` | `v-model` → `value` + `onChange` |
| `Base64Encoder.vue` | `Base64Encoder.tsx` | 同上 |
| `HashEncoder.vue` | `HashEncoder.tsx` | crypto-js 调用不变 |
| `TimestampConverter.vue` | `TimestampConverter.tsx` | 日期选择器用原生 input[type=datetime-local] |
| `QrCodeGenerator.vue` | `QrCodeGenerator.tsx` | `useRef` 替代 template ref 获取 canvas |
| `JsonFormatter.vue` | `JsonFormatter.tsx` | 500ms debounce 用 `useEffect` + `setTimeout` |
| `JsonTreeNode.vue` | `JsonTreeNode.tsx` | 递归组件，React 天然支持 |

### 共享 Hooks

- `useTheme()` — 管理 dark/light 模式，读写 localStorage，监听 `prefers-color-scheme`
- `useClipboard()` — 封装 `navigator.clipboard.writeText`，提供复制状态反馈

### 通用交互模式

- 消息提示（toast）：`useState` + `setTimeout` 3 秒自动消失
- textarea 自动高度：`onInput` 事件动态设置 `scrollHeight`
- 键盘快捷键（Ctrl/Cmd+Enter）：`onKeyDown` 事件处理

## Tailwind CSS v4 样式策略

### 入口文件 `index.css`

```css
@import "tailwindcss";

@theme {
  --color-primary: #1976d2;
  --color-primary-hover: #1565c0;
}
```

### 暗色主题

- 沿用 `html.dark` class 策略
- 所有颜色用 Tailwind `dark:` 变体，如 `bg-white dark:bg-gray-900`
- `useTheme` hook 负责切换 `html` 上的 `dark` class + 持久化到 localStorage
- 首次加载时读取 localStorage，无记录则跟随系统 `prefers-color-scheme`

### 响应式

- 断点：768px 以下侧边栏变为顶部水平导航
- 用 Tailwind `md:` 前缀处理：`flex-col md:flex-row`

### 字体

- 代码区域使用 `font-mono`（Monaco, Menlo, Ubuntu Mono 等）

## 功能还原清单

### 1. URL 编解码
- `encodeURIComponent()` 编码
- `decodeURIComponent()` 解码，失败时 fallback 到 `decodeURI()`
- 自动调整 textarea 高度
- Ctrl/Cmd+Enter 快捷键

### 2. Base64 编解码
- `btoa()` 编码，`atob()` 解码
- Base64 格式校验（正则）
- 自动调整 textarea 高度

### 3. Hash 编码
- 支持 MD5、SHA-1、SHA-256、SHA-512
- 输入时实时计算
- 一键复制结果

### 4. 时间戳转换
- 双向转换：时间戳 ↔ 日期
- 自动识别秒/毫秒
- 显示：北京时间、UTC、ISO、秒级/毫秒级时间戳
- 原生日期时间选择器
- "当前时间戳"按钮

### 5. 二维码生成
- 文本/URL 输入生成二维码
- Canvas 渲染
- 下载为 PNG
- 加载状态指示

### 6. JSON 格式化
- 格式化（2 空格缩进）/ 压缩
- 交互式树形视图（展开/折叠）
- 递归 JsonTreeNode 组件
- 显示数据类型和集合大小
- 500ms 防抖自动解析

### 7. 主题系统
- Light/Dark 切换
- localStorage 持久化
- 跟随系统 prefers-color-scheme
- html.dark class 切换

### 8. 布局与导航
- 侧边栏导航，6 个工具 tab（带 emoji 图标）
- React Router NavLink 高亮当前路由
- GitHub 链接
- 页脚 ICP 备案链接
- 响应式：移动端侧边栏变顶部导航

## 不在范围内

- 不新增功能或工具
- 不引入 UI 组件库
- 不引入状态管理库（useState 足够）
- 不做 SSR/SSG
- 不做国际化
