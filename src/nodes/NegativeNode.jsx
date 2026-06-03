import React from 'react'
import BaseNode, { NLabel, NBtn, NOutput, NDivider } from './BaseNode'

const ERROR_GROUPS = [
  { key: 'face',       label: '😶 Lỗi mặt' },
  { key: 'hands',      label: '✋ Lỗi tay' },
  { key: 'body',       label: '🚶 Lỗi cơ thể' },
  { key: 'outfit',     label: '👗 Lỗi trang phục' },
  { key: 'product',    label: '📦 Lỗi sản phẩm' },
  { key: 'background', label: '🏞  Lỗi bối cảnh' },
  { key: 'motion',     label: '🎬 Lỗi chuyển động' },
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function NegativeNode({ id, data }) {
  const groups = data.errorGroups || ERROR_GROUPS.map(g => g.key)

  function toggleGroup(key) {
    const next = groups.includes(key) ? groups.filter(k => k !== key) : [...groups, key]
    dispatch(id, { errorGroups: next })
  }

  function onGenerate() {
    window.dispatchEvent(new CustomEvent('node:run-to', { detail: { id } }))
  }

  const output = data.output

  return (
    <BaseNode data={data} icon="🚫" accentColor="#64748b" minWidth={290}>
      <NLabel>Nhóm lỗi cần tránh</NLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
        {ERROR_GROUPS.map(g => {
          const active = groups.includes(g.key)
          return (
            <div
              key={g.key}
              onClick={() => toggleGroup(g.key)}
              style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${active ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
                background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: active ? '#a78bfa' : '#475569',
                transition: 'all 0.15s'
              }}
            >{g.label}</div>
          )
        })}
      </div>

      <NDivider />
      <div style={{ display: 'flex', gap: 6 }}>
        <NBtn onClick={onGenerate} disabled={data.status === 'running'} variant="primary">
          {data.status === 'running' ? '⏳ Đang tạo...' : '🚫 Generate Negative'}
        </NBtn>
        {output && <NBtn onClick={() => navigator.clipboard.writeText(output.negativePrompt || '')} small>📋 Copy</NBtn>}
      </div>

      {output?.negativePrompt && (
        <NOutput label="Negative Prompt" value={output.negativePrompt.slice(0, 100) + '...'} small />
      )}
    </BaseNode>
  )
}
