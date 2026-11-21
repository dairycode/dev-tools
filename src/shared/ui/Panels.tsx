import type { HTMLAttributes, ReactNode } from 'react'

export function ToolCard({
  as: Component = 'div',
  className = '',
  ...props
}: HTMLAttributes<HTMLElement> & { as?: 'div' | 'section' }) {
  return (
    <Component
      data-slot="tool-card"
      className={`min-w-0 rounded-2xl border border-line bg-surface p-5 shadow-[0_3px_16px_#10234204] md:p-6 ${className}`}
      {...props}
    />
  )
}

export function InlineError({
  children,
  role = 'alert',
}: {
  children: ReactNode
  role?: 'alert' | 'status'
}) {
  return (
    <p
      role={role}
      className="mt-4 rounded-lg bg-error-surface p-3 text-sm text-error-ink [overflow-wrap:anywhere]"
    >
      {children}
    </p>
  )
}

export function ResultPanel({
  title,
  label = title,
  actions,
  children,
}: {
  title: string
  label?: string
  actions: ReactNode
  children: ReactNode
}) {
  return (
    <section
      className="mt-6 overflow-hidden rounded-xl border border-line bg-panel"
      aria-label={label}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  )
}
