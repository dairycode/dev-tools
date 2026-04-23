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
  const isExpanded = expandedPaths.has(currentPath)
  const isExpandable = data !== null && typeof data === 'object'
  const isArray = Array.isArray(data)

  const displayKey = typeof keyName === 'number' ? `[${keyName}]` : keyName

  const getDisplayValue = () => {
    if (data === null) return 'null'
    if (typeof data === 'string') return `"${data}"`
    return String(data)
  }

  const getValueClass = () => {
    if (data === null) return 'text-primary'
    if (typeof data === 'string') return 'text-primary'
    if (typeof data === 'number') return 'text-primary'
    if (typeof data === 'boolean') return 'text-primary'
    return ''
  }

  const getCollapsedPreview = () => {
    if (!isExpandable) return ''
    if (isArray) {
      const len = (data as unknown[]).length
      return len === 0 ? '' : `${len} item${len !== 1 ? 's' : ''}`
    }
    const keys = Object.keys(data as object)
    return keys.length === 0 ? '' : `${keys.length} key${keys.length !== 1 ? 's' : ''}`
  }

  return (
    <div className="select-none">
      <div className="flex items-center gap-1.5 py-0.5 leading-relaxed" style={{ paddingLeft: level * 20 }}>
        {isExpandable ? (
          <span
            onClick={() => onToggle(currentPath)}
            className="inline-block w-3.5 h-3.5 cursor-pointer text-gray-500 dark:text-gray-400 text-[10px] text-center leading-[14px] transition-transform duration-200 hover:text-primary"
          >
            {isExpanded ? '\u25BC' : '\u25B6'}
          </span>
        ) : (
          <span className="inline-block w-3.5 h-3.5" />
        )}

        <span className="text-primary font-medium">{displayKey}</span>
        <span className="text-gray-500 dark:text-gray-400">:</span>

        {!isExpandable ? (
          <span className={`ml-1 ${getValueClass()}`}>{getDisplayValue()}</span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            {isArray ? '[' : '{'}
            {!isExpanded && (
              <>
                <span className="italic mx-1.5 text-xs opacity-70">{getCollapsedPreview()}</span>
                {isArray ? ']' : '}'}
              </>
            )}
          </span>
        )}
      </div>

      {isExpandable && isExpanded && (
        <div>
          {(isArray ? (data as unknown[]) : Object.entries(data as object)).map((item, index) => {
            const childKey = isArray ? index : (item as [string, unknown])[0]
            const childValue = isArray ? item : (item as [string, unknown])[1]
            return (
              <JsonTreeNode
                key={childKey}
                data={childValue}
                keyName={childKey}
                level={level + 1}
                expandedPaths={expandedPaths}
                parentPath={currentPath}
                onToggle={onToggle}
              />
            )
          })}
          <div className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: level * 20 }}>
            <span className="inline-block w-3.5 h-3.5" />
            <span className="text-gray-500 dark:text-gray-400">{isArray ? ']' : '}'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
