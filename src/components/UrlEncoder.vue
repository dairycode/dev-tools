<template>
  <div class="url-encoder">
    <div class="input-section">
      <div class="input-group">
        <label for="url-input">输入文本</label>
        <textarea 
          id="url-input"
          v-model="inputText"
          placeholder="请输入要编码或解码的文本..."
          @keydown.ctrl.enter="encodeURL"
          @keydown.meta.enter="encodeURL"
          class="large-textarea"
          ref="inputArea"
          @input="autoResize()"
        ></textarea>
      </div>
      
      <div class="button-group">
        <button @click="encodeURL" class="btn btn-primary">
          <span>编码</span>
        </button>
        <button @click="decodeURL" class="btn btn-secondary">
          <span>解码</span>
        </button>
        <button @click="encodeURI" class="btn btn-secondary">
          <span>URI编码</span>
        </button>
        <button @click="clearAll" class="btn btn-clear">
          <span>清空</span>
        </button>
      </div>
    </div>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

type MessageType = 'success' | 'error'

const inputText = ref<string>('')
const message = ref<string>('')
const messageType = ref<MessageType>('success')
const inputArea = ref<HTMLTextAreaElement | null>(null)

const encodeURL = (): void => {
  if (!inputText.value.trim()) {
    showMessage('请输入要编码的文本', 'error')
    return
  }

  try {
    // 使用 encodeURIComponent 进行完整的URL编码
    const encoded = encodeURIComponent(inputText.value)
    inputText.value = encoded
    showMessage('URL编码成功！', 'success')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    showMessage('编码失败：' + errorMessage, 'error')
  }
}

const decodeURL = (): void => {
  if (!inputText.value.trim()) {
    showMessage('请输入要解码的文本', 'error')
    return
  }

  try {
    // 使用 decodeURIComponent 进行URL解码
    const decoded = decodeURIComponent(inputText.value)
    inputText.value = decoded
    showMessage('URL解码成功！', 'success')
  } catch (error) {
    // 如果 decodeURIComponent 失败，尝试 decodeURI
    try {
      const decoded = decodeURI(inputText.value)
      inputText.value = decoded
      showMessage('URI解码成功！', 'success')
    } catch (secondError) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      showMessage('解码失败：' + errorMessage, 'error')
    }
  }
}

const encodeURI = (): void => {
  if (!inputText.value.trim()) {
    showMessage('请输入要编码的文本', 'error')
    return
  }

  try {
    // 使用 encodeURI 进行URI编码（保留某些字符）
    const encoded = globalThis.encodeURI(inputText.value)
    inputText.value = encoded
    showMessage('URI编码成功！', 'success')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    showMessage('编码失败：' + errorMessage, 'error')
  }
}

const clearAll = (): void => {
  inputText.value = ''
  message.value = ''
  nextTick(() => {
    autoResize()
  })
}

const showMessage = (text: string, type: MessageType): void => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const autoResize = (): void => {
  const area = inputArea.value
  if (area && area instanceof HTMLTextAreaElement) {
    area.style.height = 'auto'
    area.style.height = area.scrollHeight + 'px'
  }
}

watch(inputText, () => {
  nextTick(() => autoResize())
})

onMounted(() => {
  autoResize()
})
</script>

<style scoped>
.url-encoder {
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

.large-textarea {
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

@media (max-width: 768px) {
  .url-encoder {
    gap: 24px;
    padding-top: 5vh;
  }
  
  .large-textarea {
    min-height: 100px !important;
  }
  
  .message {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style> 