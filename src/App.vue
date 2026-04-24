<template>
  <div class="flex h-screen bg-(--color-bg-primary) max-md:flex-col max-md:h-auto">
    <!-- Sidebar -->
    <div class="w-70 bg-(--color-bg-secondary) border-r border-(--color-border-light) flex flex-col max-md:w-full max-md:border-r-0 max-md:border-b max-md:border-(--color-border-light)">
      <div class="px-5 py-6 border-b border-(--color-border-light)">
        <h1 class="text-xl font-semibold text-(--color-text-primary) mb-1">🔧 开发工具包</h1>
        <p class="text-sm text-(--color-text-tertiary)">实用的在线开发工具</p>
      </div>

      <nav class="flex-1 py-4 overflow-y-auto max-md:flex max-md:overflow-x-auto max-md:px-4 max-md:py-3">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="w-full px-5 py-3 bg-transparent border-none text-left cursor-pointer flex items-center gap-3 transition-all duration-200 text-(--color-text-tertiary) text-sm font-medium hover:bg-(--color-bg-hover) hover:text-(--color-text-secondary) max-md:shrink-0 max-md:px-4 max-md:py-2 max-md:rounded-lg max-md:whitespace-nowrap"
          :class="activeTab === tab.key ? 'bg-(--color-bg-active)! text-(--color-brand)! border-r-3 border-r-solid border-r-(--color-brand) max-md:border-r-0!' : ''"
          @click="activeTab = tab.key"
        >
          <span class="text-lg w-6 text-center">{{ tab.icon }}</span>
          <span class="flex-1">{{ tab.title }}</span>
        </button>
      </nav>

      <div class="p-4 border-t border-(--color-border-light) flex gap-2 max-md:px-4 max-md:py-3 max-md:border-t-0">
        <a
          href="https://github.com/dairycode/dev-tools"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 px-4 py-3 border-none rounded-lg bg-(--color-bg-tertiary) text-(--color-text-primary) text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center no-underline hover:bg-(--color-bg-hover) hover:-translate-y-px active:translate-y-0"
          title="查看 GitHub 项目"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <button
          @click="toggleTheme"
          class="flex-1 px-4 py-3 border-none rounded-lg bg-(--color-bg-tertiary) text-(--color-text-primary) text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2.5 hover:bg-(--color-bg-hover) hover:-translate-y-px active:translate-y-0 max-md:px-3.5 max-md:py-2.5 max-md:text-[13px]"
          :title="isDark ? '切换到亮色模式' : '切换到黑夜模式'"
        >
          <span class="text-lg max-md:text-base">{{ isDark ? '☀️' : '🌙' }}</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col bg-(--color-bg-primary)">
      <div class="flex-1 p-8 overflow-y-auto max-md:p-6">
        <component :is="currentTabComponent" />
      </div>
      <div class="px-8 py-4 text-center bg-(--color-bg-primary)">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-(--color-text-tertiary) text-xs no-underline transition-colors duration-200 hover:text-(--color-brand)"
        >
          沪ICP备2026013272号-1
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTheme } from './composables/useTheme'
import UrlEncoder from './components/UrlEncoder.vue'
import TimestampConverter from './components/TimestampConverter.vue'
import QrCodeGenerator from './components/QrCodeGenerator.vue'
import JsonFormatter from './components/JsonFormatter.vue'
import Base64Encoder from './components/Base64Encoder.vue'
import HashEncoder from './components/HashEncoder.vue'

interface Tab {
  key: string
  title: string
  icon: string
  component: string
  description: string
}

const { isDark, toggleTheme, initTheme } = useTheme()

const activeTab = ref<string>('url')
const tabs = ref<Tab[]>([
  {
    key: 'url',
    title: 'URL编码/解码',
    icon: '🔗',
    component: 'UrlEncoder',
    description: 'URL编码和解码工具，支持特殊字符转换'
  },
  {
    key: 'base64',
    title: 'Base64编码/解码',
    icon: '🔐',
    component: 'Base64Encoder',
    description: 'Base64编码和解码工具'
  },
  {
    key: 'hash',
    title: 'Hash编码',
    icon: '🔒',
    component: 'HashEncoder',
    description: 'MD5、SHA等Hash计算工具'
  },
  {
    key: 'timestamp',
    title: '时间戳转换',
    icon: '⏰',
    component: 'TimestampConverter',
    description: 'Unix时间戳与日期时间互转工具'
  },
  {
    key: 'qrcode',
    title: '二维码生成',
    icon: '📱',
    component: 'QrCodeGenerator',
    description: '生成文本、URL的二维码图片'
  },
  {
    key: 'json',
    title: 'JSON格式化',
    icon: '📄',
    component: 'JsonFormatter',
    description: 'JSON格式化和美化工具'
  }
])

const componentMap: Record<string, any> = {
  UrlEncoder,
  Base64Encoder,
  HashEncoder,
  TimestampConverter,
  QrCodeGenerator,
  JsonFormatter
}

const currentTabComponent = computed(() => {
  const tab = tabs.value.find(t => t.key === activeTab.value)
  return tab ? componentMap[tab.component] : UrlEncoder
})

onMounted(() => {
  initTheme()
})
</script>
