<template>
  <div class="hash-encoder">
    <div class="input-section">
      
      <div class="form-group">
        <label for="input-text">输入文本</label>
        <textarea
          id="input-text"
          v-model="inputText"
          @input="autoResize"
          @keydown.ctrl.enter="calculateHash"
          @keydown.meta.enter="calculateHash"
          placeholder="请输入要计算Hash的文本..."
          class="large-textarea"
          ref="inputArea"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="hash-type">选择Hash算法：</label>
        <select 
          id="hash-type" 
          v-model="selectedHashType" 
          class="hash-select"
        >
          <option value="md5">MD5</option>
          <option value="sha1">SHA-1</option>
          <option value="sha256">SHA-256</option>
          <option value="sha512">SHA-512</option>
        </select>
      </div>
      
      <div class="button-group">
        <button @click="calculateHash" class="btn btn-primary">
          计算Hash
        </button>
        <button @click="clearAll" class="btn btn-secondary">
          清空
        </button>
      </div>
    </div>
    
    <div class="result-section" v-if="hashResult">
      <div class="form-group">
        <label>Hash结果：</label>
        <div class="result-display">
          <div class="hash-result">{{ hashResult }}</div>
        </div>
        <button @click="copyResult" class="btn btn-copy">
          复制结果
        </button>
      </div>
    </div>
    
    <div class="message" v-if="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import CryptoJS from 'crypto-js'

type MessageType = 'success' | 'error'
type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512'

const inputText = ref<string>('')
const hashResult = ref<string>('')
const selectedHashType = ref<HashType>('md5')
const message = ref<string>('')
const messageType = ref<MessageType>('success')
const inputArea = ref<HTMLTextAreaElement | null>(null)

const calculateHash = async (): Promise<void> => {
  if (!inputText.value.trim()) {
    hashResult.value = ''
    return
  }

  try {
    const text = inputText.value.trim()
    let result = ''

    switch (selectedHashType.value) {
      case 'md5':
        result = CryptoJS.MD5(text).toString()
        break
      case 'sha1':
        result = CryptoJS.SHA1(text).toString()
        break
      case 'sha256':
        result = CryptoJS.SHA256(text).toString()
        break
      case 'sha512':
        result = CryptoJS.SHA512(text).toString()
        break
      default:
        throw new Error('不支持的哈希算法')
    }

    hashResult.value = result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    showMessage('Hash计算失败：' + errorMessage, 'error')
  }
}

const copyResult = async (): Promise<void> => {
  if (!hashResult.value) return

  try {
    await navigator.clipboard.writeText(hashResult.value)
    showMessage('Hash值已复制到剪贴板！', 'success')
  } catch (error) {
    const textArea = document.createElement('textarea')
    textArea.value = hashResult.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showMessage('Hash值已复制到剪贴板！', 'success')
  }
}

const clearAll = (): void => {
  inputText.value = ''
  hashResult.value = ''
  message.value = ''
  autoResize()
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

watch(inputText, (newVal: string) => {
  if (newVal.trim()) {
    calculateHash()
  } else {
    hashResult.value = ''
  }
})

watch(selectedHashType, () => {
  if (inputText.value.trim()) {
    calculateHash()
  }
})
</script>

<style scoped>
.hash-encoder {
  display: flex;
  flex-direction: column;
  gap: 32px;
  justify-content: flex-start;
  align-items: center;
  padding-top: 10vh;
  min-height: 100%;
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.hash-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23495057' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 36px 10px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  background-color: var(--input-bg);
  box-shadow: 0 1px 3px var(--shadow-color);
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  min-width: 180px;
}

.hash-select:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px var(--primary-light);
  transform: translateY(-0.5px);
}

.hash-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light), 0 2px 8px var(--primary-light);
  transform: translateY(-0.5px);
}

.input-section, .result-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 14px;
}

.large-textarea {
  min-height: 120px !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  overflow-y: hidden;
  transition: height 0.2s;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  background-color: var(--input-bg);
  color: var(--text-primary);
}

.large-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--text-tertiary);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--text-secondary);
  transform: translateY(-1px);
}

.btn-copy {
  background-color: var(--success-color);
  color: white;
}

.btn-copy:hover {
  background-color: var(--success-hover);
  transform: translateY(-1px);
}

.result-display {
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.hash-result {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  word-break: break-all;
  color: var(--text-primary);
  background: transparent;
  padding: 0;
  border: none;
  line-height: 1.5;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 300px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.message.success {
  background-color: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-border);
}

.message.error {
  background-color: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .hash-encoder {
    gap: 24px;
    padding-top: 5vh;
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .large-textarea {
    min-height: 100px !important;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .message {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>