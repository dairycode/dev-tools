import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'

function Placeholder({ name }: { name: string }) {
  return <div className="text-lg">{name} - Coming Soon</div>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/url-encoder" replace /> },
      { path: 'url-encoder', element: <Placeholder name="URL编码/解码" /> },
      { path: 'base64', element: <Placeholder name="Base64编码/解码" /> },
      { path: 'hash', element: <Placeholder name="Hash编码" /> },
      { path: 'timestamp', element: <Placeholder name="时间戳转换" /> },
      { path: 'qrcode', element: <Placeholder name="二维码生成" /> },
      { path: 'json', element: <Placeholder name="JSON格式化" /> },
    ],
  },
])
