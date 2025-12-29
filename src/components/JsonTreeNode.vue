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

<script setup>
import { computed } from 'vue'

const props = defineProps({
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
})

const emit = defineEmits(['toggle'])

const currentPath = computed(() => {
  return props.parentPath ? `${props.parentPath}.${props.keyName}` : String(props.keyName)
})

const isExpanded = computed(() => {
  return props.expandedPaths.has(currentPath.value)
})

const isExpandable = computed(() => {
  return props.data !== null && typeof props.data === 'object'
})

const isArray = computed(() => {
  return Array.isArray(props.data)
})

const valueType = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'string') return 'string'
  if (typeof props.data === 'number') return 'number'
  if (typeof props.data === 'boolean') return 'boolean'
  return 'unknown'
})

const displayKey = computed(() => {
  return typeof props.keyName === 'number' ? `[${props.keyName}]` : props.keyName
})

const displayValue = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'string') return `"${props.data}"`
  if (typeof props.data === 'boolean') return String(props.data)
  if (typeof props.data === 'number') return String(props.data)
  return String(props.data)
})

const collapsedPreview = computed(() => {
  if (!isExpandable.value) return ''
  if (isArray.value) {
    const length = props.data.length
    return length === 0 ? '' : `${length} item${length !== 1 ? 's' : ''}`
  } else {
    const keys = Object.keys(props.data)
    return keys.length === 0 ? '' : `${keys.length} key${keys.length !== 1 ? 's' : ''}`
  }
})

const toggle = () => {
  emit('toggle', currentPath.value)
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
  color: var(--text-tertiary);
  font-size: 10px;
  text-align: center;
  line-height: 14px;
  transition: transform 0.2s;
}

.toggle-icon:hover {
  color: var(--primary-color);
}

.toggle-icon-placeholder {
  display: inline-block;
  width: 14px;
  height: 14px;
}

.key-name {
  color: var(--primary-color);
  font-weight: 500;
}

.colon {
  color: var(--text-tertiary);
}

.value {
  margin-left: 4px;
}

.value.string {
  color: var(--primary-color);
}

.value.number {
  color: var(--primary-color);
}

.value.boolean {
  color: var(--primary-color);
}

.value.null {
  color: var(--primary-color);
}

.bracket {
  color: var(--text-tertiary);
}

.preview {
  color: var(--text-tertiary);
  font-style: italic;
  margin: 0 6px;
  font-size: 12px;
  opacity: 0.7;
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
</style>
