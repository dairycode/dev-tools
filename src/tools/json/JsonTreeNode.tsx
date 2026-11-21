import { useState } from 'react'
import { Button } from '../../shared/ui/Controls'
import { Icon } from '../../shared/ui/Icon'
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
    <div className="json-node">
      <div className="node-line" style={{ paddingLeft: depth * 18 }}>
        {hasChildren ? (
          <button
            type="button"
            className="tree-toggle"
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? '折叠' : '展开'} ${path || 'root'}`}
            onClick={() => toggle(path)}
          >
            <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={14} />
          </button>
        ) : (
          <span className="tree-spacer" />
        )}
        <span className="json-key">{label}</span>
        <span className="text-quiet">: </span>
        {hasChildren ? (
          <span className="text-subtle">
            {isArray ? '[' : '{'}
            <span className="node-count">
              {entries.length} {isArray ? '项' : '个键'}
            </span>
            {!isExpanded && (isArray ? ']' : '}')}
          </span>
        ) : (
          <span className={`json-value json-${value === null ? 'null' : typeof value}`}>
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
          <div className="node-line text-subtle" style={{ paddingLeft: depth * 18 + 24 }}>
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
    <section className="result-panel" aria-label="JSON 树视图">
      <div className="result-heading">
        <h2>树视图</h2>
        <div className="tree-actions">
          <Button onClick={() => setExpanded(new Set(inspection.paths))}>全部展开</Button>
          <Button onClick={() => setExpanded(new Set())}>全部折叠</Button>
        </div>
      </div>
      <div className="json-tree">
        <Node value={value} label="root" path="" depth={0} expanded={expanded} toggle={toggle} />
      </div>
    </section>
  )
}
