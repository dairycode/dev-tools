<template>
  <div class="json-formatter">
    <div class="input-section">
      <div class="input-group">
        <label for="json-input">输入JSON</label>
        <textarea 
          id="json-input"
          v-model="inputText"
          placeholder="请输入要格式化的JSON数据..."
          @keydown.ctrl.enter="formatJson"
          @keydown.meta.enter="formatJson"
          class="json-textarea"
          ref="inputArea"
          @input="autoResize()"
        ></textarea>
      </div>
      
      <div class="button-group">
        <button @click="formatJson" class="btn btn-primary">
          <span>格式化</span>
        </button>
        <button @click="compressJson" class="btn btn-secondary">
          <span>压缩</span>
        </button>
        <button @click="clearAll" class="btn btn-clear">
          <span>清空</span>
        </button>
      </div>

      <!-- JSON树视图 -->
      <div v-if="parsedJson !== null" class="tree-view-container">
        <div class="tree-view">
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

    <div v-if="message" :class="['message', messageType]">
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

<style scoped>
.json-formatter {
  display: flex;
  flex-direction: column;
  gap: 32px;
  justify-content: flex-start;
  align-items: center;
  padding-top: 10vh;
  min-height: 100%;
  position: relative;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 800px;
}

.json-textarea {
  min-height: 120px !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  overflow-y: hidden;
  transition: height 0.2s;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 300px;
}

.tree-view-container {
  width: 100%;
  margin-top: 24px;
}

.tree-view {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .json-formatter {
    gap: 24px;
    padding-top: 5vh;
  }

  .json-textarea {
    min-height: 100px !important;
  }

  .message {
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .tree-view {
    max-height: 400px;
  }
}
</style> 