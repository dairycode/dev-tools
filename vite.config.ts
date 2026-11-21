import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 导航使用 hash，相对资源路径支持根目录及静态服务器子目录。
  base: './',
  plugins: [react(), tailwindcss()],
})
