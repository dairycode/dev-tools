const icons = {
  code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18" />,
  link: (
    <>
      <path d="m10 13 4-4" />
      <path d="M8 16H6a4 4 0 0 1-3-7l4-4a4 4 0 0 1 6 0m-2 14a4 4 0 0 0 6 0l4-4a4 4 0 0 0-3-7h-2" />
    </>
  ),
  binary: (
    <>
      <rect x="3" y="3" width="5" height="7" rx="1" />
      <path d="M16 3h2v7m-2 0h4M4 14h2v7m-2 0h4" />
      <rect x="15" y="14" width="5" height="7" rx="1" />
    </>
  ),
  hash: <path d="M4 9h16M3 15h16M10 3 8 21M16 3l-2 18" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  'qr-code': (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <path d="M15 15h2v2h-2zm6 0v2m-6 4h2m4-2v2h-2" />
    </>
  ),
  braces: (
    <>
      <path d="M8 3H7a2 2 0 0 0-2 2v4a3 3 0 0 1-2 3 3 3 0 0 1 2 3v4a2 2 0 0 0 2 2h1m8-18h1a2 2 0 0 1 2 2v4a3 3 0 0 0 2 3 3 3 0 0 0-2 3v4a2 2 0 0 1-2 2h-1" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M20.5 13a9 9 0 1 1-9.5-9.5A7 7 0 0 0 20.5 13Z" />,
  monitor: (
    <>
      <rect x="3" y="3" width="18" height="13" rx="2" />
      <path d="M12 16v5m-4 0h8" />
    </>
  ),
  'external-link': (
    <>
      <path d="M14 3h7v7m0-7L10 14" />
      <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
    </>
  ),
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  x: <path d="m6 6 12 12M6 18 18 6" />,
} as const

export type IconName = keyof typeof icons

/** 统一的装饰图标；可访问名称由所在按钮、链接或文本提供。 */
export function Icon({
  name,
  size = 20,
  className = '',
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg
      className={`inline-block shrink-0 align-middle ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icons[name]}
    </svg>
  )
}
