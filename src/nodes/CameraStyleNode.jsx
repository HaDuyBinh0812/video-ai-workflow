import React from 'react'
import BaseNode, { NLabel, NSelect } from './BaseNode'

const CAMERAS = [
  'Static Camera', 'Handheld', 'Slow Push-in', 'Cinematic Dolly',
  'Close-up', 'Medium Shot', 'Wide Shot', 'Selfie Style',
  'Mirror Selfie', 'Product Macro Shot', '360° Orbit', 'Bird Eye View'
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function CameraStyleNode({ id, data }) {
  return (
    <BaseNode data={data} icon="📷" accentColor="#0ea5e9" minWidth={240} hasInput={false}>
      <NLabel>Camera Style</NLabel>
      <NSelect
        value={data.selectedCamera || 'Cinematic Dolly'}
        onChange={v => dispatch(id, { selectedCamera: v, status: 'ready' })}
        options={CAMERAS.map(c => ({ value: c, label: c }))}
      />
      <div style={{ marginTop: 6, fontSize: 11, color: '#0ea5e9', padding: '4px 8px', background: 'rgba(14,165,233,0.1)', borderRadius: 6, border: '1px solid rgba(14,165,233,0.2)' }}>
        📷 {data.selectedCamera || 'Cinematic Dolly'}
      </div>
    </BaseNode>
  )
}
