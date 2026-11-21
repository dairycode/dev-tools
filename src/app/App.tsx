import { useEffect, useRef } from 'react'
import { Link, Redirect, Route, Router, Switch, useLocation } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { tools, type ToolDefinition } from './registry'
import { ToolBoundary } from './ToolBoundary'
import { ThemeProvider } from '../shared/ui/ThemeProvider'
import { ThemeToggle } from '../shared/ui/ThemeToggle'
import { Icon } from '../shared/ui/Icon'
import { utilityActionClassName } from '../shared/ui/Controls'
import { ToastProvider, useToast } from '../shared/ui/Toast'

function ToolScreen({ tool }: { tool: ToolDefinition }) {
  const Tool = tool.component
  useEffect(() => {
    document.title = `${tool.title} · 开发工具包`
  }, [tool.title])
  return (
    <section aria-labelledby="tool-title" className="mx-auto w-full max-w-240">
      <header className="mb-6">
        <h1 id="tool-title" className="text-2xl font-bold tracking-tight md:text-3xl">
          {tool.title}
        </h1>
      </header>
      <ToolBoundary key={tool.id}>
        <Tool />
      </ToolBoundary>
    </section>
  )
}

function revealNavigationLink(navigation: HTMLElement, link: HTMLElement) {
  if (navigation.scrollWidth <= navigation.clientWidth) return
  const navigationBounds = navigation.getBoundingClientRect()
  const linkBounds = link.getBoundingClientRect()
  const leftOverflow = linkBounds.left - navigationBounds.left - 12
  const rightOverflow = linkBounds.right - navigationBounds.right + 12
  if (leftOverflow < 0) navigation.scrollLeft += leftOverflow
  else if (rightOverflow > 0) navigation.scrollLeft += rightOverflow
}

function Layout() {
  const [pathname] = useLocation()
  const { dismiss } = useToast()
  const navigationRef = useRef<HTMLElement>(null)
  useEffect(() => {
    dismiss()
    window.scrollTo(0, 0)
    const navigation = navigationRef.current
    const activeLink = navigation?.querySelector<HTMLElement>('[aria-current="page"]')
    if (navigation && activeLink) revealNavigationLink(navigation, activeLink)
  }, [pathname, dismiss])
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[264px_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="fixed -top-25 left-4 z-50 rounded-lg bg-surface px-4 py-3 text-brand shadow-lg focus:top-3"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        跳转到工具内容
      </a>
      <aside className="flex flex-col border-b border-line bg-surface md:sticky md:top-0 md:h-dvh md:overflow-y-auto md:overscroll-none md:border-r md:border-b-0">
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 md:px-6 md:pt-7 md:pb-6">
          <img
            src={`${import.meta.env.BASE_URL}favicon.png`}
            alt=""
            aria-hidden="true"
            width={48}
            height={48}
            className="size-10 shrink-0 md:size-12"
          />
          <p className="text-lg font-bold tracking-wide">开发工具包</p>
        </div>
        <nav
          ref={navigationRef}
          aria-label="工具导航"
          onFocus={(event) => {
            const link = event.target.closest<HTMLElement>('a')
            if (link) revealNavigationLink(event.currentTarget, link)
          }}
          className="flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto overscroll-none px-3 py-2 [scrollbar-width:none] md:flex-col md:gap-2 md:overflow-x-visible md:px-4 md:py-3"
        >
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/${tool.id}`}
              replace={pathname === `/${tool.id}`}
              aria-current={pathname === `/${tool.id}` ? 'page' : undefined}
              className={`flex min-h-11.5 shrink-0 items-center justify-center gap-[5px] rounded-xl p-2 text-[12px] font-medium whitespace-nowrap no-underline transition-colors md:justify-start md:gap-2.5 md:px-3 md:py-3 md:text-[14px] ${pathname === `/${tool.id}` ? 'bg-active text-brand' : 'text-subtle hover:bg-panel hover:text-ink'}`}
            >
              <Icon name={tool.icon} className="size-4.5 md:size-5" />
              <span>{tool.title}</span>
            </Link>
          ))}
        </nav>
        <div className="px-4 pt-1 pb-3 md:mt-auto md:pt-3 md:pb-4">
          <div className="flex gap-2">
            <a
              className={utilityActionClassName}
              href="https://github.com/dairycode/dev-tools"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
              <Icon name="external-link" size={16} />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-5 pt-6 pb-6 outline-none md:px-8 md:pt-[clamp(32px,calc(20dvh-96px),96px)]"
        >
          <Switch>
            <Route path="/">
              <Redirect to="/url" replace />
            </Route>
            {tools.map((tool) => (
              <Route key={tool.id} path={`/${tool.id}`}>
                <ToolScreen key={tool.id} tool={tool} />
              </Route>
            ))}
            <Route>
              <Redirect to="/url" replace />
            </Route>
          </Switch>
        </main>
        <footer className="flex items-center justify-center px-5 py-3 text-xs text-quiet">
          <a
            className="hover:text-brand"
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            沪ICP备2026013272号-1
          </a>
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <Router hook={useHashLocation}>
          <Layout />
        </Router>
      </ThemeProvider>
    </ToastProvider>
  )
}
