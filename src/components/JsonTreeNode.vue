<template>
  <div class="select-none">
    <div class="flex items-center gap-1.5 py-0.5 leading-relaxed" :style="{ paddingLeft: level * 20 + 'px' }">
      <!-- 展开/折叠按钮 -->
      <span
        v-if="isExpandable"
        class="inline-block w-3.5 h-3.5 cursor-pointer text-(--color-text-tertiary) text-[10px] text-center leading-[14px] transition-transform duration-200 hover:text-(--color-brand)"
        @click="toggle"
      >
        {{ isExpanded ? '▼' : '▶' }}
      </span>
      <span v-else class="inline-block w-3.5 h-3.5"></span>

      <!-- 键名 -->
      <span class="text-(--color-brand) font-medium">{{ displayKey }}</span>
      <span class="text-(--color-text-tertiary)">:</span>

      <!-- 值预览 -->
      <span v-if="!isExpandable" class="ml-1 text-(--color-brand)">
        {{ displayValue }}
      </span>
      <span v-else class="text-(--color-text-tertiary)">
        {{ isArray ? '[' : '{' }}
        <span v-if="!isExpanded" class="text-(--color-text-tertiary) italic mx-1.5 text-xs opacity-70">
          {{ collapsedPreview }}
        </span>
        <span v-if="!isExpanded">{{ isArray ? ']' : '}' }}</span>
      </span>
    </div>

    <!-- 展开的子节点 -->
    <div v-if="isExpandable && isExpanded">
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
      <div class="flex items-center gap-1.5 py-0.5" :style="{ paddingLeft: level * 20 + 'px' }">
        <span class="inline-block w-3.5 h-3.5"></span>
        <span class="text-(--color-text-tertiary)">{{ isArray ? ']' : '}' }}</span>
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
