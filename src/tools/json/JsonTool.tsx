import { useMemo, useState } from 'react'
import { ActionBar, Button, Field, TextArea, errorText, onShortcut } from '../../shared/ui/Controls'
import { InlineError, ToolCard } from '../../shared/ui/Panels'
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
    <ToolCard>
      <Field htmlFor="json-input" label="输入 JSON" className="mb-5">
        <TextArea
          id="json-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onShortcut(() => transform(2))}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          placeholder={'请输入 JSON，例如 {"hello": "world"}'}
        />
      </Field>
      <ActionBar className="mb-5 last:mb-0">
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
      </ActionBar>
      {parsed?.error && <InlineError role="status">JSON 尚未有效：{parsed.error}</InlineError>}
      {parsed?.inspection &&
        (parsed.inspection.isLimited ? (
          <p
            className="mt-5 rounded-lg border border-line bg-panel p-4 text-sm text-subtle"
            role="status"
          >
            为避免页面卡顿，超大或过深数据暂不展开树视图；仍可格式化、压缩和复制。
          </p>
        ) : (
          <JsonTree key={settled} value={parsed.value} inspection={parsed.inspection} />
        ))}
    </ToolCard>
  )
}
