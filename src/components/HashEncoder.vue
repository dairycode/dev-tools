<template>
  <div class="flex flex-col gap-8 justify-start items-center pt-[10vh] min-h-full relative w-full max-w-[800px] mx-auto max-md:gap-6 max-md:pt-[5vh] max-md:px-4">
    <div class="w-full flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <label for="input-text" class="font-semibold text-(--color-text-secondary) text-sm">输入文本</label>
        <textarea
          id="input-text"
          v-model="inputText"
          @input="autoResize"
          @keydown.ctrl.enter="calculateHash"
          @keydown.meta.enter="calculateHash"
          placeholder="请输入要计算Hash的文本..."
          class="w-full p-3 border-[1.5px] border-(--color-border-default) rounded-lg bg-(--color-input-bg) text-(--color-text-primary) font-mono text-[13px] leading-relaxed resize-none overflow-y-hidden transition-all duration-200 min-h-[120px] focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_2px_var(--color-brand-light)] max-md:min-h-[100px]"
          ref="inputArea"
        ></textarea>
      </div>

      <div class="flex flex-col gap-2">
        <label for="hash-type" class="font-semibold text-(--color-text-secondary) text-sm">选择Hash算法：</label>
        <select
          id="hash-type"
          v-model="selectedHashType"
          class="appearance-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=%27http://www.w3.org/2000/svg%27_width=%2714%27_height=%2714%27_viewBox=%270_0_24_24%27_fill=%27none%27_stroke=%27%23495057%27_stroke-width=%272%27_stroke-linecap=%27round%27_stroke-linejoin=%27round%27%3E%3Cpolyline_points=%276_9_12_15_18_9%27%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] bg-[length:14px] cursor-pointer transition-all duration-300 border-[1.5px] border-(--color-border-default) rounded-lg py-2.5 pr-9 pl-3 text-sm font-medium text-(--color-text-primary) bg-(--color-input-bg) shadow-[0_1px_3px_var(--color-shadow)] min-w-[180px] hover:border-(--color-brand) hover:shadow-[0_2px_8px_var(--color-brand-light)] hover:-translate-y-[0.5px] focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_2px_var(--color-brand-light),0_2px_8px_var(--color-brand-light)] focus:-translate-y-[0.5px]"
        >
          <option value="md5">MD5</option>
          <option value="sha1">SHA-1</option>
          <option value="sha256">SHA-256</option>
          <option value="sha512">SHA-512</option>
        </select>
      </div>

      <div class="flex gap-3 flex-wrap max-md:flex-col">
        <button @click="calculateHash" class="px-5 py-2.5 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 min-w-[100px] bg-(--color-brand) text-white hover:bg-(--color-brand-hover) hover:-translate-y-px max-md:w-full">
          计算Hash
        </button>
        <button @click="clearAll" class="px-5 py-2.5 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 min-w-[100px] bg-(--color-text-tertiary) text-white hover:bg-(--color-text-secondary) hover:-translate-y-px max-md:w-full">
          清空
        </button>
      </div>
    </div>

    <div v-if="hashResult" class="w-full flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <label class="font-semibold text-(--color-text-secondary) text-sm">Hash结果：</label>
        <div class="bg-(--color-bg-secondary) p-4 rounded-lg border border-(--color-border-default)">
          <div class="font-mono text-sm break-all text-(--color-text-primary) leading-relaxed">{{ hashResult }}</div>
        </div>
        <button @click="copyResult" class="px-5 py-2.5 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 min-w-[100px] bg-(--color-success) text-white hover:bg-(--color-success-hover) hover:-translate-y-px">
          复制结果
        </button>
      </div>
    </div>

    <div v-if="message" :class="['fixed top-5 right-5 z-[1000] max-w-[300px] p-3 px-4 rounded-lg text-sm font-medium shadow-[0_4px_12px_rgba(0,0,0,0.15)] animate-slide-in border max-md:right-2.5 max-md:left-2.5 max-md:max-w-none', messageType === 'success' ? 'bg-(--color-success-bg) text-(--color-success-text) border-(--color-success-border)' : 'bg-(--color-error-bg) text-(--color-error-text) border-(--color-error-border)']">
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
