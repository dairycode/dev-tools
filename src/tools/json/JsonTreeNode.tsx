import { useState } from 'react'
import { Button } from '../../shared/ui/Controls'
import { Icon } from '../../shared/ui/Icon'
import { ResultPanel } from '../../shared/ui/Panels'
import { childPath, displayJsonValue, isContainer, type JsonValue, type inspectTree } from './model'

type Inspection = ReturnType<typeof inspectTree>
function Node({
  value,
  label,
  path,
  depth,
  expanded,
  toggle,
}: {
  value: JsonValue
  label: string
  path: string
  depth: number
  expanded: Set<string>
  toggle: (path: string) => void
}) {
  const hasChildren = isContainer(value)
  const isArray = Array.isArray(value)
  const isExpanded = expanded.has(path)
  const entries = hasChildren ? (Object.entries(value) as [string, JsonValue][]) : []
  return (
    <div>
      <div
        className="flex min-w-max items-center py-0.5 whitespace-pre"
        style={{ paddingLeft: depth * 18 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded text-subtle hover:bg-muted"
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? '折叠' : '展开'} ${path || 'root'}`}
            onClick={() => toggle(path)}
          >
            <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={14} />
          </button>
        ) : (
          <span className="inline-block w-6 shrink-0" />
        )}
        <span className="mr-1 text-brand">{label}</span>
        <span className="text-quiet">: </span>
        {hasChildren ? (
          <span className="text-subtle">
            {isArray ? '[' : '{'}
            <span className="px-2 text-xs text-quiet">
              {entries.length} {isArray ? '项' : '个键'}
            </span>
            {!isExpanded && (isArray ? ']' : '}')}
          </span>
        ) : (
          <span
            className={`ml-1 ${typeof value === 'string' ? 'text-json-string' : value === null || typeof value === 'boolean' ? 'text-json-literal' : 'text-ink'}`}
          >
            {displayJsonValue(value)}
          </span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <>
          {entries.map(([key, child]) => (
            <Node
              key={key}
              value={child}
              label={isArray ? `[${key}]` : JSON.stringify(key)}
              path={childPath(path, key)}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
          <div
            className="flex min-w-max items-center py-0.5 whitespace-pre text-subtle"
            style={{ paddingLeft: depth * 18 + 24 }}
          >
            {isArray ? ']' : '}'}
          </div>
        </>
      )}
    </div>
  )
}

export function JsonTree({ value, inspection }: { value: JsonValue; inspection: Inspection }) {
  const [expanded, setExpanded] = useState(
    () => new Set(inspection.count <= 200 ? inspection.paths : ['']),
  )
  function toggle(path: string) {
    setExpanded((previous) => {
      const next = new Set(previous)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }
  return (
    <ResultPanel
      title="树视图"
      label="JSON 树视图"
      actions={
        <div className="flex gap-2">
          <Button size="small" onClick={() => setExpanded(new Set(inspection.paths))}>
            全部展开
          </Button>
          <Button size="small" onClick={() => setExpanded(new Set())}>
            全部折叠
          </Button>
        </div>
      }
    >
      <div
        data-slot="json-tree"
        className="max-h-140 overflow-auto overscroll-none p-4 font-mono text-sm"
      >
        <Node value={value} label="root" path="" depth={0} expanded={expanded} toggle={toggle} />
      </div>
    </ResultPanel>
  )
}
