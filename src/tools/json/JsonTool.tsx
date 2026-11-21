import { useEffect, useState } from 'react'
import { ActionBar, Button, TextEditor, errorText, onShortcut } from '../../shared/ui/Controls'
import { InlineError, ToolCard } from '../../shared/ui/Panels'
import { useToast } from '../../shared/ui/Toast'
import { useClipboard } from '../../shared/hooks/useClipboard'
import { formatJson, inspectTree, parseJson } from './model'
import { JsonTree } from './JsonTreeNode'

function inspectInput(input: string) {
  try {
    const value = parseJson(input)
    return { value, inspection: inspectTree(value), error: '' }
  } catch (error) {
    return { value: null, inspection: null, error: errorText(error) }
  }
}

export default function JsonTool() {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ReturnType<typeof inspectInput> | null>(null)
  const { notify, dismiss } = useToast()
  const copy = useClipboard()
  useEffect(() => {
    if (!input.trim()) return
    // 防抖期间保留已提交的预览，避免每次按键或格式化都先卸载旧树。
    const timer = window.setTimeout(() => setParsed(inspectInput(input)), 500)
    return () => window.clearTimeout(timer)
  }, [input])
  function changeInput(value: string) {
    setInput(value)
    if (!value.trim()) setParsed(null)
  }
  function transform(indentation: 0 | 2) {
    try {
      changeInput(formatJson(input, indentation))
      notify(indentation === 2 ? 'JSON 格式化成功' : 'JSON 压缩成功')
    } catch (error) {
      notify(errorText(error), 'error')
    }
  }
  return (
    <ToolCard>
      <TextEditor
        id="json-input"
        label="输入 JSON"
        value={input}
        onChange={(event) => changeInput(event.target.value)}
        onKeyDown={onShortcut(() => transform(2))}
        aria-keyshortcuts="Control+Enter Meta+Enter"
        placeholder={'请输入 JSON，例如 {"hello": "world"}'}
      />
      <ActionBar divided>
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
            changeInput('')
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
          <JsonTree value={parsed.value} inspection={parsed.inspection} />
        ))}
    </ToolCard>
  )
}
