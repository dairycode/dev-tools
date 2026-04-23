import { useState, useRef, useEffect, useCallback } from 'react'
import { useToast } from '../../../context/ToastContext'
import JsonTreeNode from './JsonTreeNode'

export default function JsonFormatter() {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<unknown>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const parseTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const { showToast } = useToast()

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => { autoResize() }, [text, autoResize])

  const expandAll = useCallback((obj: unknown, prefix = 'root') => {
    const paths = new Set<string>()
    const walk = (o: unknown, p: string) => {
      if (o && typeof o === 'object') {
        paths.add(p)
        Object.keys(o).forEach(k => walk((o as Record<string, unknown>)[k], `${p}.${k}`))
      }
    }
    walk(obj, prefix)
    return paths
  }, [])

  useEffect(() => {
    if (parseTimerRef.current) clearTimeout(parseTimerRef.current)
    if (!text.trim()) { setParsed(null); return }
    parseTimerRef.current = setTimeout(() => {
      try {
        const obj = JSON.parse(text)
        setParsed(obj)
        setExpandedPaths(expandAll(obj))
      } catch {
        setParsed(null)
      }
    }, 500)
    return () => { if (parseTimerRef.current) clearTimeout(parseTimerRef.current) }
  }, [text, expandAll])

  const format = () => {
    if (!text.trim()) return showToast('请输入要格式化的JSON数据', 'error')
    try {
      const obj = JSON.parse(text)
      setText(JSON.stringify(obj, null, 2))
      setParsed(obj)
      setExpandedPaths(expandAll(obj))
      showToast('JSON格式化成功', 'success')
    } catch (e) {
      showToast('JSON格式错误：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const compress = () => {
    if (!text.trim()) return showToast('请输入要压缩的JSON数据', 'error')
    try {
      const obj = JSON.parse(text)
      setText(JSON.stringify(obj))
      setParsed(obj)
      setExpandedPaths(expandAll(obj))
      showToast('JSON压缩成功', 'success')
    } catch (e) {
      showToast('JSON格式错误：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') format()
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">输入JSON</label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入要格式化的JSON数据..."
        className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
      />
      <div className="flex gap-2 flex-wrap">
        <button onClick={format} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">格式化</button>
        <button onClick={compress} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">压缩</button>
        <button onClick={() => { setText(''); setParsed(null); setExpandedPaths(new Set()) }} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
      </div>
      {parsed !== null && (
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm overflow-auto max-h-[600px]">
          <JsonTreeNode data={parsed} keyName="root" level={0} expandedPaths={expandedPaths} onToggle={togglePath} />
        </div>
      )}
    </div>
  )
}
