import React, { useState } from 'react'
import { EdgeLabelRenderer, getBezierPath, useReactFlow } from 'reactflow'

export default function DeletableEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, style = {}, markerEnd,
}) {
  const { setEdges } = useReactFlow()
  const [hovered, setHovered] = useState(false)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={style}
        markerEnd={markerEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {/* Wide transparent hitbox for easier hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <EdgeLabelRenderer>
        {hovered && (
          <button
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              background: '#1a2538',
              border: '1px solid rgba(239,68,68,0.5)',
              color: '#ef4444',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: 14,
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              zIndex: 10,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { setHovered(true); e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
            onMouseLeave={e => { setHovered(false); e.currentTarget.style.background = '#1a2538' }}
            onClick={() => setEdges(es => es.filter(e => e.id !== id))}
            title="Xóa kết nối (hoặc chọn + Delete)"
          >
            ×
          </button>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
