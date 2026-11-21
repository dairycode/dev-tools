import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from './Icon'

type SelectProps<Value extends string> = {
  id: string
  value: Value
  options: readonly { value: Value; label: string }[]
  onChange: (value: Value) => void
  disabled?: boolean
}

function getMenuPlacement(trigger: HTMLButtonElement, optionCount: number) {
  const rect = trigger.getBoundingClientRect()
  const below = window.innerHeight - rect.bottom - 12
  const above = rect.top - 12
  const isAbove = below < Math.min(256, optionCount * 44 + 12) && above > below
  return { isAbove, maxHeight: Math.max(44, Math.min(256, isAbove ? above : below)) }
}

/** 页面内的单选下拉框，焦点保留在触发器，支持方向键、首字母和取消操作。 */
export function Select<Value extends string>({
  id,
  value,
  options,
  onChange,
  disabled = false,
}: SelectProps<Value>) {
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLUListElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [placement, setPlacement] = useState({ isAbove: false, maxHeight: 256 })
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const listId = `${id}-options`

  useEffect(() => {
    if (!isOpen) return
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setIsOpen(false)
    }
    function updatePlacement(event: Event) {
      if (event.target instanceof Node && menu.current?.contains(event.target)) return
      // 键盘聚焦也会异步滚动页面，不能因此取消正在进行的选择。
      if (trigger.current) setPlacement(getMenuPlacement(trigger.current, options.length))
    }
    document.addEventListener('pointerdown', closeOutside)
    window.addEventListener('resize', updatePlacement)
    window.addEventListener('scroll', updatePlacement, true)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      window.removeEventListener('resize', updatePlacement)
      window.removeEventListener('scroll', updatePlacement, true)
    }
  }, [isOpen, options.length])

  useLayoutEffect(() => {
    if (isOpen) menu.current?.children.item(activeIndex)?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex, isOpen])

  function openMenu(index = selectedIndex) {
    if (disabled || !options.length) return
    trigger.current?.focus({ preventScroll: true })
    if (trigger.current) setPlacement(getMenuPlacement(trigger.current, options.length))
    setActiveIndex(index)
    setIsOpen(true)
  }

  function choose(index: number) {
    const option = options[index]
    if (!option) return
    setIsOpen(false)
    if (option.value !== value) onChange(option.value)
    trigger.current?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (
      disabled ||
      !options.length ||
      event.nativeEvent.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return
    const { key } = event
    if (key === 'Tab') {
      if (isOpen) choose(activeIndex)
      return
    }
    if (
      !['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'Escape'].includes(key) &&
      key.length !== 1
    )
      return
    event.preventDefault()
    event.stopPropagation()
    if (key === 'Escape') setIsOpen(false)
    else if (key === 'Enter' || key === ' ') {
      if (isOpen) choose(activeIndex)
      else openMenu()
    } else if (key === 'Home' || key === 'End') {
      const index = key === 'Home' ? 0 : options.length - 1
      if (isOpen) setActiveIndex(index)
      else openMenu(index)
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
      if (isOpen)
        setActiveIndex(
          Math.max(0, Math.min(options.length - 1, activeIndex + (key === 'ArrowDown' ? 1 : -1))),
        )
      else openMenu()
    } else {
      const start = isOpen ? activeIndex : selectedIndex
      const index = Array.from(
        { length: options.length },
        (_, offset) => (start + offset + 1) % options.length,
      ).find((index) =>
        options[index]?.label.toLocaleLowerCase().startsWith(key.toLocaleLowerCase()),
      )
      if (index !== undefined) {
        if (isOpen) setActiveIndex(index)
        else openMenu(index)
      }
    }
  }

  return (
    <div
      ref={root}
      className="select-control"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
    >
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        tabIndex={0}
        className="text-input select-trigger"
        aria-labelledby={`${id}-label`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listId : undefined}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        disabled={disabled || !options.length}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span className="select-value">{options[selectedIndex]?.label ?? ''}</span>
        <Icon name="chevron-down" size={18} className="select-chevron" />
      </button>
      {isOpen && (
        <ul
          ref={menu}
          id={listId}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="select-menu"
          data-side={placement.isAbove ? 'top' : 'bottom'}
          style={{ maxHeight: placement.maxHeight }}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              data-active={index === activeIndex}
              className="select-option"
              onMouseEnter={() => setActiveIndex(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {option.value === value && <Icon name="check" size={18} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
