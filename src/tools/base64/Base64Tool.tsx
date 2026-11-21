import { useState } from 'react'
import { TextTransformPanel } from '../../shared/ui/TextTransformPanel'
import { Select } from '../../shared/ui/Select'
import { encodeBase64, decodeBase64, type TextEncoding } from './model'

export default function Base64Tool() {
  const [encoding, setEncoding] = useState<TextEncoding>('utf8')
  return (
    <TextTransformPanel
      id="base64-input"
      actions={[
        { label: '编码', run: (text) => encodeBase64(text, encoding) },
        { label: '解码', run: (text) => decodeBase64(text, encoding) },
      ]}
      options={
        <div className="field compact-field">
          <label id="text-encoding-label" htmlFor="text-encoding">
            字符编码
          </label>
          <Select<TextEncoding>
            id="text-encoding"
            value={encoding}
            onChange={setEncoding}
            options={[
              { value: 'utf8', label: 'UTF-8' },
              { value: 'latin1', label: 'Latin-1' },
            ]}
          />
        </div>
      }
    />
  )
}
