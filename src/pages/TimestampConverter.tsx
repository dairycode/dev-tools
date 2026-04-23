import { useState, useEffect, useRef } from 'react'
import { useMessage } from '../hooks/useMessage'
import type { TimestampResult, DateResult } from '../types'
import Toast from '../components/Toast'

const emptyTimestampResult: TimestampResult = { localTime: '', utcTime: '', isoTime: '', seconds: '', milliseconds: '' }
const emptyDateResult: DateResult = { selectedDateTime: '', seconds: '', milliseconds: '', localTime: '', utcTime: '' }

export default function TimestampConverter() {
  const [timestampInput, setTimestampInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [timestampResult, setTimestampResult] = useState<TimestampResult>(emptyTimestampResult)
  const [dateResult, setDateResult] = useState<DateResult>(emptyDateResult)
  const { message, messageType, showMessage } = useMessage()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)

  const convertTimestampToDate = (input?: string) => {
    const val = input ?? timestampInput
    if (!val.trim()) {
      showMessage('请输入时间戳', 'error')
      return
    }
    try {
      const timestamp = parseInt(val)
      if (isNaN(timestamp)) throw new Error('无效的时间戳格式')
      const isMilliseconds = timestamp > 1000000000000
      const date = new Date(isMilliseconds ? timestamp : timestamp * 1000)
      setTimestampResult({
        localTime: date.toLocaleString('zh-CN'),
        utcTime: date.toUTCString(),
        isoTime: date.toISOString(),
        seconds: Math.floor(date.getTime() / 1000).toString(),
        milliseconds: date.getTime().toString(),
      })
      showMessage('时间戳转换成功！', 'success')
    } catch (error) {
      showMessage('转换失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const convertDateToTimestamp = (d?: string, t?: string) => {
    const dVal = d ?? dateInput
    const tVal = t ?? timeInput
    if (!dVal || !tVal) {
      showMessage('请选择日期和时间', 'error')
      return
    }
    try {
      const date = new Date(`${dVal}T${tVal}`)
      if (isNaN(date.getTime())) throw new Error('无效的日期时间格式')
      setDateResult({
        selectedDateTime: date.toLocaleString('zh-CN'),
        seconds: Math.floor(date.getTime() / 1000).toString(),
        milliseconds: date.getTime().toString(),
        localTime: date.toLocaleString('zh-CN'),
        utcTime: date.toUTCString(),
      })
      showMessage('日期转换成功！', 'success')
    } catch (error) {
      showMessage('转换失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const getCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000).toString()
    setTimestampInput(now)
    convertTimestampToDate(now)
  }

  const setCurrentDateTime = () => {
    const now = new Date()
    const d = now.toISOString().split('T')[0]
    const t = now.toTimeString().split(' ')[0]
    setDateInput(d)
    setTimeInput(t)
    convertDateToTimestamp(d, t)
  }

  const clearTimestamp = () => {
    setTimestampInput('')
    setTimestampResult(emptyTimestampResult)
  }

  const clearDateTime = () => {
    setDateInput('')
    setTimeInput('')
    setDateResult(emptyDateResult)
  }

  useEffect(() => {
    getCurrentTimestamp()
    setCurrentDateTime()
  }, [])

  const resultRow = (label: string, value: string) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-neutral-700 last:border-b-0 max-md:flex-col max-md:items-start max-md:gap-1">
      <span className="font-medium text-gray-600 dark:text-gray-300 text-sm">{label}</span>
      <span className="font-mono text-[13px] text-primary bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded break-all max-md:w-full max-md:text-left">{value || '-'}</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-10 items-center pt-[5vh] min-h-full max-md:gap-6 max-md:pt-[3vh]">
      {/* 时间戳转日期 */}
      <div className="w-full max-w-[800px] bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm dark:shadow-neutral-800/50 max-md:p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 pb-3 border-b-2 border-primary">时间戳转换为日期</h3>
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="timestamp-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">时间戳</label>
            <input
              type="text"
              id="timestamp-input"
              value={timestampInput}
              onChange={e => setTimestampInput(e.target.value)}
              onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') convertTimestampToDate() }}
              placeholder="请输入Unix时间戳（秒或毫秒）..."
              className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light"
            />
          </div>
          <div className="flex gap-3 flex-wrap max-md:flex-col">
            <button onClick={() => convertTimestampToDate()} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg max-md:flex-none">转换</button>
            <button onClick={getCurrentTimestamp} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">当前时间戳</button>
            <button onClick={clearTimestamp} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">清空</button>
          </div>
          <div className="mt-2">
            <label className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">转换结果</label>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              {resultRow('北京时间：', timestampResult.localTime)}
              {resultRow('UTC时间：', timestampResult.utcTime)}
              {resultRow('ISO格式：', timestampResult.isoTime)}
              {resultRow('秒级时间戳：', timestampResult.seconds)}
              {resultRow('毫秒时间戳：', timestampResult.milliseconds)}
            </div>
          </div>
        </div>
      </div>
      {/* 日期转时间戳 */}
      <div className="w-full max-w-[800px] bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm dark:shadow-neutral-800/50 max-md:p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 pb-3 border-b-2 border-primary">日期转换为时间戳</h3>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-3">
            <div>
              <label htmlFor="date-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">日期</label>
              <input
                type="date"
                id="date-input"
                ref={dateInputRef}
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                onClick={() => dateInputRef.current?.showPicker()}
                className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light"
              />
            </div>
            <div>
              <label htmlFor="time-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">时间</label>
              <input
                type="time"
                id="time-input"
                ref={timeInputRef}
                value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
                onClick={() => timeInputRef.current?.showPicker()}
                className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light"
              />
            </div>
          </div>
          <div className="flex gap-3 flex-wrap max-md:flex-col">
            <button onClick={() => convertDateToTimestamp()} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg max-md:flex-none">转换</button>
            <button onClick={setCurrentDateTime} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">当前时间</button>
            <button onClick={clearDateTime} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">清空</button>
          </div>
          <div className="mt-2">
            <label className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">转换结果</label>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              {resultRow('选择的日期时间：', dateResult.selectedDateTime)}
              {resultRow('秒级时间戳：', dateResult.seconds)}
              {resultRow('毫秒时间戳：', dateResult.milliseconds)}
              {resultRow('北京时间：', dateResult.localTime)}
              {resultRow('UTC时间：', dateResult.utcTime)}
            </div>
          </div>
        </div>
      </div>
      <Toast message={message} type={messageType} />
    </div>
  )
}
