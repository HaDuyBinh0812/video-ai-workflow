import React, { useState } from 'react'
import { NODE_LIBRARY, makeNode } from '../flow/nodes'

const GROUP_COLORS = {
  'Input': '#06b6d4',
  'AI Generation': '#7c3aed',
  'Utility': '#f59e0b',
  'Output': '#10b981',
}

export default function Sidebar({ onAddNode }) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState({})

  const filtered = search.trim()
    ? NODE_LIBRARY.map(g => ({
        ...g,
        items: g.items.filter(item =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.desc.toLowerCase().includes(search.toLowerCase())
        )
      })).filter(g => g.items.length > 0)
    : NODE_LIBRARY

  function addNode(item) {
    const offsetX = 200 + Math.random() * 100
    const offsetY = 200 + Math.random() * 100
    onAddNode(makeNode(item.type, item.label, offsetX, offsetY))
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '0 0 12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#e6eef8', marginBottom: 6 }}>Node Library</div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm node..."
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)', color: '#cbd5e1',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
            padding: '6px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Groups */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 10 }}>
        {filtered.map(group => {
          const groupColor = GROUP_COLORS[group.group] || group.color || '#7c3aed'
          const isCollapsed = collapsed[group.group]

          return (
            <div key={group.group} style={{ marginBottom: 14 }}>
              {/* Group header */}
              <div
                onClick={() => setCollapsed(c => ({ ...c, [group.group]: !c[group.group] }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                  marginBottom: isCollapsed ? 0 : 6, userSelect: 'none'
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: groupColor, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 }}>
                  {group.group}
                </span>
                <span style={{ fontSize: 10, color: '#334155', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
              </div>

              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {group.items.map(item => (
                    <div
                      key={item.type}
                      onClick={() => addNode(item)}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.setData('application/node-type', item.type)
                        e.dataTransfer.setData('application/node-label', item.label)
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '7px 9px', borderRadius: 8, cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.04)',
                        background: 'rgba(255,255,255,0.02)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `${groupColor}12`
                        e.currentTarget.style.borderColor = `${groupColor}40`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: `${groupColor}18`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 14
                      }}>{item.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>{item.label}</div>
                        <div style={{ fontSize: 10, color: '#475569', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</div>
                      </div>
                      <div style={{ fontSize: 14, color: '#334155', flexShrink: 0 }}>＋</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#334155', fontSize: 12, marginTop: 24 }}>
            Không tìm thấy node nào
          </div>
        )}
      </div>

      {/* Footer tip */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10, marginTop: 8 }}>
        <div style={{ fontSize: 10, color: '#334155', lineHeight: 1.5 }}>
          💡 Click hoặc kéo thả vào canvas<br/>
          🔗 Kéo từ handle (●) để nối dây
        </div>
      </div>
    </div>
  )
}
