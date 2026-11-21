import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ActionBar, Button, Field, TextEditor, TextInput } from './Controls'
import { InlineError, ResultPanel, ToolCard } from './Panels'

it('共享字段保留原生标签关联、提示和输入事件', () => {
  const onChange = vi.fn()
  render(
    <Field htmlFor="example" label="测试输入" labelTitle="输入提示" className="mb-5">
      <TextInput id="example" defaultValue="原文" onChange={onChange} />
    </Field>,
  )
  const input = screen.getByLabelText('测试输入')
  expect(screen.getByText('测试输入')).toHaveAttribute('title', '输入提示')
  fireEvent.change(input, { target: { value: '新内容' } })
  expect(input).toHaveValue('新内容')
  expect(onChange).toHaveBeenCalledOnce()
})

it('编辑工作区的设置与文本各有标签，设置更新不覆盖输入或快捷键', () => {
  const onChange = vi.fn()
  const onKeyDown = vi.fn()
  render(
    <>
      <TextEditor
        id="editor"
        label="编辑文本"
        defaultValue="原文"
        onChange={onChange}
        onKeyDown={onKeyDown}
        settings={
          <Field htmlFor="mode" label="模式" inline>
            <TextInput id="mode" defaultValue="UTF-8" />
          </Field>
        }
      />
      <ActionBar divided aria-label="文本操作">
        <Button>编码</Button>
      </ActionBar>
    </>,
  )
  const editor = screen.getByLabelText('编辑文本')
  fireEvent.change(screen.getByLabelText('模式'), { target: { value: 'Latin-1' } })
  expect(editor).toHaveValue('原文')
  fireEvent.change(editor, { target: { value: '新文本' } })
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true })
  expect(onChange).toHaveBeenCalledOnce()
  expect(onKeyDown).toHaveBeenCalledOnce()
  expect(screen.getByLabelText('文本操作')).toContainElement(
    screen.getByRole('button', { name: '编码' }),
  )
})

it('按钮变体和紧凑尺寸仍透传原生行为，禁用时不触发操作', () => {
  const onClick = vi.fn()
  const view = render(
    <Button variant="primary" size="small" onClick={onClick}>
      操作
    </Button>,
  )
  const button = screen.getByRole('button', { name: '操作' })
  expect(button).toHaveAttribute('type', 'button')
  fireEvent.click(button)
  expect(onClick).toHaveBeenCalledOnce()
  view.rerender(
    <Button variant="clear" size="small" disabled onClick={onClick}>
      操作
    </Button>,
  )
  expect(button).toBeDisabled()
  fireEvent.click(button)
  expect(onClick).toHaveBeenCalledOnce()
})

it('卡片可保留具名区域，错误提示保留状态语义', () => {
  const view = render(
    <ToolCard as="section" aria-labelledby="heading">
      <h2 id="heading">转换</h2>
      <InlineError>操作失败</InlineError>
    </ToolCard>,
  )
  expect(screen.getByRole('region', { name: '转换' })).toContainElement(screen.getByRole('alert'))
  expect(screen.getByRole('alert')).toHaveTextContent('操作失败')
  view.rerender(<InlineError role="status">输入尚未有效</InlineError>)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('输入尚未有效')
})

it('结果面板保留独立名称、标题、操作和内容', () => {
  const onClick = vi.fn()
  render(
    <ResultPanel
      title="树视图"
      label="JSON 树视图"
      actions={
        <Button size="small" onClick={onClick}>
          全部展开
        </Button>
      }
    >
      <p>结果</p>
    </ResultPanel>,
  )
  const panel = screen.getByRole('region', { name: 'JSON 树视图' })
  expect(panel).toContainElement(screen.getByRole('heading', { name: '树视图' }))
  expect(panel).toHaveTextContent('结果')
  fireEvent.click(screen.getByRole('button', { name: '全部展开' }))
  expect(onClick).toHaveBeenCalledOnce()
})
