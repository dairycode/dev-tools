import { Component, type ReactNode } from 'react'
import { Button } from '../shared/ui/Controls'

export class ToolBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError)
      return (
        <div className="tool-card" role="alert">
          <h2 className="section-title">这个工具暂时无法加载</h2>
          <p className="help-text mb-5">其他工具仍可使用。若网站刚刚更新，请刷新后重试。</p>
          <Button onClick={() => window.location.reload()}>刷新重试</Button>
        </div>
      )
    return this.props.children
  }
}
