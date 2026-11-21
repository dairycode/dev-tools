import { useEffect } from 'react'
import { Link, Redirect, Route, Router, Switch, useLocation } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { tools, type ToolDefinition } from './registry'
import { ToolBoundary } from './ToolBoundary'
import { ThemeProvider } from '../shared/ui/ThemeProvider'
import { ThemeToggle } from '../shared/ui/ThemeToggle'
import { Icon } from '../shared/ui/Icon'
import { ToastProvider, useToast } from '../shared/ui/Toast'

function ToolScreen({ tool }: { tool: ToolDefinition }) {
  const Tool = tool.component
  useEffect(() => {
    document.title = `${tool.title} · 开发工具包`
  }, [tool.title])
  return (
    <section aria-labelledby="tool-title" className="tool-screen">
      <header className="tool-heading">
        <h1 id="tool-title">{tool.title}</h1>
      </header>
      <ToolBoundary key={tool.id}>
        <Tool />
      </ToolBoundary>
    </section>
  )
}

function Layout() {
  const [pathname] = useLocation()
  const { dismiss } = useToast()
  useEffect(() => {
    dismiss()
    window.scrollTo(0, 0)
  }, [pathname, dismiss])
  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        跳转到工具内容
      </a>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">
            <Icon name="code" size={26} />
          </span>
          <p className="brand-title">开发工具包</p>
        </div>
        <nav aria-label="工具导航" className="tool-nav">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/${tool.id}`}
              replace={pathname === `/${tool.id}`}
              aria-current={pathname === `/${tool.id}` ? 'page' : undefined}
              className={`nav-item ${pathname === `/${tool.id}` ? 'is-active' : ''}`}
            >
              <Icon name={tool.icon} className="nav-icon" />
              <span>{tool.title}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-actions">
            <a
              className="utility-button"
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
      <div className="main-column">
        <main id="main-content" tabIndex={-1} className="main-content">
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
        <footer className="site-footer">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
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
