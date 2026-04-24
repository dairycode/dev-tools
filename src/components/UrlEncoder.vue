<template>
  <div class="flex flex-col gap-8 justify-start items-center pt-[10vh] min-h-full relative max-md:gap-6 max-md:pt-[5vh]">
    <div class="flex flex-col gap-6 w-full max-w-[800px]">
      <div class="mb-0">
        <label for="url-input" class="block mb-2 font-semibold text-(--color-text-secondary) text-sm">输入文本</label>
        <textarea
          id="url-input"
          v-model="inputText"
          placeholder="请输入要编码或解码的文本..."
          @keydown.ctrl.enter="encodeURL"
          @keydown.meta.enter="encodeURL"
          class="w-full px-[18px] py-4 border border-(--color-border-default) rounded-lg text-[15px] transition-all duration-200 font-mono bg-(--color-input-bg) text-(--color-text-primary) min-h-[120px] text-[13px] leading-relaxed resize-none overflow-y-hidden focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_3px_var(--color-brand-light)] max-md:min-h-[100px]"
          ref="inputArea"
          @input="autoResize()"
        ></textarea>
      </div>

      <div class="flex gap-3 flex-wrap max-md:flex-col">
        <button @click="encodeURL" class="px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-brand) text-white hover:bg-(--color-brand-hover) hover:-translate-y-px hover:shadow-[0_4px_12px_var(--color-shadow)] disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
          <span>编码</span>
        </button>
        <button @click="decodeURL" class="px-6 py-3 border border-(--color-brand) rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-bg-primary) text-(--color-brand) hover:bg-(--color-bg-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
          <span>解码</span>
        </button>
        <button @click="encodeURI" class="px-6 py-3 border border-(--color-brand) rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-bg-primary) text-(--color-brand) hover:bg-(--color-bg-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
          <span>URI编码</span>
        </button>
        <button @click="clearAll" class="px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-danger) text-white hover:bg-(--color-danger-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
          <span>清空</span>
        </button>
      </div>
    </div>

    <div v-if="message" :class="['fixed top-5 right-5 z-[1000] max-w-[300px] p-3 px-4 rounded-lg text-sm border animate-slide-in max-md:right-2.5 max-md:left-2.5 max-md:max-w-none', messageType === 'success' ? 'bg-(--color-success-bg) text-(--color-success-text) border-(--color-success-border)' : 'bg-(--color-error-bg) text-(--color-error-text) border-(--color-error-border)']">
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
