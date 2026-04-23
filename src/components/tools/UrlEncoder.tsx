import { useState, useRef, useEffect, useCallback } from 'react'
import { useToast } from '../../context/ToastContext'

export default function UrlEncoder() {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { showToast } = useToast()

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => { autoResize() }, [text, autoResize])

  const encode = () => {
    if (!text.trim()) return showToast('请输入要编码的文本', 'error')
    try {
      setText(encodeURIComponent(text))
      showToast('URL编码成功', 'success')
    } catch (e) {
      showToast('编码失败：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const decode = () => {
    if (!text.trim()) return showToast('请输入要解码的文本', 'error')
    try {
      setText(decodeURIComponent(text))
      showToast('URL解码成功', 'success')
    } catch {
      try {
        setText(globalThis.decodeURI(text))
        showToast('URI解码成功', 'success')
      } catch (e) {
        showToast('解码失败：' + (e instanceof Error ? e.message : String(e)), 'error')
      }
    }
  }

  const encodeUri = () => {
    if (!text.trim()) return showToast('请输入要编码的文本', 'error')
    try {
      setText(globalThis.encodeURI(text))
      showToast('URI编码成功', 'success')
    } catch (e) {
      showToast('编码失败：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') encode()
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">输入文本</label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入要编码或解码的文本..."
        className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
      />
      <div className="flex gap-2 flex-wrap">
        <button onClick={encode} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">编码</button>
        <button onClick={decode} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">解码</button>
        <button onClick={encodeUri} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">URI编码</button>
        <button onClick={() => setText('')} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
      </div>
    </div>
  )
}
