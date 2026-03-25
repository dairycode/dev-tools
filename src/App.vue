<template>
  <div class="app">
    <div class="sidebar">
      <div class="sidebar-header">
        <div>
          <h1 class="logo">🔧 开发工具包</h1>
          <p class="subtitle">实用的在线开发工具</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['nav-item', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span class="nav-title">{{ tab.title }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <a
          href="https://github.com/dairycode/dev-tools"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
          title="查看 GitHub 项目"
        >
          <span class="github-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </span>
        </a>
        <button
          @click="toggleTheme"
          class="theme-toggle"
          :title="isDark ? '切换到亮色模式' : '切换到黑夜模式'"
        >
          <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
        </button>
      </div>
    </div>

    <div class="main-content">
      <div class="content-body">
        <component :is="currentTabComponent" />
      </div>
      <div class="footer">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="beian-link"
        >
          沪ICP备2025122886号-2
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

<style scoped>
.app {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
}

.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--border-light);
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-item {
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  color: var(--text-tertiary);
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.nav-item.active {
  background: var(--bg-active);
  color: var(--primary-color);
  border-right: 3px solid var(--primary-color);
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.nav-title {
  flex: 1;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 8px;
}

.theme-toggle {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.theme-toggle:active {
  transform: translateY(0);
}

.theme-icon {
  font-size: 18px;
}

.theme-text {
  flex: 1;
  text-align: left;
}

.github-link {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.github-link:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.github-link:active {
  transform: translateY(0);
}

.github-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.content-body {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.footer {
  padding: 16px 32px;
  text-align: center;
  background: var(--bg-primary);
}

.beian-link {
  color: var(--text-tertiary);
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.beian-link:hover {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .app {
    flex-direction: column;
    height: auto;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
  }

  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 12px 16px;
  }

  .nav-item {
    flex-shrink: 0;
    padding: 8px 16px;
    border-radius: 8px;
    white-space: nowrap;
  }

  .nav-item.active {
    border-right: none;
    background: var(--bg-active);
  }

  .sidebar-footer {
    padding: 12px 16px;
    border-top: none;
  }

  .theme-toggle {
    padding: 10px 14px;
    font-size: 13px;
  }

  .theme-icon {
    font-size: 16px;
  }

  .main-content {
    margin: 0;
    border-radius: 0;
  }

  .content-body {
    padding: 24px;
  }
}
</style>