<template>
  <div class="flex flex-col gap-10 justify-start items-center pt-[5vh] min-h-full relative max-md:gap-6 max-md:pt-[3vh]">
    <!-- 时间戳转换为日期 -->
    <div class="w-full max-w-[800px] bg-(--color-bg-primary) rounded-xl p-6 shadow-[0_2px_8px_var(--color-shadow)] max-md:p-5">
      <h3 class="text-lg font-semibold text-(--color-text-primary) mb-5 pb-3 border-b-2 border-b-(--color-brand)">时间戳转换为日期</h3>
      <div class="flex flex-col gap-5">
        <div class="mb-0">
          <label for="timestamp-input" class="block mb-2 font-semibold text-(--color-text-secondary) text-sm">时间戳</label>
          <input
            type="text"
            id="timestamp-input"
            v-model="timestampInput"
            placeholder="请输入Unix时间戳（秒或毫秒）..."
            @keydown.ctrl.enter="convertTimestampToDate"
            @keydown.meta.enter="convertTimestampToDate"
            class="w-full py-4 px-[18px]! border border-(--color-border-default) rounded-lg text-[15px] transition-all duration-200 bg-(--color-input-bg) text-(--color-text-primary) font-mono focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_3px_var(--color-brand-light)]"
          >
        </div>

        <div class="flex gap-3 flex-wrap max-md:flex-col">
          <button @click="convertTimestampToDate" class="px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-brand) text-white hover:bg-(--color-brand-hover) hover:-translate-y-px hover:shadow-[0_4px_12px_var(--color-shadow)] disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
            <span>转换</span>
          </button>
          <button @click="getCurrentTimestamp" class="px-6 py-3 border border-(--color-brand) rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-bg-primary) text-(--color-brand) hover:bg-(--color-bg-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
            <span>当前时间戳</span>
          </button>
          <button @click="clearTimestamp" class="px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-danger) text-white hover:bg-(--color-danger-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
            <span>清空</span>
          </button>
        </div>

        <div class="mt-2">
          <label class="block mb-2 font-semibold text-(--color-text-secondary) text-sm">转换结果</label>
          <div class="bg-(--color-bg-secondary) rounded-lg p-4 border border-(--color-border-light)">
            <div v-for="(item, idx) in [
              { label: '北京时间：', value: timestampResult.localTime },
              { label: 'UTC时间：', value: timestampResult.utcTime },
              { label: 'ISO格式：', value: timestampResult.isoTime },
              { label: '秒级时间戳：', value: timestampResult.seconds },
              { label: '毫秒时间戳：', value: timestampResult.milliseconds }
            ]" :key="idx" class="flex justify-between items-center py-2 border-b border-(--color-border-light) last:border-b-0 max-md:flex-col max-md:items-start max-md:gap-1">
              <span class="font-medium text-(--color-text-secondary) text-sm">{{ item.label }}</span>
              <span class="font-mono text-[13px] text-(--color-brand) bg-(--color-bg-active) px-2 py-1 rounded break-all max-md:w-full max-md:text-left">{{ item.value || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日期转换为时间戳 -->
    <div class="w-full max-w-[800px] bg-(--color-bg-primary) rounded-xl p-6 shadow-[0_2px_8px_var(--color-shadow)] max-md:p-5">
      <h3 class="text-lg font-semibold text-(--color-text-primary) mb-5 pb-3 border-b-2 border-b-(--color-brand)">日期转换为时间戳</h3>
      <div class="flex flex-col gap-5">
        <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-3">
          <div class="mb-0">
            <label for="date-input" class="block mb-2 font-semibold text-(--color-text-secondary) text-sm">日期</label>
            <input
              type="date"
              id="date-input"
              v-model="dateInput"
              class="w-full py-4 px-[18px]! border border-(--color-border-default) rounded-lg text-[15px] transition-all duration-200 bg-(--color-input-bg) text-(--color-text-primary) font-mono cursor-pointer focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_3px_var(--color-brand-light)]"
              ref="dateInputRef"
              @click="focusDateInput"
            >
          </div>
          <div class="mb-0">
            <label for="time-input" class="block mb-2 font-semibold text-(--color-text-secondary) text-sm">时间</label>
            <input
              type="time"
              id="time-input"
              v-model="timeInput"
              class="w-full py-4 px-[18px]! border border-(--color-border-default) rounded-lg text-[15px] transition-all duration-200 bg-(--color-input-bg) text-(--color-text-primary) font-mono cursor-pointer focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_3px_var(--color-brand-light)]"
              ref="timeInputRef"
              @click="focusTimeInput"
            >
          </div>
        </div>

        <div class="flex gap-3 flex-wrap max-md:flex-col">
          <button @click="convertDateToTimestamp" class="px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-brand) text-white hover:bg-(--color-brand-hover) hover:-translate-y-px hover:shadow-[0_4px_12px_var(--color-shadow)] disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
            <span>转换</span>
          </button>
          <button @click="setCurrentDateTime" class="px-6 py-3 border border-(--color-brand) rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-bg-primary) text-(--color-brand) hover:bg-(--color-bg-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
            <span>当前时间</span>
          </button>
          <button @click="clearDateTime" class="px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 bg-(--color-danger) text-white hover:bg-(--color-danger-hover) hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
            <span>清空</span>
          </button>
        </div>

        <div class="mt-2">
          <label class="block mb-2 font-semibold text-(--color-text-secondary) text-sm">转换结果</label>
          <div class="bg-(--color-bg-secondary) rounded-lg p-4 border border-(--color-border-light)">
            <div v-for="(item, idx) in [
              { label: '选择的日期时间：', value: dateResult.selectedDateTime },
              { label: '秒级时间戳：', value: dateResult.seconds },
              { label: '毫秒时间戳：', value: dateResult.milliseconds },
              { label: '北京时间：', value: dateResult.localTime },
              { label: 'UTC时间：', value: dateResult.utcTime }
            ]" :key="idx" class="flex justify-between items-center py-2 border-b border-(--color-border-light) last:border-b-0 max-md:flex-col max-md:items-start max-md:gap-1">
              <span class="font-medium text-(--color-text-secondary) text-sm">{{ item.label }}</span>
              <span class="font-mono text-[13px] text-(--color-brand) bg-(--color-bg-active) px-2 py-1 rounded break-all max-md:w-full max-md:text-left">{{ item.value || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="message" :class="['fixed top-5 right-5 z-[1000] max-w-[300px] p-3 px-4 rounded-lg text-sm border animate-slide-in max-md:right-2.5 max-md:left-2.5 max-md:max-w-none', messageType === 'success' ? 'bg-(--color-success-bg) text-(--color-success-text) border-(--color-success-border)' : 'bg-(--color-error-bg) text-(--color-error-text) border-(--color-error-border)']">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const timestampInput = ref('')
const dateInput = ref('')
const timeInput = ref('')
const timestampResult = ref({
  localTime: '',
  utcTime: '',
  isoTime: '',
  seconds: '',
  milliseconds: ''
})
const dateResult = ref({
  selectedDateTime: '',
  seconds: '',
  milliseconds: '',
  localTime: '',
  utcTime: ''
})
const message = ref('')
const messageType = ref('success')
const dateInputRef = ref(null)
const timeInputRef = ref(null)

const convertTimestampToDate = () => {
  if (!timestampInput.value.trim()) {
    showMessage('请输入时间戳', 'error')
    return
  }

  try {
    const timestamp = parseInt(timestampInput.value)
    if (isNaN(timestamp)) {
      throw new Error('无效的时间戳格式')
    }

    const isMilliseconds = timestamp > 1000000000000
    const date = new Date(isMilliseconds ? timestamp : timestamp * 1000)

    timestampResult.value = {
      localTime: date.toLocaleString('zh-CN'),
      utcTime: date.toUTCString(),
      isoTime: date.toISOString(),
      seconds: Math.floor(date.getTime() / 1000).toString(),
      milliseconds: date.getTime().toString()
    }

    showMessage('时间戳转换成功！', 'success')
  } catch (error) {
    showMessage('转换失败：' + error.message, 'error')
  }
}

const convertDateToTimestamp = () => {
  if (!dateInput.value || !timeInput.value) {
    showMessage('请选择日期和时间', 'error')
    return
  }

  try {
    const dateTimeString = `${dateInput.value}T${timeInput.value}`
    const date = new Date(dateTimeString)

    if (isNaN(date.getTime())) {
      throw new Error('无效的日期时间格式')
    }

    dateResult.value = {
      selectedDateTime: date.toLocaleString('zh-CN'),
      seconds: Math.floor(date.getTime() / 1000).toString(),
      milliseconds: date.getTime().toString(),
      localTime: date.toLocaleString('zh-CN'),
      utcTime: date.toUTCString()
    }

    showMessage('日期转换成功！', 'success')
  } catch (error) {
    showMessage('转换失败：' + error.message, 'error')
  }
}

const getCurrentTimestamp = () => {
  const now = Math.floor(Date.now() / 1000)
  timestampInput.value = now.toString()
  convertTimestampToDate()
}

const setCurrentDateTime = () => {
  const now = new Date()
  dateInput.value = now.toISOString().split('T')[0]
  timeInput.value = now.toTimeString().split(' ')[0]
  convertDateToTimestamp()
}

const clearTimestamp = () => {
  timestampInput.value = ''
  timestampResult.value = {
    localTime: '',
    utcTime: '',
    isoTime: '',
    seconds: '',
    milliseconds: ''
  }
  message.value = ''
}

const clearDateTime = () => {
  dateInput.value = ''
  timeInput.value = ''
  dateResult.value = {
    selectedDateTime: '',
    seconds: '',
    milliseconds: '',
    localTime: '',
    utcTime: ''
  }
  message.value = ''
}

const showMessage = (text, type) => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const focusDateInput = () => {
  dateInputRef.value?.showPicker()
}

const focusTimeInput = () => {
  timeInputRef.value?.showPicker()
}

onMounted(() => {
  getCurrentTimestamp()
  setCurrentDateTime()
})
</script>
