import { useState } from 'react'
import {
  ActionBar,
  Button,
  Field,
  TextInput,
  errorText,
  onShortcut,
} from '../../shared/ui/Controls'
import { ToolCard } from '../../shared/ui/Panels'
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
    <dl className="overflow-hidden rounded-xl border border-line bg-panel">
      {fields.map(([key, label]) => (
        <div
          key={key}
          className="grid gap-1 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[120px_minmax(0,1fr)] lg:grid-cols-[88px_minmax(0,1fr)] lg:gap-x-2 lg:px-3 lg:py-2"
        >
          <dt className="text-sm text-subtle">{label}</dt>
          <dd className="min-w-0">
            <button
              className="w-full text-left font-mono text-sm text-brand [overflow-wrap:anywhere]"
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
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <ToolCard
        as="section"
        className="lg:p-5"
        aria-labelledby="timestamp-to-date"
        onKeyDown={onShortcut(convertInput)}
      >
        <h2
          id="timestamp-to-date"
          className="mb-5 border-b border-line pb-3 text-lg font-semibold lg:mb-4"
        >
          时间戳转换为日期
        </h2>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[minmax(0,1fr)_160px] lg:grid-cols-[minmax(0,1fr)_128px]">
          <Field htmlFor="timestamp-input" label="时间戳" className="mb-5 lg:mb-4">
            <TextInput
              id="timestamp-input"
              className="font-mono"
              value={timestamp}
              placeholder="请输入 Unix 时间戳…"
              onChange={(event) => {
                setTimestamp(event.target.value)
                setTimestampResult(null)
              }}
            />
          </Field>
          <Field
            htmlFor="timestamp-unit"
            label="单位"
            labelTitle="自动识别常见的 10 位秒 / 13 位毫秒；其他情况请手动选择单位"
            className="mb-5 lg:mb-4"
          >
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
          </Field>
        </div>
        <ActionBar className="mb-5 lg:mb-4 lg:gap-2">
          <Button className="lg:px-3" variant="primary" onClick={convertInput}>
            转换
          </Button>
          <Button className="lg:px-3" onClick={currentTimestamp}>
            当前时间戳
          </Button>
          <Button
            className="lg:px-3"
            variant="clear"
            onClick={() => {
              setTimestamp('')
              setTimestampResult(null)
              dismiss()
            }}
          >
            清空
          </Button>
        </ActionBar>
        <Results result={timestampResult} />
      </ToolCard>
      <ToolCard
        as="section"
        className="lg:p-5"
        aria-labelledby="date-to-timestamp"
        onKeyDown={onShortcut(convertDate)}
      >
        <h2
          id="date-to-timestamp"
          className="mb-5 border-b border-line pb-3 text-lg font-semibold lg:mb-4"
        >
          日期转换为时间戳
        </h2>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field htmlFor="date-input" label="日期（本地时区）" className="mb-5 lg:mb-4">
            <TextInput
              type="date"
              id="date-input"
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                setDateResult(null)
              }}
            />
          </Field>
          <Field htmlFor="time-input" label="时间" className="mb-5 lg:mb-4">
            <TextInput
              type="time"
              step="1"
              id="time-input"
              value={time}
              onChange={(event) => {
                setTime(event.target.value)
                setDateResult(null)
              }}
            />
          </Field>
        </div>
        <ActionBar className="mb-5 lg:mb-4 lg:gap-2">
          <Button className="lg:px-3" variant="primary" onClick={convertDate}>
            转换
          </Button>
          <Button className="lg:px-3" onClick={currentDate}>
            当前时间
          </Button>
          <Button
            className="lg:px-3"
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
        </ActionBar>
        <Results result={dateResult} />
      </ToolCard>
    </div>
  )
}
