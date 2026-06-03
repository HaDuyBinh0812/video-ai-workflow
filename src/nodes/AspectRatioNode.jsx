import React from 'react'
import BaseNode, { NLabel } from './BaseNode'

const RATIOS = ['9:16', '16:9', '1:1', '4:5', '21:9']

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function AspectRatioNode({ id, data }) {
  const selected = data.selectedRatio || '9:16'
  const previews = { '9:16': [36, 64], '16:9': [64, 36], '1:1': [50, 50], '4:5': [50, 62], '21:9': [64, 27] }

  return (
    <BaseNode data={data} icon="📐" accentColor="#ec4899" minWidth={240} hasInput={false}>
      <NLabel>Tỷ lệ khung hình</NLabel>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
        {RATIOS.map(r => {
          const [w, h] = previews[r] || [50, 50]
          const active = selected === r
          return (
            <div
              key={r}
              onClick={() => dispatch(id, { selectedRatio: r, status: 'ready' })}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                cursor: 'pointer', padding: '6px 8px', borderRadius: 8,
                border: `1.5px solid ${active ? '#ec4899' : 'rgba(255,255,255,0.06)'}`,
                background: active ? 'rgba(236,72,153,0.1)' : 'transparent',
                transition: 'all 0.15s'
              }}
            >
              <div style={{
                width: w * 0.4, height: h * 0.4,
                border: `1.5px solid ${active ? '#ec4899' : '#334155'}`,
                borderRadius: 2, background: active ? 'rgba(236,72,153,0.15)' : 'transparent'
              }} />
              <span style={{ fontSize: 10, color: active ? '#ec4899' : '#475569', fontWeight: active ? 600 : 400 }}>{r}</span>
            </div>
          )
        })}
      </div>
    </BaseNode>
  )
}
