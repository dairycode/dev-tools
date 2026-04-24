<template>
  <div class="flex flex-col gap-8 justify-start items-center pt-[10vh] min-h-full relative max-md:gap-6 max-md:pt-[5vh]">
    <div class="flex flex-col gap-6 w-full max-w-[800px]">
      <div class="mb-0">
        <label for="json-input" class="block mb-2 font-semibold text-(--color-text-secondary) text-sm">输入JSON</label>
        <textarea
          id="json-input"
          v-model="inputText"
          placeholder="请输入要格式化的JSON数据..."
          @keydown.ctrl.enter="formatJson"
          @keydown.meta.enter="formatJson"
          class="w-full px-[18px] py-4 border border-(--color-border-default) rounded-lg text-[15px] transition-all duration-200 font-mono bg-(--color-input-bg) text-(--color-text-primary) min-h-[120px] text-[13px] leading-relaxed resize-none overflow-y-hidden focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_3px_var(--color-brand-light)] max-md:min-h-[100px]"
          ref="inputArea"
          @input="autoResize()"
        ></textarea>
      </div>

      <div class="flex gap-3 flex-wrap max-md:flex-col">
        <button @click="formatJson" class="px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-brand) text-white hover:bg-(--color-brand-hover) hover:-translate-y-px hover:shadow-[0_4px_12px_var(--color-shadow)] disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
          <span>格式化</span>
        </button>
        <button @click="compressJson" class="px-6 py-3 border border-(--color-brand) rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-bg-primary) text-(--color-brand) hover:bg-(--color-bg-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
          <span>压缩</span>
        </button>
        <button @click="clearAll" class="px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-danger) text-white hover:bg-(--color-danger-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
          <span>清空</span>
        </button>
      </div>

      <!-- JSON树视图 -->
      <div v-if="parsedJson !== null" class="w-full mt-6">
        <div class="bg-(--color-bg-secondary) border border-(--color-border-default) rounded-lg p-4 font-mono text-[13px] leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto max-md:max-h-[400px]">
          <JsonTreeNode
            :data="parsedJson"
            :keyName="'root'"
            :level="0"
            :expandedPaths="expandedPaths"
            @toggle="togglePath"
          />
        </div>
      </div>
    </div>

    <div v-if="message" :class="['fixed top-5 right-5 z-[1000] max-w-[300px] p-3 px-4 rounded-lg text-sm border animate-slide-in max-md:right-2.5 max-md:left-2.5 max-md:max-w-none', messageType === 'success' ? 'bg-(--color-success-bg) text-(--color-success-text) border-(--color-success-border)' : 'bg-(--color-error-bg) text-(--color-error-text) border-(--color-error-border)']">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import JsonTreeNode from './JsonTreeNode.vue'

const inputText = ref('')
const message = ref('')
const messageType = ref('success')
const parsedJson = ref(null)
const expandedPaths = ref(new Set())
const parseTimeout = ref(null)
const inputArea = ref(null)

const autoParseJson = () => {
  // 清除之前的定时器
  if (parseTimeout.value) {
    clearTimeout(parseTimeout.value)
  }

  // 如果输入为空，清空树视图
  if (!inputText.value.trim()) {
    parsedJson.value = null
    return
  }

  // 使用防抖，500ms后自动解析
  parseTimeout.value = setTimeout(() => {
    try {
      const parsed = JSON.parse(inputText.value)
      parsedJson.value = parsed
      expandedPaths.value.clear()
      expandAll()
    } catch (error) {
      // 静默处理错误，只在格式化/压缩时显示错误消息
      parsedJson.value = null
    }
  }, 500)
}

const formatJson = () => {
  if (!inputText.value.trim()) {
    showMessage('请输入要格式化的JSON数据', 'error')
    return
  }

  try {
    // 先解析JSON确保格式正确
    const parsed = JSON.parse(inputText.value)
    // 格式化输出，使用2个空格缩进，直接覆盖输入框
    inputText.value = JSON.stringify(parsed, null, 2)
    parsedJson.value = parsed
    expandedPaths.value.clear()
    expandAll()
    showMessage('JSON格式化成功！', 'success')
  } catch (error) {
    parsedJson.value = null
    showMessage('JSON格式错误：' + error.message, 'error')
  }
}

const compressJson = () => {
  if (!inputText.value.trim()) {
    showMessage('请输入要压缩的JSON数据', 'error')
    return
  }

  try {
    // 先解析JSON确保格式正确
    const parsed = JSON.parse(inputText.value)
    // 压缩输出，无缩进，直接覆盖输入框
    inputText.value = JSON.stringify(parsed)
    parsedJson.value = parsed
    expandedPaths.value.clear()
    expandAll()
    showMessage('JSON压缩成功！', 'success')
  } catch (error) {
    parsedJson.value = null
    showMessage('JSON格式错误：' + error.message, 'error')
  }
}

const clearAll = () => {
  inputText.value = ''
  message.value = ''
  parsedJson.value = null
  expandedPaths.value.clear()
  nextTick(() => {
    autoResize()
  })
}

const showMessage = (text, type) => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const autoResize = () => {
  const area = inputArea.value
  if (area && area instanceof HTMLTextAreaElement) {
    area.style.height = 'auto'
    area.style.height = area.scrollHeight + 'px'
  }
}

const togglePath = (path) => {
  if (expandedPaths.value.has(path)) {
    expandedPaths.value.delete(path)
  } else {
    expandedPaths.value.add(path)
  }
  expandedPaths.value = new Set(expandedPaths.value)
}

const expandAll = () => {
  const collectPaths = (obj, currentPath = '') => {
    if (obj && typeof obj === 'object') {
      expandedPaths.value.add(currentPath)
      Object.keys(obj).forEach(key => {
        const newPath = currentPath ? `${currentPath}.${key}` : key
        collectPaths(obj[key], newPath)
      })
    }
  }
  collectPaths(parsedJson.value, 'root')
  expandedPaths.value = new Set(expandedPaths.value)
}

const collapseAll = () => {
  expandedPaths.value.clear()
  expandedPaths.value = new Set(expandedPaths.value)
}

watch(inputText, () => {
  nextTick(() => autoResize())
  autoParseJson()
})

onMounted(() => {
  autoResize()
})

onBeforeUnmount(() => {
  // 清理定时器
  if (parseTimeout.value) {
    clearTimeout(parseTimeout.value)
  }
})
</script>
 