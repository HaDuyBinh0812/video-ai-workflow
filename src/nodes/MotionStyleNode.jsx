import React from 'react'
import BaseNode, { NLabel, NSelect } from './BaseNode'

const MOTIONS = [
  'Natural Movement', 'Slow Motion', 'Fast-forward Time-lapse',
  'Fashion Pose Change', 'Product Rotation', 'Transformation',
  'Before / After', 'Smooth Cinematic Motion', 'Floating Effect', 'Breathing Camera'
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function MotionStyleNode({ id, data }) {
  return (
    <BaseNode data={data} icon="🌊" accentColor="#6366f1" minWidth={240} hasInput={false}>
      <NLabel>Motion Style</NLabel>
      <NSelect
        value={data.selectedMotion || 'Natural Movement'}
        onChange={v => dispatch(id, { selectedMotion: v, status: 'ready' })}
        options={MOTIONS.map(m => ({ value: m, label: m }))}
      />
      <div style={{ marginTop: 6, fontSize: 11, color: '#6366f1', padding: '4px 8px', background: 'rgba(99,102,241,0.1)', borderRadius: 6, border: '1px solid rgba(99,102,241,0.2)' }}>
        🌊 {data.selectedMotion || 'Natural Movement'}
      </div>
    </BaseNode>
  )
}
