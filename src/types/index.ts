import type { ComponentType, LazyExoticComponent } from 'react'

export type MessageType = 'success' | 'error'

export interface ToolDefinition {
  key: string
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  component: LazyExoticComponent<ComponentType>
}

export interface TimestampResult {
  localTime: string
  utcTime: string
  isoTime: string
  seconds: string
  milliseconds: string
}

export interface DateResult {
  selectedDateTime: string
  seconds: string
  milliseconds: string
  localTime: string
  utcTime: string
}

export type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512'
