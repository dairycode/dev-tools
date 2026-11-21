import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from './Toast'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import UrlTool from '../../tools/url/UrlTool'

afterEach(() => vi.useRealTimers())

describe('文本工具交互', () => {
  it('快捷键转换、失败保留输入、清空状态', () => {
    render(
      <ToastProvider>
        <UrlTool />
      </ToastProvider>,
    )
    const input = screen.getByLabelText('输入文本')
    fireEvent.change(input, { target: { value: '你好 world' } })
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })
    expect(input).toHaveValue('%E4%BD%A0%E5%A5%BD%20world')
    fireEvent.click(screen.getByRole('button', { name: '解码' }))
    expect(input).toHaveValue('你好 world')
    fireEvent.change(input, { target: { value: '%ZZ' } })
    fireEvent.click(screen.getByRole('button', { name: '解码' }))
    expect(input).toHaveValue('%ZZ')
    expect(screen.getByRole('alert')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '清空' }))
    expect(input).toHaveValue('')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
  it('卸载时清理消息计时器', () => {
    vi.useFakeTimers()
    const view = render(
      <ToastProvider>
        <UrlTool />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: '编码' }))
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('防抖只提交最后值并在卸载时取消', () => {
    vi.useFakeTimers()
    const view = renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: 'a' },
    })
    view.rerender({ value: 'b' })
    view.rerender({ value: 'c' })
    expect(view.result.current).toBe('a')
    act(() => vi.advanceTimersByTime(500))
    expect(view.result.current).toBe('c')
    view.rerender({ value: 'd' })
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
