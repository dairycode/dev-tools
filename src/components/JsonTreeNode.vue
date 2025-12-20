<template>
  <div class="tree-node">
    <div class="node-line" :style="{ paddingLeft: level * 20 + 'px' }">
      <!-- 展开/折叠按钮 -->
      <span
        v-if="isExpandable"
        class="toggle-icon"
        @click="toggle"
      >
        {{ isExpanded ? '▼' : '▶' }}
      </span>
      <span v-else class="toggle-icon-placeholder"></span>

      <!-- 键名 -->
      <span class="key-name">{{ displayKey }}</span>
      <span class="colon">:</span>

      <!-- 值预览 -->
      <span v-if="!isExpandable" :class="['value', valueType]">
        {{ displayValue }}
      </span>
      <span v-else class="bracket">
        {{ isArray ? '[' : '{' }}
        <span v-if="!isExpanded" class="preview">
          {{ collapsedPreview }}
        </span>
        <span v-if="!isExpanded">{{ isArray ? ']' : '}' }}</span>
      </span>
    </div>

    <!-- 展开的子节点 -->
    <div v-if="isExpandable && isExpanded" class="children">
      <JsonTreeNode
        v-for="(childValue, childKey) in data"
        :key="childKey"
        :data="childValue"
        :keyName="childKey"
        :level="level + 1"
        :expandedPaths="expandedPaths"
        :parentPath="currentPath"
        @toggle="$emit('toggle', $event)"
      />
      <div class="closing-bracket" :style="{ paddingLeft: level * 20 + 'px' }">
        <span class="toggle-icon-placeholder"></span>
        <span class="bracket">{{ isArray ? ']' : '}' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JsonTreeNode',
  props: {
    data: {
      required: true
    },
    keyName: {
      type: [String, Number],
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    expandedPaths: {
      type: Set,
      required: true
    },
    parentPath: {
      type: String,
      default: ''
    }
  },
  computed: {
    currentPath() {
      return this.parentPath ? `${this.parentPath}.${this.keyName}` : String(this.keyName)
    },
    isExpanded() {
      return this.expandedPaths.has(this.currentPath)
    },
    isExpandable() {
      return this.data !== null && typeof this.data === 'object'
    },
    isArray() {
      return Array.isArray(this.data)
    },
    valueType() {
      if (this.data === null) return 'null'
      if (typeof this.data === 'string') return 'string'
      if (typeof this.data === 'number') return 'number'
      if (typeof this.data === 'boolean') return 'boolean'
      return 'unknown'
    },
    displayKey() {
      return typeof this.keyName === 'number' ? `[${this.keyName}]` : this.keyName
    },
    displayValue() {
      if (this.data === null) return 'null'
      if (typeof this.data === 'string') return `"${this.data}"`
      if (typeof this.data === 'boolean') return String(this.data)
      if (typeof this.data === 'number') return String(this.data)
      return String(this.data)
    },
    collapsedPreview() {
      if (!this.isExpandable) return ''
      if (this.isArray) {
        const length = this.data.length
        return length === 0 ? '' : `${length} item${length !== 1 ? 's' : ''}`
      } else {
        const keys = Object.keys(this.data)
        return keys.length === 0 ? '' : `${keys.length} key${keys.length !== 1 ? 's' : ''}`
      }
    }
  },
  methods: {
    toggle() {
      this.$emit('toggle', this.currentPath)
    }
  }
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-line {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  line-height: 1.6;
}

.toggle-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  cursor: pointer;
  color: #6c757d;
  font-size: 10px;
  text-align: center;
  line-height: 14px;
  transition: transform 0.2s;
}

.toggle-icon:hover {
  color: #1976d2;
}

.toggle-icon-placeholder {
  display: inline-block;
  width: 14px;
  height: 14px;
}

.key-name {
  color: #1976d2;
  font-weight: 500;
}

.colon {
  color: #6c757d;
}

.value {
  margin-left: 4px;
}

.value.string {
  color: #005cc5;
}

.value.number {
  color: #005cc5;
}

.value.boolean {
  color: #005cc5;
}

.value.null {
  color: #005cc5;
}

.bracket {
  color: #6c757d;
}

.preview {
  color: #adb5bd;
  font-style: italic;
  margin: 0 6px;
  font-size: 12px;
}

.children {
  margin-left: 0;
}

.closing-bracket {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .value.string {
    color: #79c0ff;
  }

  .value.number {
    color: #79c0ff;
  }

  .value.boolean {
    color: #79c0ff;
  }

  .value.null {
    color: #79c0ff;
  }
}
</style>
