import React from 'react'
import BaseNode, { NLabel, NSelect } from './BaseNode'

const STYLES = [
  'Cinematic', 'Photorealistic', 'Korean Drama', 'Luxury Commercial',
  'TikTok Viral', 'Studio Product Ad', 'Fashion Editorial', 'Lifestyle',
  'Minimalist', 'Street Fashion', 'Cute Cartoon', '3D Animation',
  'UGC Natural', 'Documentary', 'High-end TVC'
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function StyleNode({ id, data }) {
  const style = data.selectedStyle || 'Cinematic'
  const badges = {
    'Cinematic': '#7c3aed', 'Korean Drama': '#ec4899', 'Luxury Commercial': '#f59e0b',
    'TikTok Viral': '#ef4444', 'Fashion Editorial': '#8b5cf6', 'UGC Natural': '#10b981'
  }
  const badgeColor = badges[style] || '#475569'

  return (
    <BaseNode data={data} icon="🎨" accentColor="#8b5cf6" minWidth={250} hasInput={false}>
      <NLabel>Phong cách video</NLabel>
      <NSelect
        value={style}
        onChange={v => dispatch(id, { selectedStyle: v, status: 'ready' })}
        options={STYLES.map(s => ({ value: s, label: s }))}
      />
      <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
        background: `${badgeColor}22`, border: `1px solid ${badgeColor}44`,
        borderRadius: 20, padding: '3px 10px' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: badgeColor }} />
        <span style={{ fontSize: 11, color: badgeColor, fontWeight: 600 }}>{style}</span>
      </div>
    </BaseNode>
  )
}
