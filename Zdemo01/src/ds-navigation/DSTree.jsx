import React from 'react'

// Arbol simple con datos jerarquicos
export function DSTree({ data = [], renderLabel, checkbox = false, onCheck }) {
  return (
    <div className="ds-tree">
      {data.map((node) => (
        <TreeNode key={node.id} node={node} renderLabel={renderLabel} checkbox={checkbox} onCheck={onCheck} />
      ))}
    </div>
  )
}

function TreeNode({ node, renderLabel, checkbox, onCheck }) {
  const [open, setOpen] = React.useState(true)
  const hasChildren = node.children && node.children.length > 0
  return (
    <div className="ds-tree__node">
      <div className="ds-tree__label" onClick={() => hasChildren && setOpen((v) => !v)}>
        {hasChildren ? <span className="ds-tree__chevron">{open ? '▾' : '▸'}</span> : <span className="ds-tree__dot">•</span>}
        {checkbox ? (
          <input
            type="checkbox"
            checked={!!node.checked}
            onChange={(e) => onCheck?.(node, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
        {renderLabel ? renderLabel(node) : node.label}
      </div>
      {hasChildren && open ? (
        <div className="ds-tree__children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} renderLabel={renderLabel} checkbox={checkbox} onCheck={onCheck} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
