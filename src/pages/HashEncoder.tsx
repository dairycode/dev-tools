import { useState, useRef, useEffect } from 'react'
import CryptoJS from 'crypto-js'
import { useAutoResize } from '../hooks/useAutoResize'
import { useMessage } from '../hooks/useMessage'
import { useClipboard } from '../hooks/useClipboard'
import type { HashType } from '../types'
import Toast from '../components/Toast'

export default function HashEncoder() {
  const [inputText, setInputText] = useState('')
  const [hashResult, setHashResult] = useState('')
  const [selectedHashType, setSelectedHashType] = useState<HashType>('md5')
  const { message, messageType, showMessage } = useMessage()
  const { copy } = useClipboard()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useAutoResize(inputRef, inputText)

  const calculateHash = (text: string, type: HashType) => {
    if (!text.trim()) {
      setHashResult('')
      return
    }
    try {
      const trimmed = text.trim()
      let result = ''
      switch (type) {
        case 'md5': result = CryptoJS.MD5(trimmed).toString(); break
        case 'sha1': result = CryptoJS.SHA1(trimmed).toString(); break
        case 'sha256': result = CryptoJS.SHA256(trimmed).toString(); break
        case 'sha512': result = CryptoJS.SHA512(trimmed).toString(); break
      }
      setHashResult(result)
    } catch (error) {
      showMessage('Hash计算失败：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  useEffect(() => {
    calculateHash(inputText, selectedHashType)
  }, [inputText, selectedHashType])

  const handleCopy = async () => {
    if (!hashResult) return
    const ok = await copy(hashResult)
    if (ok) showMessage('Hash值已复制到剪贴板！', 'success')
  }

  const handleClear = () => {
    setInputText('')
    setHashResult('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') calculateHash(inputText, selectedHashType)
  }

  return (
    <div className="flex flex-col gap-8 items-center pt-[10vh] min-h-full w-full max-w-[800px] mx-auto max-md:gap-6 max-md:pt-[5vh] max-md:px-4">
      <div className="w-full flex flex-col gap-6">
        <div>
          <label htmlFor="input-text" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">
            输入文本
          </label>
          <textarea
            id="input-text"
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入要计算Hash的文本..."
            className="w-full px-3 py-3 border-[1.5px] border-gray-300 dark:border-neutral-600 rounded-lg text-[13px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 min-h-[120px] resize-none overflow-y-hidden leading-relaxed transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light max-md:min-h-[100px]"
          />
        </div>

        <div>
          <label htmlFor="hash-type" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">
            选择Hash算法：
          </label>
          <select
            id="hash-type"
            value={selectedHashType}
            onChange={e => setSelectedHashType(e.target.value as HashType)}
            className="appearance-none cursor-pointer border-[1.5px] border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2.5 pr-9 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 shadow-sm min-w-[180px] transition-all duration-300 hover:border-primary hover:shadow-md hover:-translate-y-px focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23495057%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] bg-[length:14px]"
          >
            <option value="md5">MD5</option>
            <option value="sha1">SHA-1</option>
            <option value="sha256">SHA-256</option>
            <option value="sha512">SHA-512</option>
          </select>
        </div>

        <div className="flex gap-3 flex-wrap max-md:flex-col">
          <button onClick={() => calculateHash(inputText, selectedHashType)} className="px-5 py-2.5 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 min-w-[100px] bg-primary text-white hover:bg-primary-hover hover:-translate-y-px max-md:w-full">
            计算Hash
          </button>
          <button onClick={handleClear} className="px-5 py-2.5 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 min-w-[100px] bg-gray-500 dark:bg-gray-600 text-white hover:bg-gray-600 dark:hover:bg-gray-500 hover:-translate-y-px max-md:w-full">
            清空
          </button>
        </div>
      </div>

      {hashResult && (
        <div className="w-full flex flex-col gap-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">Hash结果：</label>
            <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg border border-gray-300 dark:border-neutral-600">
              <div className="font-mono text-sm break-all text-gray-900 dark:text-gray-100 leading-relaxed">{hashResult}</div>
            </div>
            <button onClick={handleCopy} className="mt-2 px-5 py-2.5 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 bg-success text-white hover:bg-success-hover hover:-translate-y-px">
              复制结果
            </button>
          </div>
        </div>
      )}
      <Toast message={message} type={messageType} />
    </div>
  )
}
