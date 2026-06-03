import React from 'react'
import BaseNode, { NLabel } from './BaseNode'

const DURATIONS = [
  { value: 5,  label: '5s' },
  { value: 8,  label: '8s' },
  { value: 10, label: '10s' },
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function DurationNode({ id, data }) {
  const selected = Number(data.selectedDuration) || 30

  return (
    <BaseNode data={data} icon="⏱" accentColor="#f59e0b" minWidth={240} hasInput={false}>
      <NLabel>Thời lượng video</NLabel>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
        {DURATIONS.map(d => {
          const active = selected === d.value
          return (
            <div
              key={d.value}
              onClick={() => dispatch(id, { selectedDuration: d.value, status: 'ready' })}
              style={{
                padding: '5px 11px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${active ? '#f59e0b' : 'rgba(255,255,255,0.06)'}`,
                background: active ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: active ? '#f59e0b' : '#475569',
                transition: 'all 0.15s'
              }}
            >{d.label}</div>
          )
        })}
      </div>
      <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>
        {selected}s selected
      </div>
    </BaseNode>
  )
}
