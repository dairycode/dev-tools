import type QRCode from 'qrcode'

export function renderQrImage(code: QRCode.QRCode): string {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器无法绘制二维码')
  const margin = 4
  const scale = Math.max(2, Math.floor(240 / (code.modules.size + margin * 2)))
  canvas.width = canvas.height = (code.modules.size + margin * 2) * scale
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#000000'
  for (let row = 0; row < code.modules.size; row++) {
    for (let column = 0; column < code.modules.size; column++) {
      if (code.modules.get(row, column)) {
        context.fillRect((column + margin) * scale, (row + margin) * scale, scale, scale)
      }
    }
  }
  return canvas.toDataURL('image/png')
}
