// 通用类型定义
export type MessageType = 'success' | 'error'

// 时间戳转换器类型
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

// Hash类型
export type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512'
