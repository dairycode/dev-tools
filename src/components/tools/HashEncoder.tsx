import { useState, useRef, useEffect, useCallback } from 'react'
import CryptoJS from 'crypto-js'
import { useToast } from '../../context/ToastContext'
import { useClipboard } from '../../hooks/useClipboard'
import type { HashType } from '../../types'

const hashFns: Record<HashType, (text: string) => string> = {
  md5: t => CryptoJS.MD5(t).toString(),
  sha1: t => CryptoJS.SHA1(t).toString(),
  sha256: t => CryptoJS.SHA256(t).toString(),
  sha512: t => CryptoJS.SHA512(t).toString(),
}

export default function HashEncoder() {
  const [text, setText] = useState('')
  const [hashType, setHashType] = useState<HashType>('md5')
  const [result, setResult] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { showToast } = useToast()
  const { copy } = useClipboard()

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => { autoResize() }, [text, autoResize])

  useEffect(() => {
    if (!text.trim()) { setResult(''); return }
    try {
      setResult(hashFns[hashType](text.trim()))
    } catch (e) {
      showToast('Hash计算失败：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }, [text, hashType, showToast])

  const copyResult = async () => {
    if (!result) return
    const ok = await copy(result)
    if (ok) showToast('Hash值已复制到剪贴板', 'success')
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">输入文本</label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="请输入要计算Hash的文本..."
        className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
      />
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Hash算法</label>
        <select
          value={hashType}
          onChange={e => setHashType(e.target.value as HashType)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="md5">MD5</option>
          <option value="sha1">SHA-1</option>
          <option value="sha256">SHA-256</option>
          <option value="sha512">SHA-512</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setText(''); setResult('') }} className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
      </div>
      {result && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Hash结果</label>
          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-slate-100 break-all">
            {result}
          </div>
          <button onClick={copyResult} className="self-start px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">复制结果</button>
        </div>
      )}
    </div>
  )
}
