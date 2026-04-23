import { useState } from 'react'
import Layout from './components/Layout'
import UrlEncoder from './pages/UrlEncoder'
import Base64Encoder from './pages/Base64Encoder'
import HashEncoder from './pages/HashEncoder'
import TimestampConverter from './pages/TimestampConverter'
import QrCodeGenerator from './pages/QrCodeGenerator'
import JsonFormatter from './pages/JsonFormatter'

const tabComponents: Record<string, React.FC> = {
  url: UrlEncoder,
  base64: Base64Encoder,
  hash: HashEncoder,
  timestamp: TimestampConverter,
  qrcode: QrCodeGenerator,
  json: JsonFormatter,
}

export default function App() {
  const [activeTab, setActiveTab] = useState('url')
  const ActiveComponent = tabComponents[activeTab] ?? UrlEncoder

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <ActiveComponent />
    </Layout>
  )
}
