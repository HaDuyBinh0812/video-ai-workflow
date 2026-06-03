import React from 'react'
import BaseNode, { NLabel, NSelect, NBtn, NOutput, NDivider } from './BaseNode'

const PANEL_COUNTS = [4, 6, 8, 10].map(n => ({ value: n, label: `${n} panels` }))
const RATIOS = ['9:16', '16:9', '1:1', '4:5', '21:9'].map(r => ({ value: r, label: r }))

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function StoryboardNode({ id, data }) {
  function onGenerate() {
    window.dispatchEvent(new CustomEvent('node:run-to', { detail: { id } }))
  }

  const output = data.output
  const panels = output?.panels || []

  return (
    <BaseNode data={data} icon="🎬" accentColor="#f59e0b" minWidth={300}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <NLabel>Số panels</NLabel>
          <NSelect value={data.panelCount || 6} onChange={v => dispatch(id, { panelCount: Number(v) })} options={PANEL_COUNTS} />
        </div>
        <div>
          <NLabel>Tỷ lệ khung</NLabel>
          <NSelect value={data.aspectRatio || '9:16'} onChange={v => dispatch(id, { aspectRatio: v })} options={RATIOS} />
        </div>
      </div>

      <NDivider />
      <div style={{ display: 'flex', gap: 6 }}>
        <NBtn onClick={onGenerate} disabled={data.status === 'running'} variant="primary">
          {data.status === 'running' ? '⏳ Đang tạo...' : '🎬 Generate Storyboard'}
        </NBtn>
        {panels.length > 0 && (
          <NBtn onClick={() => {
            const text = panels.map(p => `Panel ${p.id}: ${p.imagePrompt}`).join('\n')
            navigator.clipboard.writeText(text)
          }} small>📋 Copy Prompts</NBtn>
        )}
      </div>

      {panels.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>{panels.length} PANELS GENERATED</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {panels.slice(0, 4).map(p => (
              <div key={p.id} style={{
                fontSize: 10, color: '#7c3aed', background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.2)', borderRadius: 4, padding: '2px 6px'
              }}>P{p.id}</div>
            ))}
            {panels.length > 4 && <div style={{ fontSize: 10, color: '#475569' }}>+{panels.length - 4}</div>}
          </div>
        </div>
      )}
    </BaseNode>
  )
}
