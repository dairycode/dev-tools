import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ToastProvider } from '../../shared/ui/Toast'
import JsonTool from './JsonTool'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function setup() {
  render(
    <ToastProvider>
      <JsonTool />
    </ToastProvider>,
  )
  const input = screen.getByLabelText('输入 JSON')
  const change = (value: string) => fireEvent.change(input, { target: { value } })
  const settle = () => act(() => vi.advanceTimersByTime(500))
  return { input, change, settle }
}

it('连续编辑保留上一棵树，防抖后直接更新同一结果区域，过期输入不提交', () => {
  const { change, settle } = setup()
  change('{"old":1}')
  expect(screen.queryByRole('region', { name: 'JSON 树视图' })).not.toBeInTheDocument()
  settle()
  const tree = screen.getByRole('region', { name: 'JSON 树视图' })
  change('{"intermediate":2}')
  expect(tree).toBeInTheDocument()
  expect(tree).toHaveTextContent('"old"')
  act(() => vi.advanceTimersByTime(400))
  change('{"new":3}')
  act(() => vi.advanceTimersByTime(100))
  expect(tree).toHaveTextContent('"old"')
  settle()
  expect(screen.getByRole('region', { name: 'JSON 树视图' })).toBe(tree)
  expect(tree).toHaveTextContent('"new"')
  expect(tree).not.toHaveTextContent('"old"')
  expect(tree).not.toHaveTextContent('"intermediate"')
})

it('格式化和压缩不卸载树，保留已有节点的折叠与滚动状态', () => {
  const { change, settle } = setup()
  change('{"nested":{"value":1},"items":[1,2]}')
  settle()
  const tree = screen.getByRole('region', { name: 'JSON 树视图' })
  const scrollArea = tree.querySelector('[data-slot="json-tree"]')!
  scrollArea.scrollTop = 80
  fireEvent.click(screen.getByRole('button', { name: '折叠 /nested' }))
  for (const name of ['格式化', '压缩']) {
    fireEvent.click(screen.getByRole('button', { name }))
    expect(tree).toBeInTheDocument()
    settle()
    expect(screen.getByRole('region', { name: 'JSON 树视图' })).toBe(tree)
    expect(screen.getByRole('button', { name: '展开 /nested' })).toBeInTheDocument()
    expect(tree.querySelector('[data-slot="json-tree"]')).toBe(scrollArea)
    expect(scrollArea.scrollTop).toBe(80)
  }
})

it('新结构保留同路径折叠状态，新增小树默认展开，移除旧节点', () => {
  const { change, settle } = setup()
  change('{"keep":{"value":1},"removed":{"value":2}}')
  settle()
  fireEvent.click(screen.getByRole('button', { name: '折叠 /keep' }))
  change('{"keep":{"value":3},"added":{"value":4}}')
  settle()
  expect(screen.getByRole('button', { name: '展开 /keep' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '折叠 /added' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /\/removed/ })).not.toBeInTheDocument()
})

it('非法输入等待期间保留旧树，确认无效后显示错误而不冒充当前结果', () => {
  const { input, change, settle } = setup()
  change('{"valid":true}')
  settle()
  change('{bad')
  expect(screen.getByRole('region', { name: 'JSON 树视图' })).toHaveTextContent('"valid"')
  settle()
  expect(input).toHaveValue('{bad')
  expect(screen.getByRole('status')).toHaveTextContent('JSON 尚未有效')
  expect(screen.queryByRole('region', { name: 'JSON 树视图' })).not.toBeInTheDocument()
})

it.each(['', '   '])('输入清空为 %j 时立即清树，不会在新一轮输入时恢复过期结果', (value) => {
  const { change, settle } = setup()
  change('{"old":1}')
  settle()
  change(value)
  expect(screen.queryByRole('region', { name: 'JSON 树视图' })).not.toBeInTheDocument()
  change('{"new":2}')
  expect(screen.queryByRole('region', { name: 'JSON 树视图' })).not.toBeInTheDocument()
  settle()
  expect(screen.getByRole('region', { name: 'JSON 树视图' })).toHaveTextContent('"new"')
})

it('清空按钮取消待提交的旧输入，超限结果仍保留保护提示和文本操作', () => {
  const { input, change, settle } = setup()
  change('{"pending":true}')
  fireEvent.click(screen.getByRole('button', { name: '清空' }))
  settle()
  expect(input).toHaveValue('')
  expect(screen.queryByRole('region', { name: 'JSON 树视图' })).not.toBeInTheDocument()
  change(JSON.stringify(Array.from({ length: 2100 }, (_, index) => index)))
  settle()
  expect(screen.getByRole('status')).toHaveTextContent('超大或过深数据暂不展开树视图')
  expect(screen.getByRole('button', { name: '格式化' })).toBeEnabled()
  expect(screen.getByRole('button', { name: '复制文本' })).toBeEnabled()
})
