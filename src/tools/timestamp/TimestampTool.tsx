import { useState } from 'react'
import { Button, errorText, onShortcut } from '../../shared/ui/Controls'
import { Select } from '../../shared/ui/Select'
import { useClipboard } from '../../shared/hooks/useClipboard'
import { useToast } from '../../shared/ui/Toast'
import {
  convertTimestamp,
  convertLocalDate,
  describeDate,
  localDateInputs,
  type DateResult,
  type TimestampUnit,
} from './model'

function Results({ result }: { result: DateResult | null }) {
  const copy = useClipboard()
  const fields = [
    ['localTime', '本地时间'],
    ['beijingTime', '北京时间'],
    ['utcTime', 'UTC 时间'],
    ['isoTime', 'ISO 格式'],
    ['seconds', '秒级时间戳'],
    ['milliseconds', '毫秒时间戳'],
  ] as const
  return (
    <dl className="date-results">
      {fields.map(([key, label]) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd>
            <button
              type="button"
              disabled={!result}
              aria-label={`复制${label}：${result?.[key] ?? '—'}`}
              onClick={() => {
                if (result) void copy(result[key])
              }}
            >
              {result?.[key] ?? '—'}
            </button>
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default function TimestampTool() {
  const [initial] = useState(() => {
    const now = Math.floor(Date.now() / 1000) * 1000
    return { now, ...localDateInputs(now) }
  })
  const [timestamp, setTimestamp] = useState(String(initial.now / 1000))
  const [unit, setUnit] = useState<TimestampUnit>('auto')
  const [timestampResult, setTimestampResult] = useState<DateResult | null>(() =>
    describeDate(initial.now),
  )
  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)
  const [dateResult, setDateResult] = useState<DateResult | null>(() => describeDate(initial.now))
  const { notify, dismiss } = useToast()
  function convertInput() {
    try {
      setTimestampResult(convertTimestamp(timestamp, unit))
      notify('时间戳转换成功')
    } catch (error) {
      setTimestampResult(null)
      notify(errorText(error), 'error')
    }
  }
  function convertDate() {
    try {
      setDateResult(convertLocalDate(date, time))
      notify('日期转换成功')
    } catch (error) {
      setDateResult(null)
      notify(errorText(error), 'error')
    }
  }
  function currentTimestamp() {
    const now = Date.now()
    const value = unit === 'milliseconds' ? String(now) : String(Math.floor(now / 1000))
    setTimestamp(value)
    setTimestampResult(convertTimestamp(value, unit))
  }
  function currentDate() {
    const parts = localDateInputs(Date.now())
    setDate(parts.date)
    setTime(parts.time)
    setDateResult(convertLocalDate(parts.date, parts.time))
  }
  return (
    <div className="timestamp-tool">
      <section
        className="tool-card"
        aria-labelledby="timestamp-to-date"
        onKeyDown={onShortcut(convertInput)}
      >
        <h2 id="timestamp-to-date" className="section-title">
          时间戳转换为日期
        </h2>
        <div className="timestamp-fields">
          <div className="field">
            <label htmlFor="timestamp-input">时间戳</label>
            <input
              id="timestamp-input"
              className="text-input font-mono"
              value={timestamp}
              placeholder="请输入 Unix 时间戳…"
              onChange={(event) => {
                setTimestamp(event.target.value)
                setTimestampResult(null)
              }}
            />
          </div>
          <div className="field">
            <label
              id="timestamp-unit-label"
              htmlFor="timestamp-unit"
              title="自动识别常见的 10 位秒 / 13 位毫秒；其他情况请手动选择单位"
            >
              单位
            </label>
            <Select<TimestampUnit>
              id="timestamp-unit"
              value={unit}
              onChange={(value) => {
                setUnit(value)
                setTimestampResult(null)
              }}
              options={[
                { value: 'auto', label: '自动识别' },
                { value: 'seconds', label: '秒' },
                { value: 'milliseconds', label: '毫秒' },
              ]}
            />
          </div>
        </div>
        <div className="action-bar">
          <Button variant="primary" onClick={convertInput}>
            转换
          </Button>
          <Button onClick={currentTimestamp}>当前时间戳</Button>
          <Button
            variant="clear"
            onClick={() => {
              setTimestamp('')
              setTimestampResult(null)
              dismiss()
            }}
          >
            清空
          </Button>
        </div>
        <Results result={timestampResult} />
      </section>
      <section
        className="tool-card"
        aria-labelledby="date-to-timestamp"
        onKeyDown={onShortcut(convertDate)}
      >
        <h2 id="date-to-timestamp" className="section-title">
          日期转换为时间戳
        </h2>
        <div className="date-fields">
          <div className="field">
            <label htmlFor="date-input">日期（本地时区）</label>
            <input
              type="date"
              id="date-input"
              className="text-input"
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                setDateResult(null)
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="time-input">时间</label>
            <input
              type="time"
              step="1"
              id="time-input"
              className="text-input"
              value={time}
              onChange={(event) => {
                setTime(event.target.value)
                setDateResult(null)
              }}
            />
          </div>
        </div>
        <div className="action-bar">
          <Button variant="primary" onClick={convertDate}>
            转换
          </Button>
          <Button onClick={currentDate}>当前时间</Button>
          <Button
            variant="clear"
            onClick={() => {
              setDate('')
              setTime('')
              setDateResult(null)
              dismiss()
            }}
          >
            清空
          </Button>
        </div>
        <Results result={dateResult} />
      </section>
    </div>
  )
}
