import { useState, useRef, useEffect, useCallback } from 'react'
import { useAutoResize } from '../hooks/useAutoResize'
import { useMessage } from '../hooks/useMessage'
import JsonTreeNode from './JsonTreeNode'
import Toast from '../components/Toast'

export default function JsonFormatter() {
  const [inputText, setInputText] = useState('')
  const [parsedJson, setParsedJson] = useState<unknown>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const { message, messageType, showMessage, clearMessage } = useMessage()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useAutoResize(inputRef, inputText)

  const expandAll = useCallback((obj: unknown, currentPath = 'root') => {
    const paths = new Set<string>()
    const collect = (o: unknown, p: string) => {
      if (o && typeof o === 'object') {
        paths.add(p)
        Object.keys(o as object).forEach(key => {
          collect((o as Record<string, unknown>)[key], `${p}.${key}`)
        })
      }
    }
    collect(obj, currentPath)
    return paths
  }, [])

  useEffect(() => {
    if (!inputText.trim()) {
      setParsedJson(null)
      return
    }
    const timer = setTimeout(() => {
      try {
        const parsed = JSON.parse(inputText)
        setParsedJson(parsed)
        setExpandedPaths(expandAll(parsed))
      } catch {
        setParsedJson(null)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [inputText, expandAll])

  const formatJson = () => {
    if (!inputText.trim()) {
      showMessage('请输入要格式化的JSON数据', 'error')
      return
    }
    try {
      const parsed = JSON.parse(inputText)
      setInputText(JSON.stringify(parsed, null, 2))
      setParsedJson(parsed)
      setExpandedPaths(expandAll(parsed))
      showMessage('JSON格式化成功！', 'success')
    } catch (error) {
      setParsedJson(null)
      showMessage('JSON格式错误：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const compressJson = () => {
    if (!inputText.trim()) {
      showMessage('请输入要压缩的JSON数据', 'error')
      return
    }
    try {
      const parsed = JSON.parse(inputText)
      setInputText(JSON.stringify(parsed))
      setParsedJson(parsed)
      setExpandedPaths(expandAll(parsed))
      showMessage('JSON压缩成功！', 'success')
    } catch (error) {
      setParsedJson(null)
      showMessage('JSON格式错误：' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    setParsedJson(null)
    setExpandedPaths(new Set())
    clearMessage()
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') formatJson()
  }

  return (
    <div className="flex flex-col gap-8 items-center pt-[10vh] min-h-full max-md:gap-6 max-md:pt-[5vh]">
      <div className="flex flex-col gap-6 w-full max-w-[800px]">
        <div>
          <label htmlFor="json-input" className="block mb-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">输入JSON</label>
          <textarea
            id="json-input"
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入要格式化的JSON数据..."
            className="w-full px-[18px] py-4 border border-gray-300 dark:border-neutral-600 rounded-lg text-[13px] font-mono bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 min-h-[120px] resize-none overflow-y-hidden leading-relaxed transition-all duration-200 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary-light max-md:min-h-[100px]"
          />
        </div>

        <div className="flex gap-3 flex-wrap max-md:flex-col">
          <button onClick={formatJson} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg max-md:flex-none">格式化</button>
          <button onClick={compressJson} className="flex-1 min-w-[110px] px-6 py-3 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-900 text-primary border border-primary hover:bg-gray-50 dark:hover:bg-neutral-800 hover:-translate-y-px max-md:flex-none">压缩</button>
          <button onClick={handleClear} className="flex-1 min-w-[110px] px-6 py-3 border-none rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 bg-danger text-white hover:bg-danger-hover hover:-translate-y-px max-md:flex-none">清空</button>
        </div>

        {parsedJson !== null && (
          <div className="w-full mt-6">
            <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg p-4 font-mono text-[13px] leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto max-md:max-h-[400px]">
              <JsonTreeNode
                data={parsedJson}
                keyName="root"
                level={0}
                expandedPaths={expandedPaths}
                onToggle={togglePath}
              />
            </div>
          </div>
        )}
      </div>
      <Toast message={message} type={messageType} />
    </div>
  )
}
