import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../../shared/ui/Toast'
import QrCodeTool from './QrCodeTool'
import { renderQrImage } from './render'

vi.mock('./render', () => ({ renderQrImage: vi.fn(() => 'data:image/png;base64,test') }))
afterEach(() => vi.useRealTimers())

describe('二维码异步状态', () => {
  it('只有成功后才允许下载', async () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <QrCodeTool />
      </ToastProvider>,
    )
    const download = screen.getByRole('button', { name: '下载二维码' })
    expect(download).toBeDisabled()
    fireEvent.change(screen.getByLabelText('输入内容'), {
      target: { value: 'https://example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: '生成二维码' }))
    expect(download).toBeDisabled()
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(download).toBeEnabled()
    expect(screen.getByAltText('生成的二维码')).toBeInTheDocument()
  })
  it('任务完成前改输入或清空，旧任务不得发布结果', async () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <QrCodeTool />
      </ToastProvider>,
    )
    fireEvent.change(screen.getByLabelText('输入内容'), { target: { value: 'old' } })
    fireEvent.click(screen.getByRole('button', { name: '生成二维码' }))
    fireEvent.click(screen.getByRole('button', { name: '清空' }))
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(renderQrImage).not.toHaveBeenCalled()
    expect(screen.queryByAltText('生成的二维码')).toBeNull()
    expect(screen.getByRole('button', { name: '下载二维码' })).toBeDisabled()
  })
  it('生成失败后仍不可下载', async () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <QrCodeTool />
      </ToastProvider>,
    )
    fireEvent.change(screen.getByLabelText('输入内容'), { target: { value: '中'.repeat(5000) } })
    fireEvent.click(screen.getByRole('button', { name: '生成二维码' }))
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下载二维码' })).toBeDisabled()
  })
})
