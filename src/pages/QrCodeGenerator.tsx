import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { useAutoResize } from '../hooks/useAutoResize'
import { useMessage } from '../hooks/useMessage'
import Toast from '../components/Toast'

export default function QrCodeGenerator() {
  const [inputText, setInputText] = useState('')
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { message, messageType, showMessage, clearMessage } = useMessage()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useAutoResize(inputRef, inputText)

  const generateQR = async () => {
    if (!inputText.trim()) {
      showMessage('请输入要生成二维码的内容', 'error')
      return
    }
    setIsLoading(true)
    setQrCodeGenerated(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 0))
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      await QRCode.toCanvas(canvasRef.current, inputText, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      })
      showMessage('二维码生成成功！', 'success')
    } catch (error) {
      showMessage('二维码生成失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadQR = () => {
    if (!qrCodeGenerated || !canvasRef.current) {
      showMessage('请先生成二维码', 'error')
      return
    }
    try {
      const link = document.createElement('a')
      link.download = 'qrcode.png'
      link.href = canvasRef.current.toDataURL()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showMessage('二维码下载成功！', 'success')
    } catch (error) {
      showMessage('下载失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    setQrCodeGenerated(false)
    clearMessage()
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generateQR()
  }

  return (
    <div className="flex flex-col gap-8 items-center pt-[10vh] min-h-full max-md:gap-6 max-md:pt-[5vh]">
      <div className="flex flex-col gap-6 w-full max-w-[800px]">
        <div>
          <label htmlFor="qr-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">输入内容</label>
          <textarea
            id="qr-input"
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入要生成二维码的文本、URL等..."
            className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 min-h-[96px] resize-none overflow-y-hidden leading-relaxed transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light max-md:min-h-[72px]"
          />
        </div>

        <div className="flex gap-3 flex-wrap max-md:flex-col">
          <button onClick={generateQR} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg max-md:flex-none">生成二维码</button>
          <button onClick={downloadQR} disabled={!qrCodeGenerated} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">下载二维码</button>
          <button onClick={handleClear} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">清空</button>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-[800px]">
        <div className="text-center mt-6">
          <div className="inline-flex p-6 bg-gray-50 dark:bg-neutral-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-600 min-h-[200px] items-center justify-center max-md:min-h-[150px]">
            {isLoading && <div className="inline-block w-5 h-5 border-2 border-gray-300 dark:border-neutral-600 border-t-primary rounded-full animate-spin" />}
            <canvas ref={canvasRef} className={`max-w-[200px] h-auto ${qrCodeGenerated ? 'block' : 'hidden'}`} style={{ margin: '0 auto' }} />
            {!qrCodeGenerated && !isLoading && <p className="text-gray-500 dark:text-gray-400 m-0">二维码将在这里显示</p>}
          </div>
        </div>
      </div>
      <Toast message={message} type={messageType} />
    </div>
  )
}
