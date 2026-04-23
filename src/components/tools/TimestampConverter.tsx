import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import type { TimestampResult, DateResult } from '../../types'

const emptyTimestamp: TimestampResult = { localTime: '', utcTime: '', isoTime: '', seconds: '', milliseconds: '' }
const emptyDate: DateResult = { selectedDateTime: '', seconds: '', milliseconds: '', localTime: '', utcTime: '' }

export default function TimestampConverter() {
  const [tsInput, setTsInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [tsResult, setTsResult] = useState<TimestampResult>(emptyTimestamp)
  const [dateResult, setDateResult] = useState<DateResult>(emptyDate)
  const { showToast } = useToast()

  const convertTs = () => {
    if (!tsInput.trim()) return showToast('请输入时间戳', 'error')
    const ts = parseInt(tsInput)
    if (isNaN(ts)) return showToast('无效的时间戳格式', 'error')
    const d = new Date(ts > 1e12 ? ts : ts * 1000)
    setTsResult({
      localTime: d.toLocaleString('zh-CN'),
      utcTime: d.toUTCString(),
      isoTime: d.toISOString(),
      seconds: Math.floor(d.getTime() / 1000).toString(),
      milliseconds: d.getTime().toString(),
    })
    showToast('时间戳转换成功', 'success')
  }

  const convertDate = () => {
    if (!dateInput || !timeInput) return showToast('请选择日期和时间', 'error')
    const d = new Date(`${dateInput}T${timeInput}`)
    if (isNaN(d.getTime())) return showToast('无效的日期时间格式', 'error')
    setDateResult({
      selectedDateTime: d.toLocaleString('zh-CN'),
      seconds: Math.floor(d.getTime() / 1000).toString(),
      milliseconds: d.getTime().toString(),
      localTime: d.toLocaleString('zh-CN'),
      utcTime: d.toUTCString(),
    })
    showToast('日期转换成功', 'success')
  }

  const getNow = () => {
    const now = Math.floor(Date.now() / 1000)
    setTsInput(now.toString())
  }

  const setNowDate = () => {
    const now = new Date()
    setDateInput(now.toISOString().split('T')[0])
    setTimeInput(now.toTimeString().split(' ')[0])
  }

  useEffect(() => { getNow(); setNowDate() }, [])

  const ResultRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded break-all max-w-[60%] text-right">{value || '-'}</span>
    </div>
  )

  const sectionClass = "p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"

  return (
    <div className="flex flex-col gap-6">
      <section className={sectionClass}>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 pb-3 border-b-2 border-indigo-500">时间戳转换为日期</h3>
        <div className="flex flex-col gap-4">
          <input value={tsInput} onChange={e => setTsInput(e.target.value)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') convertTs() }} placeholder="请输入Unix时间戳（秒或毫秒）..." className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="flex gap-2 flex-wrap">
            <button onClick={convertTs} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">转换</button>
            <button onClick={getNow} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">当前时间戳</button>
            <button onClick={() => { setTsInput(''); setTsResult(emptyTimestamp) }} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
            <ResultRow label="北京时间" value={tsResult.localTime} />
            <ResultRow label="UTC时间" value={tsResult.utcTime} />
            <ResultRow label="ISO格式" value={tsResult.isoTime} />
            <ResultRow label="秒级时间戳" value={tsResult.seconds} />
            <ResultRow label="毫秒时间戳" value={tsResult.milliseconds} />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 pb-3 border-b-2 border-indigo-500">日期转换为时间戳</h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="time" value={timeInput} onChange={e => setTimeInput(e.target.value)} step="1" className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={convertDate} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">转换</button>
            <button onClick={setNowDate} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">当前时间</button>
            <button onClick={() => { setDateInput(''); setTimeInput(''); setDateResult(emptyDate) }} className="flex-1 min-w-[80px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
            <ResultRow label="选择的日期时间" value={dateResult.selectedDateTime} />
            <ResultRow label="秒级时间戳" value={dateResult.seconds} />
            <ResultRow label="毫秒时间戳" value={dateResult.milliseconds} />
            <ResultRow label="北京时间" value={dateResult.localTime} />
            <ResultRow label="UTC时间" value={dateResult.utcTime} />
          </div>
        </div>
      </section>
    </div>
  )
}
