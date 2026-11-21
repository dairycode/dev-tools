import {
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
} from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'clear'
}
export function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  return <button type="button" className={`btn btn-${variant} ${className}`} {...props} />
}

export function TextArea({ value, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const area = ref.current
    if (!area) return
    area.style.height = 'auto'
    area.style.height = `${Math.min(area.scrollHeight, 520)}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      className="text-input text-area"
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      {...props}
    />
  )
}

export function onShortcut(action: () => void) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === 'Enter' &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      action()
    }
  }
}

export function errorText(error: unknown): string {
  return error instanceof Error ? error.message : '操作失败，请检查输入后重试'
}
