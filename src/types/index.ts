export type MessageType = 'success' | 'error'

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

export interface NavItem {
  key: string
  title: string
  icon: string
}
