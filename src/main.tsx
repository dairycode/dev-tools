import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './styles.css'

const root = document.getElementById('app')
if (!root) throw new Error('应用挂载节点不存在')
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
