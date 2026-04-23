import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import UrlEncoder from './pages/UrlEncoder'
import Base64Encoder from './pages/Base64Encoder'
import HashEncoder from './pages/HashEncoder'
import TimestampConverter from './pages/TimestampConverter'
import QrCodeGenerator from './pages/QrCodeGenerator'
import JsonFormatter from './pages/JsonFormatter'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/url-encoder" replace /> },
      { path: 'url-encoder', element: <UrlEncoder /> },
      { path: 'base64', element: <Base64Encoder /> },
      { path: 'hash', element: <HashEncoder /> },
      { path: 'timestamp', element: <TimestampConverter /> },
      { path: 'qrcode', element: <QrCodeGenerator /> },
      { path: 'json', element: <JsonFormatter /> },
    ],
  },
])
