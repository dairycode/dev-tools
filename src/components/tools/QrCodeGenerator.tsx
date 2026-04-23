import { useState, useRef, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'
import { useToast } from '../../context/ToastContext'

export default function QrCodeGenerator() {
  const [text, setText] = useState('')
  const [hasQr, setHasQr] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { showToast } = useToast()

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => { autoResize() }, [text, autoResize])

  const generate = async () => {
    if (!text.trim()) return showToast('请输入要生成二维码的内容', 'error')
    try {
      setHasQr(true)
      await new Promise(r => setTimeout(r, 0))
      if (!canvasRef.current) return
      await QRCode.toCanvas(canvasRef.current, text, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      })
      showToast('二维码生成成功', 'success')
    } catch (e) {
      showToast('二维码生成失败：' + (e instanceof Error ? e.message : String(e)), 'error')
    }
  }

  const download = () => {
    if (!canvasRef.current || !hasQr) return showToast('请先生成二维码', 'error')
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvasRef.current.toDataURL()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('二维码下载成功', 'success')
  }

  const clear = () => {
    setText('')
    setHasQr(false)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate()
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">输入内容</label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入要生成二维码的文本、URL等..."
        className="w-full min-h-[96px] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
      />
      <div className="flex gap-2 flex-wrap">
        <button onClick={generate} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">生成二维码</button>
        <button onClick={download} disabled={!hasQr} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">下载二维码</button>
        <button onClick={clear} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">清空</button>
      </div>
      <div className="flex justify-center">
        <div className="inline-flex items-center justify-center p-6 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-[200px]">
          {hasQr ? (
            <canvas ref={canvasRef} />
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500">二维码将在这里显示</p>
          )}
        </div>
      </div>
    </div>
  )
}
