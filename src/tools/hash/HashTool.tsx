import { useMemo, useState } from 'react'
import { Button, TextArea, errorText, onShortcut } from '../../shared/ui/Controls'
import { Select } from '../../shared/ui/Select'
import { useClipboard } from '../../shared/hooks/useClipboard'
import { useToast } from '../../shared/ui/Toast'
import { calculateHash, type HashAlgorithm } from './model'

export default function HashTool() {
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('md5')
  const [trimInput, setTrimInput] = useState(true)
  const copy = useClipboard()
  const { notify, dismiss } = useToast()
  const result = useMemo(() => {
    if (!(trimInput ? input.trim() : input)) return { value: '', error: '' }
    try {
      return { value: calculateHash(input, algorithm, trimInput), error: '' }
    } catch (error) {
      return { value: '', error: errorText(error) }
    }
  }, [input, algorithm, trimInput])
  function confirm() {
    if (result.error) notify(result.error, 'error')
    else
      notify(
        result.value ? 'Hash 已计算完成' : '请输入要计算的文本',
        result.value ? 'success' : 'error',
      )
  }
  return (
    <div className="tool-card">
      <div className="field">
        <label htmlFor="hash-input">输入文本</label>
        <TextArea
          id="hash-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onShortcut(confirm)}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          placeholder="请输入要计算 Hash 的文本…"
        />
      </div>
      <div className="field">
        <label
          id="hash-algorithm-label"
          htmlFor="hash-algorithm"
          title="MD5 / SHA-1 仅用于兼容与校验，不适合密码存储"
        >
          选择 Hash 算法
        </label>
        <Select<HashAlgorithm>
          id="hash-algorithm"
          value={algorithm}
          onChange={setAlgorithm}
          options={[
            { value: 'md5', label: 'MD5' },
            { value: 'sha1', label: 'SHA-1' },
            { value: 'sha256', label: 'SHA-256' },
            { value: 'sha512', label: 'SHA-512' },
          ]}
        />
      </div>
      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={trimInput}
          onChange={(event) => setTrimInput(event.target.checked)}
        />
        去除首尾空白
      </label>
      <div className="action-bar">
        <Button variant="primary" onClick={confirm}>
          计算Hash
        </Button>
        <Button
          variant="clear"
          onClick={() => {
            setInput('')
            dismiss()
          }}
        >
          清空
        </Button>
      </div>
      {result.error && (
        <p role="alert" className="inline-error">
          {result.error}
        </p>
      )}
      {result.value && (
        <section className="result-panel" aria-label="Hash 结果">
          <div className="result-heading">
            <h2>Hash 结果</h2>
            <Button onClick={() => void copy(result.value)}>复制结果</Button>
          </div>
          <button
            type="button"
            className="copyable-code"
            aria-label={`点击复制 Hash 值：${result.value}`}
            onClick={() => void copy(result.value)}
          >
            <code>{result.value}</code>
          </button>
        </section>
      )}
    </div>
  )
}
