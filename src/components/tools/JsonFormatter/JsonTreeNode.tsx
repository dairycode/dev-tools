import { useMemo } from 'react'

interface JsonTreeNodeProps {
  data: unknown
  keyName: string | number
  level: number
  expandedPaths: Set<string>
  parentPath?: string
  onToggle: (path: string) => void
}

export default function JsonTreeNode({ data, keyName, level, expandedPaths, parentPath = '', onToggle }: JsonTreeNodeProps) {
  const currentPath = parentPath ? `${parentPath}.${keyName}` : String(keyName)
  const isExpandable = data !== null && typeof data === 'object'
  const isArray = Array.isArray(data)
  const isExpanded = expandedPaths.has(currentPath)

  const displayKey = typeof keyName === 'number' ? `[${keyName}]` : keyName

  const displayValue = useMemo(() => {
    if (data === null) return 'null'
    if (typeof data === 'string') return `"${data}"`
    return String(data)
  }, [data])

  const valueColorClass = useMemo(() => {
    if (data === null) return 'text-slate-400'
    if (typeof data === 'string') return 'text-emerald-600 dark:text-emerald-400'
    if (typeof data === 'number') return 'text-amber-600 dark:text-amber-400'
    if (typeof data === 'boolean') return 'text-indigo-600 dark:text-indigo-400'
    return 'text-slate-500'
  }, [data])

  const preview = useMemo(() => {
    if (!isExpandable) return ''
    if (isArray) {
      const len = (data as unknown[]).length
      return len === 0 ? '' : `${len} item${len !== 1 ? 's' : ''}`
    }
    const keys = Object.keys(data as object)
    return keys.length === 0 ? '' : `${keys.length} key${keys.length !== 1 ? 's' : ''}`
  }, [data, isExpandable, isArray])

  return (
    <div className="select-none">
      <div className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: level * 20 }}>
        {isExpandable ? (
          <span onClick={() => onToggle(currentPath)} className="w-3.5 h-3.5 text-[10px] text-slate-400 hover:text-indigo-500 cursor-pointer leading-3.5 text-center inline-block">
            {isExpanded ? '▼' : '▶'}
          </span>
        ) : (
          <span className="w-3.5 h-3.5 inline-block" />
        )}
        <span className="text-indigo-600 dark:text-indigo-400 font-medium">{displayKey}</span>
        <span className="text-slate-400">:</span>
        {isExpandable ? (
          <span className="text-slate-400">
            {isArray ? '[' : '{'}
            {!isExpanded && <span className="italic text-xs opacity-70 mx-1.5">{preview}</span>}
            {!isExpanded && (isArray ? ']' : '}')}
          </span>
        ) : (
          <span className={valueColorClass}>{displayValue}</span>
        )}
      </div>
      {isExpandable && isExpanded && (
        <>
          {Object.entries(data as object).map(([k, v]) => (
            <JsonTreeNode
              key={k}
              data={v}
              keyName={isArray ? Number(k) : k}
              level={level + 1}
              expandedPaths={expandedPaths}
              parentPath={currentPath}
              onToggle={onToggle}
            />
          ))}
          <div className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: level * 20 }}>
            <span className="w-3.5 h-3.5 inline-block" />
            <span className="text-slate-400">{isArray ? ']' : '}'}</span>
          </div>
        </>
      )}
    </div>
  )
}