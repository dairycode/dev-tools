export function downloadImage(dataUrl: string, filename: string): void {
  if (!dataUrl.startsWith('data:image/png;base64,')) throw new Error('没有可下载的 PNG 图片')
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  try {
    link.click()
  } finally {
    link.remove()
  }
}
