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

<script>
import JsonTreeNode from './JsonTreeNode.vue'

export default {
  name: 'JsonFormatter',
  components: {
    JsonTreeNode
  },
  data() {
    return {
      inputText: '',
      message: '',
      messageType: 'success',
      parsedJson: null,
      expandedPaths: new Set(),
      parseTimeout: null
    }
  },
  watch: {
    inputText() {
      this.$nextTick(() => this.autoResize())
      this.autoParseJson()
    }
  },
  mounted() {
    this.autoResize()
  },
  beforeUnmount() {
    // 清理定时器
    if (this.parseTimeout) {
      clearTimeout(this.parseTimeout)
    }
  },
  methods: {
    autoParseJson() {
      // 清除之前的定时器
      if (this.parseTimeout) {
        clearTimeout(this.parseTimeout)
      }

      // 如果输入为空，清空树视图
      if (!this.inputText.trim()) {
        this.parsedJson = null
        return
      }

      // 使用防抖，500ms后自动解析
      this.parseTimeout = setTimeout(() => {
        try {
          const parsed = JSON.parse(this.inputText)
          this.parsedJson = parsed
          this.expandedPaths.clear()
          this.expandAll()
        } catch (error) {
          // 静默处理错误，只在格式化/压缩时显示错误消息
          this.parsedJson = null
        }
      }, 500)
    },

    formatJson() {
      if (!this.inputText.trim()) {
        this.showMessage('请输入要格式化的JSON数据', 'error')
        return
      }

      try {
        // 先解析JSON确保格式正确
        const parsed = JSON.parse(this.inputText)
        // 格式化输出，使用2个空格缩进，直接覆盖输入框
        this.inputText = JSON.stringify(parsed, null, 2)
        this.parsedJson = parsed
        this.expandedPaths.clear()
        this.expandAll()
        this.showMessage('JSON格式化成功！', 'success')
      } catch (error) {
        this.parsedJson = null
        this.showMessage('JSON格式错误：' + error.message, 'error')
      }
    },

    compressJson() {
      if (!this.inputText.trim()) {
        this.showMessage('请输入要压缩的JSON数据', 'error')
        return
      }

      try {
        // 先解析JSON确保格式正确
        const parsed = JSON.parse(this.inputText)
        // 压缩输出，无缩进，直接覆盖输入框
        this.inputText = JSON.stringify(parsed)
        this.parsedJson = parsed
        this.expandedPaths.clear()
        this.expandAll()
        this.showMessage('JSON压缩成功！', 'success')
      } catch (error) {
        this.parsedJson = null
        this.showMessage('JSON格式错误：' + error.message, 'error')
      }
    },

    clearAll() {
      this.inputText = ''
      this.message = ''
      this.parsedJson = null
      this.expandedPaths.clear()
      this.$nextTick(() => {
        this.autoResize()
      })
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
    },

    togglePath(path) {
      if (this.expandedPaths.has(path)) {
        this.expandedPaths.delete(path)
      } else {
        this.expandedPaths.add(path)
      }
      this.expandedPaths = new Set(this.expandedPaths)
    },

    expandAll() {
      const collectPaths = (obj, currentPath = '') => {
        if (obj && typeof obj === 'object') {
          this.expandedPaths.add(currentPath)
          Object.keys(obj).forEach(key => {
            const newPath = currentPath ? `${currentPath}.${key}` : key
            collectPaths(obj[key], newPath)
          })
        }
      }
      collectPaths(this.parsedJson, 'root')
      this.expandedPaths = new Set(this.expandedPaths)
    },

    collapseAll() {
      this.expandedPaths.clear()
      this.expandedPaths = new Set(this.expandedPaths)
    }
  }
}
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
  background: #f8f9fa;
  border: 1px solid #dee2e6;
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