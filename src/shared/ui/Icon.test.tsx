import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Icon } from './Icon'

it('图标统一画布、线宽、圆角和颜色继承，装饰图标不抢可访问名称', () => {
  const { container } = render(
    <>
      <Icon name="link" />
      <Icon name="sun" />
      <Icon name="qr-code" />
    </>,
  )
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  for (const icon of container.querySelectorAll('svg')) {
    expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
    expect(icon).toHaveAttribute('stroke-width', '2')
    expect(icon).toHaveAttribute('stroke-linecap', 'round')
    expect(icon).toHaveAttribute('stroke-linejoin', 'round')
    expect(icon).toHaveAttribute('fill', 'none')
    expect(icon).toHaveAttribute('stroke', 'currentColor')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).toHaveAttribute('focusable', 'false')
    expect(icon.childElementCount).toBeGreaterThan(0)
  }
})

it('尺寸和类名可按场景设置，不各自复制 SVG', () => {
  const { container } = render(<Icon name="chevron-down" size={18} className="select-chevron" />)
  expect(container.querySelector('svg')).toHaveClass('icon', 'select-chevron')
  expect(container.querySelector('svg')).toHaveAttribute('width', '18')
  expect(container.querySelector('svg')).toHaveAttribute('height', '18')
})
