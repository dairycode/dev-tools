export type TimestampUnit = 'auto' | 'seconds' | 'milliseconds'
export interface DateResult {
  localTime: string
  beijingTime: string
  utcTime: string
  isoTime: string
  seconds: string
  milliseconds: string
}

export function describeDate(milliseconds: number): DateResult {
  const date = new Date(milliseconds)
  if (!Number.isFinite(date.getTime())) throw new Error('日期超出有效范围')
  return {
    localTime: date.toLocaleString('zh-CN', { hour12: false }),
    beijingTime: date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
    utcTime: date.toUTCString(),
    isoTime: date.toISOString(),
    seconds: Math.floor(date.getTime() / 1000).toString(),
    milliseconds: date.getTime().toString(),
  }
}

export function convertTimestamp(text: string, unit: TimestampUnit = 'auto'): DateResult {
  const input = text.trim()
  if (!/^[+-]?\d+$/.test(input)) throw new Error('请输入完整的整数时间戳')
  const value = Number(input)
  if (!Number.isSafeInteger(value)) throw new Error('时间戳超出安全整数范围')
  // 位数只能启发式识别单位；历史或远期日期由显式秒/毫秒选项消除歧义。
  const isMilliseconds = unit === 'milliseconds' || (unit === 'auto' && Math.abs(value) >= 1e11)
  return describeDate(isMilliseconds ? value : value * 1000)
}

export function convertLocalDate(dateText: string, timeText: string): DateResult {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateText) ||
    !/^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(timeText)
  ) {
    throw new Error('请选择有效的日期和时间')
  }
  const [year, month, day] = dateText.split('-').map(Number)
  const [hour, minute, second = 0] = timeText.split(':').map(Number)
  const date = new Date(`${dateText}T${timeText}`)
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== Math.floor(second)
  )
    throw new Error('日期或时间无效，也可能位于本地夏令时跳过的时段')
  return describeDate(date.getTime())
}

export function localDateInputs(milliseconds: number): { date: string; time: string } {
  const date = new Date(milliseconds)
  if (!Number.isFinite(date.getTime())) throw new Error('日期超出有效范围')
  const pad = (value: number) => String(value).padStart(2, '0')
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  }
}
