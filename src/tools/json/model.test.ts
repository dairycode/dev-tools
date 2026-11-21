import { describe, expect, it } from 'vitest'
import {
  childPath,
  displayJsonValue,
  formatJson,
  inspectTree,
  isContainer,
  parseJson,
} from './model'

describe('无损 JSON', () => {
  it.each(['null', 'false', 'true', '0', '"hello"', '[]', '{}'])('支持根节点 %s', (text) =>
    expect(formatJson(text, 0)).toBe(text),
  )
  it('格式化为 2 空格缩进', () => expect(formatJson('{"a":1}')).toBe('{\n  "a": 1\n}'))
  it('压缩时保留数字原始精度', () => {
    const input =
      '{ "id": 900719925474099312345, "decimal": 0.123456789012345678901, "exp": 1.2300e+42, "negative": -0 }'
    expect(formatJson(input, 0)).toBe(
      '{"id":900719925474099312345,"decimal":0.123456789012345678901,"exp":1.2300e+42,"negative":-0}',
    )
  })
  it('字符串里的数字和转义不被修改', () => {
    const text = JSON.stringify({ x: '123\n"中文' })
    expect(formatJson(text, 0)).toBe(text)
  })
  it.each(['', ' ', '{', '[1,]', '{"a":NaN}', 'undefined', '{"a":1}{}'])(
    '拒绝非法输入：%j',
    (text) => expect(() => parseJson(text)).toThrow(),
  )
  it('数字节点不误认为对象', () => {
    const number = parseJson('9007199254740993')
    expect(isContainer(number)).toBe(false)
    expect(displayJsonValue(number)).toBe('9007199254740993')
  })
  it.each([
    ['null', 'null'],
    ['false', 'false'],
    ['"a\\nb"', '"a\\nb"'],
  ])('显示原生值 %s', (input, expected) =>
    expect(displayJsonValue(parseJson(input))).toBe(expected),
  )
  it('对象与数组可展开', () => {
    expect(isContainer(parseJson('{}'))).toBe(true)
    expect(isContainer(parseJson('[]'))).toBe(true)
    expect(isContainer(null)).toBe(false)
  })
  it('路径避免点号、斜线、波浪号碰撞', () => {
    expect(childPath('', 'a/b~c')).toBe('/a~1b~0c')
    const result = inspectTree(parseJson('{"a.b":{},"a":{"b":{}},"a/b":{},"a~b":{}}'))
    expect(new Set(result.paths).size).toBe(result.paths.length)
    expect(result.paths).toEqual(expect.arrayContaining(['/a.b', '/a/b', '/a~1b', '/a~0b']))
  })
  it('收集所有容器路径，不收集数字包装内部属性', () => {
    const result = inspectTree(parseJson('{"x":[1,null,{"y":true}]}'))
    expect(result.isLimited).toBe(false)
    expect(result.count).toBe(6)
    expect(result.paths).toEqual(expect.arrayContaining(['', '/x', '/x/2']))
  })
  it('超大树不构建无限 DOM', () =>
    expect(
      inspectTree(parseJson(JSON.stringify(Array.from({ length: 2001 }, (_, index) => index))))
        .isLimited,
    ).toBe(true))
  it('超深树停止渲染，但仍能转换文本', () => {
    const text = '['.repeat(45) + '0' + ']'.repeat(45)
    expect(inspectTree(parseJson(text)).isLimited).toBe(true)
    expect(formatJson(text, 0)).toBe(text)
  })
  it('重复键和数字原文不丢失，树视图兼容最后一个值', () => {
    const text = '{ "a": 1, "a": 9007199254740993 }'
    expect(formatJson(text, 0)).toBe('{"a":1,"a":9007199254740993}')
    expect(formatJson(text)).toBe('{\n  "a": 1,\n  "a": 9007199254740993\n}')
    const value = parseJson(text) as Record<string, import('./model').JsonValue>
    expect(displayJsonValue(value.a!)).toBe('9007199254740993')
  })
  it('格式化保留字符串转义和指数写法', () => {
    const text = String.raw`{"x":"a\/b","n":1.2300E+99}`
    expect(formatJson(formatJson(text), 0)).toBe(text)
  })
  it('不会修改对象原型', () => {
    const result = formatJson('{"__proto__":{"polluted":true}}', 0)
    expect(result).toContain('__proto__')
    expect(Object.prototype).not.toHaveProperty('polluted')
  })
})
