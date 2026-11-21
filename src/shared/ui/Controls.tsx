import {
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'

const buttonVariants = {
  primary:
    'border-action bg-action text-white enabled:hover:border-action-hover enabled:hover:bg-action-hover enabled:hover:text-white',
  secondary:
    'border-line bg-surface text-subtle enabled:hover:border-brand enabled:hover:bg-panel enabled:hover:text-ink',
  clear:
    'border-line bg-surface text-danger sm:ml-auto enabled:hover:border-brand enabled:hover:bg-panel enabled:hover:text-ink',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants
  size?: 'default' | 'small'
}
export function Button({
  variant = 'secondary',
  size = 'default',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg border font-medium transition-[background-color,border-color] duration-150 ${size === 'small' ? 'min-h-9 px-3 py-1.5 text-xs' : 'min-h-11 px-5 py-2.5 text-sm'} ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  )
}

export const utilityActionClassName =
  'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-line px-2 py-2.5 text-xs font-medium text-subtle no-underline hover:bg-panel'

export const textInputClassName =
  'min-w-0 w-full rounded-xl border border-line bg-panel px-4 py-3 text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-quiet placeholder:opacity-85 focus:border-brand focus:shadow-[0_0_0_3px_var(--color-focus)] focus:outline-none'

export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`block min-h-12 max-md:text-[16px] ${textInputClassName} ${className}`}
      {...props}
    />
  )
}

export function Field({
  htmlFor,
  label,
  labelTitle,
  inline = false,
  className = '',
  children,
}: {
  htmlFor: string
  label: string
  labelTitle?: string
  inline?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`min-w-0 ${inline ? 'flex items-center gap-3' : ''} ${className}`}>
      <label
        id={`${htmlFor}-label`}
        htmlFor={htmlFor}
        title={labelTitle}
        className={`block text-sm font-semibold text-subtle ${inline ? 'shrink-0' : 'mb-2'}`}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

export function ActionBar({
  divided = false,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { divided?: boolean }) {
  return (
    <div
      data-slot="action-bar"
      className={`grid grid-cols-2 gap-3 sm:flex sm:flex-wrap ${divided ? 'mt-5 border-t border-line pt-5' : ''} ${className}`}
      {...props}
    />
  )
}

export function TextEditor({
  id,
  label,
  settings,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string
  label: string
  settings?: ReactNode
}) {
  return (
    <div className="min-w-0">
      <div
        data-slot="editor-toolbar"
        className="mb-4 flex min-h-12.5 flex-wrap items-center justify-between gap-x-4 gap-y-3"
      >
        <label htmlFor={id} className="text-sm font-semibold text-subtle">
          {label}
        </label>
        {settings}
      </div>
      <TextArea id={id} {...props} />
    </div>
  )
}

export function TextArea({
  value,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
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
      className={`block min-h-[clamp(128px,24dvh,180px)] max-h-[70dvh] resize-y overflow-y-auto overscroll-none font-mono text-sm leading-[1.8] [tab-size:2] md:min-h-[clamp(180px,30dvh,256px)] ${textInputClassName} ${className}`}
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
