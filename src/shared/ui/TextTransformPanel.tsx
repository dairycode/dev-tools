import { useState, type ReactNode } from 'react'
import { ActionBar, Button, TextEditor, errorText, onShortcut } from './Controls'
import { ToolCard } from './Panels'
import { useToast } from './Toast'
import { useClipboard } from '../hooks/useClipboard'

type Action = { label: string; title?: string; run: (text: string) => string }
export function TextTransformPanel({
  id,
  actions,
  options,
}: {
  id: string
  actions: readonly [Action, ...Action[]]
  options?: ReactNode
}) {
  const [input, setInput] = useState('')
  const { notify, dismiss } = useToast()
  const copy = useClipboard()
  function execute(action: Action) {
    try {
      setInput(action.run(input))
      notify(`${action.label}成功`)
    } catch (error) {
      notify(errorText(error), 'error')
    }
  }
  return (
    <ToolCard>
      <TextEditor
        id={id}
        label="输入文本"
        settings={options}
        value={input}
        placeholder="请输入要编码或解码的文本…"
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={onShortcut(() => execute(actions[0]))}
        aria-keyshortcuts="Control+Enter Meta+Enter"
      />
      <ActionBar divided>
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant={index === 0 ? 'primary' : 'secondary'}
            title={action.title}
            onClick={() => execute(action)}
          >
            {action.label}
          </Button>
        ))}
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
    </ToolCard>
  )
}
