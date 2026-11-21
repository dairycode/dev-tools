import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

const options = [
  { value: 'md5', label: 'MD5' },
  { value: 'sha1', label: 'SHA-1' },
  { value: 'sha256', label: 'SHA-256' },
  { value: 'sha512', label: 'SHA-512' },
] as const

function Harness({ onChange = vi.fn(), disabled = false, isEmpty = false } = {}) {
  const [value, setValue] = useState<(typeof options)[number]['value']>('md5')
  return (
    <>
      <label id="algorithm-label" htmlFor="algorithm">
        算法
      </label>
      <Select
        id="algorithm"
        value={value}
        options={isEmpty ? [] : options}
        disabled={disabled}
        onChange={(next) => {
          setValue(next)
          onChange(next)
        }}
      />
      <input aria-label="下一个输入框" />
    </>
  )
}

function setup(props = {}) {
  const view = render(<Harness {...props} />)
  return { ...view, trigger: screen.getByRole('combobox', { name: '算法' }) }
}

const key = (element: HTMLElement, value: string) => fireEvent.keyDown(element, { key: value })

describe('页面自绘下拉框', () => {
  it('没有原生 select，弹层只在打开时挂载且关联标签与选中项', () => {
    const { container, trigger } = setup()
    expect(container.querySelector('select')).toBeNull()
    expect(screen.getByLabelText('算法')).toBe(trigger)
    expect(trigger).toHaveTextContent('MD5')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('listbox').id)
    expect(trigger).toHaveAttribute('aria-activedescendant', 'algorithm-options-0')
    expect(screen.getByRole('option', { name: 'MD5' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getAllByRole('option')).toHaveLength(4)
    fireEvent.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('点击选项提交一次，关闭并把焦点交回触发器', () => {
    const onChange = vi.fn()
    const { trigger } = setup({ onChange })
    fireEvent.click(trigger)
    fireEvent.pointerDown(screen.getByRole('option', { name: 'SHA-256' }))
    fireEvent.click(screen.getByRole('option', { name: 'SHA-256' }))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('sha256')
    expect(trigger).toHaveTextContent('SHA-256')
    expect(trigger).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('option', { name: 'SHA-256' }))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('方向键只移动活动项，Enter 提交，Escape 丢弃未确认的更改', () => {
    const onChange = vi.fn()
    const { trigger } = setup({ onChange })
    trigger.focus()
    key(trigger, 'ArrowDown')
    key(trigger, 'ArrowDown')
    expect(trigger).toHaveAttribute('aria-activedescendant', 'algorithm-options-1')
    expect(onChange).not.toHaveBeenCalled()
    key(trigger, 'Enter')
    expect(trigger).toHaveTextContent('SHA-1')
    expect(onChange).toHaveBeenCalledExactlyOnceWith('sha1')
    key(trigger, 'ArrowUp')
    key(trigger, 'ArrowUp')
    key(trigger, 'Escape')
    expect(trigger).toHaveTextContent('SHA-1')
    expect(trigger).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('Home / End 跳到首尾，方向键不越界，空格确认', () => {
    const { trigger } = setup()
    key(trigger, 'End')
    key(trigger, 'ArrowDown')
    expect(trigger).toHaveAttribute('aria-activedescendant', 'algorithm-options-3')
    key(trigger, 'Home')
    key(trigger, 'ArrowUp')
    expect(trigger).toHaveAttribute('aria-activedescendant', 'algorithm-options-0')
    key(trigger, 'End')
    key(trigger, ' ')
    expect(trigger).toHaveTextContent('SHA-512')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('首字母不区分大小写，重复首字母循环定位，鼠标悬停同步活动项', () => {
    const { trigger } = setup()
    key(trigger, 's')
    expect(trigger).toHaveAttribute('aria-activedescendant', 'algorithm-options-1')
    key(trigger, 'S')
    expect(trigger).toHaveAttribute('aria-activedescendant', 'algorithm-options-2')
    key(trigger, 's')
    key(trigger, 's')
    expect(trigger).toHaveAttribute('aria-activedescendant', 'algorithm-options-1')
    key(trigger, 'z')
    expect(trigger).toHaveAttribute('aria-activedescendant', 'algorithm-options-1')
    fireEvent.mouseEnter(screen.getByRole('option', { name: 'SHA-512' }))
    expect(trigger).toHaveAttribute('aria-activedescendant', 'algorithm-options-3')
    key(trigger, 'Enter')
    expect(trigger).toHaveTextContent('SHA-512')
  })

  it('Tab 提交当前活动项但不阻止浏览器正常移动焦点', () => {
    const { trigger } = setup()
    key(trigger, ' ')
    key(trigger, 'ArrowDown')
    expect(fireEvent.keyDown(trigger, { key: 'Tab' })).toBe(true)
    expect(trigger).toHaveTextContent('SHA-1')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('点击外部或焦点移出会关闭，不修改原值', () => {
    const onChange = vi.fn()
    const { trigger } = setup({ onChange })
    fireEvent.click(trigger)
    key(trigger, 'End')
    fireEvent.pointerDown(document.body)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    fireEvent.blur(trigger, { relatedTarget: screen.getByLabelText('下一个输入框') })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('靠近底部向上展开，滚动或缩放更新位置而不取消键盘选择', () => {
    const { trigger, unmount } = setup()
    const rect = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      ...new DOMRect(0, window.innerHeight - 60, 200, 48),
      top: window.innerHeight - 60,
      bottom: window.innerHeight - 12,
    })
    fireEvent.click(trigger)
    expect(screen.getByRole('listbox')).toHaveAttribute('data-side', 'top')
    fireEvent.scroll(screen.getByRole('listbox'))
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    key(trigger, 'End')
    rect.mockReturnValue(new DOMRect(0, 20, 200, 48))
    fireEvent.scroll(window)
    expect(screen.getByRole('listbox')).toHaveAttribute('data-side', 'bottom')
    expect(trigger).toHaveAttribute('aria-activedescendant', 'algorithm-options-3')
    fireEvent.resize(window)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    key(trigger, 'Enter')
    expect(trigger).toHaveTextContent('SHA-512')
    fireEvent.click(trigger)
    unmount()
    fireEvent.pointerDown(document.body)
    fireEvent.resize(window)
    rect.mockRestore()
  })

  it.each([{ disabled: true }, { isEmpty: true }])('禁用或空选项不能打开：%o', (props) => {
    const { trigger } = setup(props)
    expect(trigger).toBeDisabled()
    fireEvent.click(trigger)
    key(trigger, 'ArrowDown')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('不拦截组合键、输入法或无关按键', () => {
    const { trigger } = setup()
    fireEvent.keyDown(trigger, { key: 'Enter', ctrlKey: true })
    fireEvent.keyDown(trigger, { key: 'Enter', metaKey: true })
    fireEvent.keyDown(trigger, { key: 'ArrowDown', altKey: true })
    fireEvent.keyDown(trigger, { key: 'Enter', isComposing: true })
    key(trigger, 'F2')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
