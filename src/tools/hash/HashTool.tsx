import { useMemo, useState } from 'react'
import {
  ActionBar,
  Button,
  Field,
  TextEditor,
  errorText,
  onShortcut,
} from '../../shared/ui/Controls'
import { InlineError, ResultPanel, ToolCard } from '../../shared/ui/Panels'
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
    <ToolCard>
      <TextEditor
        id="hash-input"
        label="输入文本"
        settings={
          <Field
            htmlFor="hash-algorithm"
            label="选择 Hash 算法"
            inline
            labelTitle="MD5 / SHA-1 仅用于兼容与校验，不适合密码存储"
            className="w-64"
          >
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
          </Field>
        }
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={onShortcut(confirm)}
        aria-keyshortcuts="Control+Enter Meta+Enter"
        placeholder="请输入要计算 Hash 的文本…"
      />
      <label className="mt-4 flex items-start gap-2 text-sm text-subtle">
        <input
          className="mt-1 size-4 shrink-0 accent-brand"
          type="checkbox"
          checked={trimInput}
          onChange={(event) => setTrimInput(event.target.checked)}
        />
        去除首尾空白
      </label>
      <ActionBar divided>
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
      </ActionBar>
      {result.error && <InlineError>{result.error}</InlineError>}
      {result.value && (
        <ResultPanel
          title="Hash 结果"
          actions={
            <Button size="small" onClick={() => void copy(result.value)}>
              复制结果
            </Button>
          }
        >
          <button
            type="button"
            className="block w-full p-4 text-left font-mono text-sm break-all text-brand [overflow-wrap:anywhere]"
            aria-label={`点击复制 Hash 值：${result.value}`}
            onClick={() => void copy(result.value)}
          >
            <code>{result.value}</code>
          </button>
        </ResultPanel>
      )}
    </ToolCard>
  )
}
