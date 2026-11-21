import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ToolBoundary } from './ToolBoundary'

it('同步工具渲染异常仍被隔离，切换工具可恢复，导航不受影响', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  function BrokenTool(): never {
    throw new Error('模拟工具渲染失败')
  }
  try {
    const view = render(
      <>
        <nav aria-label="工具导航">导航仍可用</nav>
        <ToolBoundary key="broken">
          <BrokenTool />
        </ToolBoundary>
      </>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('这个工具暂时无法加载')
    expect(screen.getByRole('navigation')).toHaveTextContent('导航仍可用')
    view.rerender(
      <>
        <nav aria-label="工具导航">导航仍可用</nav>
        <ToolBoundary key="healthy">
          <p>正常工具内容</p>
        </ToolBoundary>
      </>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('正常工具内容')).toBeVisible()
  } finally {
    consoleError.mockRestore()
  }
})
