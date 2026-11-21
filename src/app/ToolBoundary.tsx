import { Component, type ReactNode } from 'react'
import { Button } from '../shared/ui/Controls'
import { ToolCard } from '../shared/ui/Panels'

export class ToolBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError)
      return (
        <ToolCard role="alert">
          <h2 className="mb-5 border-b border-line pb-3 text-lg font-semibold">
            这个工具暂时无法加载
          </h2>
          <p className="mt-3 mb-5 text-sm text-subtle [overflow-wrap:anywhere]">
            其他工具仍可使用。若网站刚刚更新，请刷新后重试。
          </p>
          <Button onClick={() => window.location.reload()}>刷新重试</Button>
        </ToolCard>
      )
    return this.props.children
  }
}
