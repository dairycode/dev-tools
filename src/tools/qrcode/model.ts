import QRCode from 'qrcode'

export function createQrMatrix(text: string): QRCode.QRCode {
  if (!text.trim()) throw new Error('请输入要生成二维码的内容')
  return QRCode.create(text, { errorCorrectionLevel: 'M' })
}
