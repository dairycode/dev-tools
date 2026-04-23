import { useState, useRef } from 'react'
import { useAutoResize } from '../hooks/useAutoResize'
import { useMessage } from '../hooks/useMessage'
import Toast from '../components/Toast'

export default function UrlEncoder() {
  const [inputText, setInputText] = useState('')
  const { message, messageType, showMessage, clearMessage } = useMessage()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useAutoResize(inputRef, inputText)

  const handleEncode = () => {
    if (!inputText.trim()) {
      showMessage('请输入要编码的文本', 'error')
      return
    }
    try {
      setInputText(encodeURIComponent(inputText))
      showMessage('URL编码成功！', 'success')
    } catch (error) {
      showMessage('编码失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const handleDecode = () => {
    if (!inputText.trim()) {
      showMessage('请输入要解码的文本', 'error')
      return
    }
    try {
      setInputText(decodeURIComponent(inputText))
      showMessage('URL解码成功！', 'success')
    } catch {
      try {
        setInputText(decodeURI(inputText))
        showMessage('URI解码成功！', 'success')
      } catch (error) {
        showMessage('解码失败：' + (error instanceof Error ? error.message : String(error)), 'error')
      }
    }
  }

  const handleEncodeURI = () => {
    if (!inputText.trim()) {
      showMessage('请输入要编码的文本', 'error')
      return
    }
    try {
      setInputText(encodeURI(inputText))
      showMessage('URI编码成功！', 'success')
    } catch (error) {
      showMessage('编码失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    clearMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleEncode()
  }

  return (
    <div className="flex flex-col gap-8 items-center pt-[10vh] min-h-full max-md:gap-6 max-md:pt-[5vh]">
      <div className="flex flex-col gap-6 w-full max-w-[800px]">
        <div className="mb-0">
          <label htmlFor="url-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">
            输入文本
          </label>
          <textarea
            id="url-input"
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入要编码或解码的文本..."
            className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[15px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 min-h-[120px] resize-none overflow-y-hidden leading-relaxed transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light max-md:min-h-[100px] max-md:px-3.5 max-md:py-3 max-md:text-sm"
          />
        </div>

        <div className="flex gap-3 flex-wrap max-md:flex-col">
          <button onClick={handleEncode} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed max-md:flex-none">
            编码
          </button>
          <button onClick={handleDecode} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">
            解码
          </button>
          <button onClick={handleEncodeURI} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">
            URI编码
          </button>
          <button onClick={handleClear} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">
            清空
          </button>
        </div>
      </div>
      <Toast message={message} type={messageType} />
    </div>
  )
}
