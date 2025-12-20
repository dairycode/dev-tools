<template>
  <div class="qr-generator">
    <div class="input-section">
      <div class="input-group">
        <label for="qr-input">输入内容</label>
        <textarea 
          id="qr-input"
          v-model="inputText"
          placeholder="请输入要生成二维码的文本、URL等..."
          @keydown.ctrl.enter="generateQR"
          @keydown.meta.enter="generateQR"
          class="qr-textarea"
          ref="inputArea"
          @input="autoResize()"
        ></textarea>
      </div>
      
      <div class="button-group">
        <button @click="generateQR" class="btn btn-primary">
          <span>生成二维码</span>
        </button>
        <button @click="downloadQR" class="btn btn-secondary" :disabled="!qrCodeGenerated">
          <span>下载二维码</span>
        </button>
        <button @click="clearAll" class="btn btn-clear">
          <span>清空</span>
        </button>
      </div>
    </div>
    
    <div class="output-section">
      <div class="qr-output">
        <div class="qr-container">
          <div v-if="isLoading" class="loading"></div>
          <canvas ref="qrCanvas" v-show="qrCodeGenerated" style="display: block; margin: 0 auto;"></canvas>
          <p v-if="!qrCodeGenerated && !isLoading" class="qr-placeholder">二维码将在这里显示</p>
        </div>
      </div>
    </div>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import { nextTick } from 'vue'

export default {
  name: 'QrCodeGenerator',
  data() {
    return {
      inputText: '',
      qrCodeGenerated: false,
      isLoading: false,
      message: '',
      messageType: 'success'
    }
  },
  watch: {
    inputText() {
      this.$nextTick(() => this.autoResize())
    }
  },
  mounted() {
    this.autoResize()
  },
  methods: {
    async generateQR() {
      if (!this.inputText.trim()) {
        this.showMessage('请输入要生成二维码的内容', 'error')
        return
      }
      this.isLoading = true
      this.qrCodeGenerated = true
      await nextTick()
      try {
        // 清除之前的二维码
        if (this.$refs.qrCanvas) {
          const ctx = this.$refs.qrCanvas.getContext('2d')
          ctx && ctx.clearRect(0, 0, this.$refs.qrCanvas.width, this.$refs.qrCanvas.height)
        }
        // 生成新的二维码
        await QRCode.toCanvas(this.$refs.qrCanvas, this.inputText, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        this.showMessage('二维码生成成功！', 'success')
      } catch (error) {
        this.showMessage('二维码生成失败：' + error.message, 'error')
      } finally {
        this.isLoading = false
      }
    },
    downloadQR() {
      if (!this.qrCodeGenerated || !this.$refs.qrCanvas) {
        this.showMessage('请先生成二维码', 'error')
        return
      }
      try {
        const canvas = this.$refs.qrCanvas
        const link = document.createElement('a')
        link.download = 'qrcode.png'
        link.href = canvas.toDataURL()
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        this.showMessage('二维码下载成功！', 'success')
      } catch (error) {
        this.showMessage('下载失败：' + error.message, 'error')
      }
    },
    clearAll() {
      this.inputText = ''
      this.qrCodeGenerated = false
      this.message = ''
      if (this.$refs.qrCanvas) {
        const ctx = this.$refs.qrCanvas.getContext('2d')
        ctx && ctx.clearRect(0, 0, this.$refs.qrCanvas.width, this.$refs.qrCanvas.height)
      }
      this.$nextTick(() => this.autoResize())
    },
    showMessage(text, type) {
      this.message = text
      this.messageType = type
      setTimeout(() => {
        this.message = ''
      }, 3000)
    },
    autoResize() {
      const area = this.$refs.inputArea
      if (area && area instanceof HTMLTextAreaElement) {
        area.style.height = 'auto'
        area.style.height = area.scrollHeight + 'px'
      }
    }
  }
}
</script>

<style scoped>
.qr-generator {
  display: flex;
  flex-direction: column;
  gap: 32px;
  justify-content: flex-start;
  align-items: center;
  padding-top: 10vh;
  min-height: 100%;
  position: relative;
}

.input-section,
.output-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 800px;
}

.qr-textarea {
  min-height: 96px !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  overflow-y: hidden;
  transition: height 0.2s;
}

.qr-output {
  text-align: center;
  margin-top: 24px;
}

.qr-container {
  display: inline-block;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-container canvas {
  max-width: 200px;
  height: auto;
}

.qr-placeholder {
  color: var(--text-tertiary);
  margin: 0;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 300px;
}

@media (max-width: 768px) {
  .qr-generator {
    gap: 24px;
    padding-top: 5vh;
  }
  
  .qr-textarea {
    min-height: 72px !important;
  }
  
  .qr-container {
    min-height: 150px;
  }
  
  .message {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>