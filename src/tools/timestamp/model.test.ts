import { describe, expect, it } from 'vitest'
import { convertTimestamp, convertLocalDate, describeDate, localDateInputs } from './model'

describe('时间戳与日期', () => {
  it.each([
    ['0', '1970-01-01T00:00:00.000Z'],
    ['-1', '1969-12-31T23:59:59.000Z'],
    ['1704067200', '2024-01-01T00:00:00.000Z'],
    ['1704067200000', '2024-01-01T00:00:00.000Z'],
  ])('自动识别 %s', (text, expected) => expect(convertTimestamp(text).isoTime).toBe(expected))
  it('支持早期毫秒时间戳的显式单位', () =>
    expect(convertTimestamp('1000', 'milliseconds').seconds).toBe('1'))
  it('秒级显式单位不受启发式影响', () =>
    expect(convertTimestamp('100000000000', 'seconds').milliseconds).toBe('100000000000000'))
  it('支持带符号及外部空白', () =>
    expect(convertTimestamp(' +1 ', 'seconds').milliseconds).toBe('1000'))
  it('负毫秒的秒值向下取整', () =>
    expect(convertTimestamp('-1', 'milliseconds').seconds).toBe('-1'))
  it('分别提供北京、UTC、ISO', () => {
    const result = convertTimestamp('0')
    expect(result.beijingTime).toContain('8:00:00')
    expect(result.utcTime).toContain('00:00:00 GMT')
    expect(result.isoTime).toBe('1970-01-01T00:00:00.000Z')
  })
  it.each(['', ' ', '123abc', '1.2', 'NaN', 'Infinity', '1e3', '9007199254740992'])(
    '拒绝不完整或不安全输入：%j',
    (text) => expect(() => convertTimestamp(text)).toThrow(),
  )
  it('拒绝超出日期范围的值', () =>
    expect(() => convertTimestamp('8640000000000001', 'milliseconds')).toThrow('范围'))
  it('拒绝无效日期结果', () => expect(() => describeDate(NaN)).toThrow())
  it('日期输入按本地时间解释，保留秒', () => {
    expect(convertLocalDate('2024-01-02', '03:04:05').isoTime).toBe(
      new Date(2024, 0, 2, 3, 4, 5).toISOString(),
    )
    expect(convertLocalDate('2024-01-02', '03:04').isoTime).toBe(
      new Date(2024, 0, 2, 3, 4).toISOString(),
    )
  })
  it('允许毫秒输入', () =>
    expect(convertLocalDate('2024-01-02', '03:04:05.123').milliseconds).toBe(
      String(new Date(2024, 0, 2, 3, 4, 5, 123).getTime()),
    ))
  it.each([
    ['2024-02-30', '12:00'],
    ['2023-02-29', '12:00'],
    ['2024-13-01', '12:00'],
    ['2024-01-01', '25:00'],
    ['2024-01-01', '12:60'],
    ['', ''],
    ['2024-1-1', '1:00'],
  ])('拒绝无效日期 %s %s', (date, time) => expect(() => convertLocalDate(date, time)).toThrow())
  it('当前日期生成不混用 UTC 日期与本地时间', () => {
    const now = Date.UTC(2024, 0, 1, 20, 30, 40)
    const parts = localDateInputs(now)
    expect(convertLocalDate(parts.date, parts.time).milliseconds).toBe(String(now))
  })
  it('拒绝生成无效当前时间输入', () => expect(() => localDateInputs(Infinity)).toThrow())
})
