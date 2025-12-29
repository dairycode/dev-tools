<template>
  <div class="timestamp-converter">
    <!-- 时间戳转换为日期 -->
    <div class="converter-section">
      <h3 class="section-title">时间戳转换为日期</h3>
      <div class="input-section">
        <div class="input-group">
          <label for="timestamp-input">时间戳</label>
          <input 
            type="text" 
            id="timestamp-input"
            v-model="timestampInput"
            placeholder="请输入Unix时间戳（秒或毫秒）..."
            @keydown.ctrl.enter="convertTimestampToDate"
            @keydown.meta.enter="convertTimestampToDate"
            class="timestamp-input"
          >
        </div>
        
        <div class="button-group">
          <button @click="convertTimestampToDate" class="btn btn-primary">
            <span>转换</span>
          </button>
          <button @click="getCurrentTimestamp" class="btn btn-secondary">
            <span>当前时间戳</span>
          </button>
          <button @click="clearTimestamp" class="btn btn-clear">
            <span>清空</span>
          </button>
        </div>
        
        <div class="result-section">
          <div class="input-group">
            <label>转换结果</label>
            <div class="result-display">
              <div class="result-item">
                <span class="result-label">北京时间：</span>
                <span class="result-value">{{ timestampResult.localTime || '-' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">UTC时间：</span>
                <span class="result-value">{{ timestampResult.utcTime || '-' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">ISO格式：</span>
                <span class="result-value">{{ timestampResult.isoTime || '-' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">秒级时间戳：</span>
                <span class="result-value">{{ timestampResult.seconds || '-' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">毫秒时间戳：</span>
                <span class="result-value">{{ timestampResult.milliseconds || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日期转换为时间戳 -->
    <div class="converter-section">
      <h3 class="section-title">日期转换为时间戳</h3>
      <div class="input-section">
        <div class="date-input-group">
          <div class="input-group">
            <label for="date-input">日期</label>
            <input 
              type="date" 
              id="date-input"
              v-model="dateInput"
              class="date-input clickable-input"
              ref="dateInputRef"
              @click="focusDateInput"
            >
          </div>
          <div class="input-group">
            <label for="time-input">时间</label>
            <input 
              type="time" 
              id="time-input"
              v-model="timeInput"
              class="time-input clickable-input"
              ref="timeInputRef"
              @click="focusTimeInput"
            >
          </div>
        </div>
        
        <div class="button-group">
          <button @click="convertDateToTimestamp" class="btn btn-primary">
            <span>转换</span>
          </button>
          <button @click="setCurrentDateTime" class="btn btn-secondary">
            <span>当前时间</span>
          </button>
          <button @click="clearDateTime" class="btn btn-clear">
            <span>清空</span>
          </button>
        </div>
        
        <div class="result-section">
          <div class="input-group">
            <label>转换结果</label>
            <div class="result-display">
              <div class="result-item">
                <span class="result-label">选择的日期时间：</span>
                <span class="result-value">{{ dateResult.selectedDateTime || '-' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">秒级时间戳：</span>
                <span class="result-value">{{ dateResult.seconds || '-' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">毫秒时间戳：</span>
                <span class="result-value">{{ dateResult.milliseconds || '-' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">北京时间：</span>
                <span class="result-value">{{ dateResult.localTime || '-' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">UTC时间：</span>
                <span class="result-value">{{ dateResult.utcTime || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="message" :class="['message', messageType]">
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

<style scoped>
.timestamp-converter {
  display: flex;
  flex-direction: column;
  gap: 40px;
  justify-content: flex-start;
  align-items: center;
  padding-top: 5vh;
  min-height: 100%;
  position: relative;
}

.converter-section {
  width: 100%;
  max-width: 800px;
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--primary-color);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.date-input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.clickable-input {
  cursor: pointer;
}

.timestamp-input,
.date-input,
.time-input {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 15px;
  padding: 16px 18px !important;
}

.result-section {
  margin-top: 8px;
}

.result-display {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border-light);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 14px;
}

.result-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: var(--primary-color);
  background: var(--bg-active);
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 300px;
}

@media (max-width: 768px) {
  .timestamp-converter {
    gap: 24px;
    padding-top: 3vh;
  }
  
  .converter-section {
    padding: 20px;
  }
  
  .date-input-group {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .result-value {
    width: 100%;
    text-align: left;
  }
  
  .message {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style> 