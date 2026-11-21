import { useMemo, useState } from 'react'
import { Button, TextArea, errorText, onShortcut } from '../../shared/ui/Controls'
import { useToast } from '../../shared/ui/Toast'
import { useClipboard } from '../../shared/hooks/useClipboard'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import { formatJson, inspectTree, parseJson } from './model'
import { JsonTree } from './JsonTreeNode'

export default function JsonTool() {
  const [input, setInput] = useState('')
  const settled = useDebouncedValue(input, 500)
  const { notify, dismiss } = useToast()
  const copy = useClipboard()
  const parsed = useMemo(() => {
    if (!settled.trim() || settled !== input) return null
    try {
      const value = parseJson(settled)
      return { value, inspection: inspectTree(value), error: '' }
    } catch (error) {
      return { value: null, inspection: null, error: errorText(error) }
    }
  }, [settled, input])
  function transform(indentation: 0 | 2) {
    try {
      setInput(formatJson(input, indentation))
      notify(indentation === 2 ? 'JSON 格式化成功' : 'JSON 压缩成功')
    } catch (error) {
      notify(errorText(error), 'error')
    }
  }
  return (
    <div className="tool-card">
      <div className="field">
        <label htmlFor="json-input">输入 JSON</label>
        <TextArea
          id="json-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onShortcut(() => transform(2))}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          placeholder={'请输入 JSON，例如 {"hello": "world"}'}
        />
      </div>
      <div className="action-bar">
        <Button variant="primary" onClick={() => transform(2)}>
          格式化
        </Button>
        <Button onClick={() => transform(0)}>压缩</Button>
        <Button disabled={!input} onClick={() => void copy(input)}>
          复制文本
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
      {parsed?.error && (
        <p className="inline-error" role="status">
          JSON 尚未有效：{parsed.error}
        </p>
      )}
      {parsed?.inspection &&
        (parsed.inspection.isLimited ? (
          <p className="notice" role="status">
            为避免页面卡顿，超大或过深数据暂不展开树视图；仍可格式化、压缩和复制。
          </p>
        ) : (
          <JsonTree key={settled} value={parsed.value} inspection={parsed.inspection} />
        ))}
    </div>
  )
}
