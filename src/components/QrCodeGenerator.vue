<template>
  <div class="flex flex-col gap-8 justify-start items-center pt-[10vh] min-h-full relative max-md:gap-6 max-md:pt-[5vh]">
    <div class="flex flex-col gap-6 w-full max-w-[800px]">
      <div class="mb-0">
        <label for="qr-input" class="block mb-2 font-semibold text-(--color-text-secondary) text-sm">输入内容</label>
        <textarea
          id="qr-input"
          v-model="inputText"
          placeholder="请输入要生成二维码的文本、URL等..."
          @keydown.ctrl.enter="generateQR"
          @keydown.meta.enter="generateQR"
          class="w-full px-[18px] py-4 border border-(--color-border-default) rounded-lg text-[15px] transition-all duration-200 font-mono bg-(--color-input-bg) text-(--color-text-primary) min-h-24 text-[13px] leading-relaxed resize-none overflow-y-hidden focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_3px_var(--color-brand-light)] max-md:min-h-[72px]"
          ref="inputArea"
          @input="autoResize()"
        ></textarea>
      </div>

      <div class="flex gap-3 flex-wrap max-md:flex-col">
        <button @click="generateQR" class="px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-brand) text-white hover:bg-(--color-brand-hover) hover:-translate-y-px hover:shadow-[0_4px_12px_var(--color-shadow)] disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
          <span>生成二维码</span>
        </button>
        <button @click="downloadQR" class="px-6 py-3 border border-(--color-brand) rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-bg-primary) text-(--color-brand) hover:bg-(--color-bg-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none" :disabled="!qrCodeGenerated">
          <span>下载二维码</span>
        </button>
        <button @click="clearAll" class="px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-danger) text-white hover:bg-(--color-danger-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
          <span>清空</span>
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-6 w-full max-w-[800px]">
      <div class="text-center mt-6">
        <div class="inline-flex p-6 bg-(--color-bg-secondary) rounded-xl border-2 border-dashed border-(--color-border-default) min-h-[200px] items-center justify-center max-md:min-h-[150px]">
          <div v-if="isLoading" class="inline-block w-5 h-5 border-2 border-(--color-border-default) border-t-2 border-t-(--color-brand) rounded-full animate-spin"></div>
          <canvas ref="qrCanvas" v-show="qrCodeGenerated" class="block mx-auto max-w-[200px] h-auto"></canvas>
          <p v-if="!qrCodeGenerated && !isLoading" class="text-(--color-text-tertiary) m-0">二维码将在这里显示</p>
        </div>
      </div>
    </div>

    <div v-if="message" :class="['fixed top-5 right-5 z-[1000] max-w-[300px] p-3 px-4 rounded-lg text-sm border animate-slide-in max-md:right-2.5 max-md:left-2.5 max-md:max-w-none', messageType === 'success' ? 'bg-(--color-success-bg) text-(--color-success-text) border-(--color-success-border)' : 'bg-(--color-error-bg) text-(--color-error-text) border-(--color-error-border)']">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import QRCode from 'qrcode'

const inputText = ref('')
const qrCodeGenerated = ref(false)
const isLoading = ref(false)
const message = ref('')
const messageType = ref('success')
const inputArea = ref(null)
const qrCanvas = ref(null)

const generateQR = async () => {
  if (!inputText.value.trim()) {
    showMessage('请输入要生成二维码的内容', 'error')
    return
  }
  isLoading.value = true
  qrCodeGenerated.value = true
  await nextTick()
  try {
    // 清除之前的二维码
    if (qrCanvas.value) {
      const ctx = qrCanvas.value.getContext('2d')
      ctx && ctx.clearRect(0, 0, qrCanvas.value.width, qrCanvas.value.height)
    }
    // 生成新的二维码
    await QRCode.toCanvas(qrCanvas.value, inputText.value, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    showMessage('二维码生成成功！', 'success')
  } catch (error) {
    showMessage('二维码生成失败：' + error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

const downloadQR = () => {
  if (!qrCodeGenerated.value || !qrCanvas.value) {
    showMessage('请先生成二维码', 'error')
    return
  }
  try {
    const canvas = qrCanvas.value
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvas.toDataURL()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showMessage('二维码下载成功！', 'success')
  } catch (error) {
    showMessage('下载失败：' + error.message, 'error')
  }
}

const clearAll = () => {
  inputText.value = ''
  qrCodeGenerated.value = false
  message.value = ''
  if (qrCanvas.value) {
    const ctx = qrCanvas.value.getContext('2d')
    ctx && ctx.clearRect(0, 0, qrCanvas.value.width, qrCanvas.value.height)
  }
  nextTick(() => autoResize())
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

watch(inputText, () => {
  nextTick(() => autoResize())
})

onMounted(() => {
  autoResize()
})
</script>
