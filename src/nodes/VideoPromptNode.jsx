import React from 'react'
import BaseNode, { NLabel, NSelect, NBtn, NOutput, NDivider } from './BaseNode'

const MODES = [
  { value: 'imageToVideo',       label: '🖼→🎬 Image to Video' },
  { value: 'storyboardToVideo',  label: '📋→🎬 Storyboard to Video' },
  { value: 'fashionLookbook',    label: '👗 Fashion Lookbook Motion' },
  { value: 'productCommercial',  label: '📦 Product Commercial' },
  { value: 'beforeAfter',        label: '🔄 Before / After' },
  { value: 'cinematic',          label: '🎥 Cinematic Motion' },
]
const CAMERA_MOVES = [
  { value: 'slow-push',   label: 'Slow Push-in' },
  { value: 'static',      label: 'Static Camera' },
  { value: 'dolly',       label: 'Cinematic Dolly' },
  { value: 'handheld',    label: 'Handheld Natural' },
  { value: 'orbit',       label: '360° Orbit' },
  { value: 'tracking',    label: 'Tracking Shot' },
]
const MOTION_STYLES = [
  { value: 'natural',    label: 'Natural Movement' },
  { value: 'slow',       label: 'Slow Motion' },
  { value: 'fast',       label: 'Fast-forward' },
  { value: 'fashion',    label: 'Fashion Pose Change' },
  { value: 'rotation',   label: 'Product Rotation' },
  { value: 'cinematic',  label: 'Smooth Cinematic' },
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function VideoPromptNode({ id, data }) {
  function onGenerate() {
    window.dispatchEvent(new CustomEvent('node:run-to', { detail: { id } }))
  }

  const output = data.output

  return (
    <BaseNode data={data} icon="🎥" accentColor="#06b6d4" minWidth={300}>
      <NLabel>Chế độ</NLabel>
      <NSelect value={data.mode || 'imageToVideo'} onChange={v => dispatch(id, { mode: v })} options={MODES} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
        <div>
          <NLabel>Camera</NLabel>
          <NSelect value={data.cameraMovement || 'slow-push'} onChange={v => dispatch(id, { cameraMovement: v })} options={CAMERA_MOVES} />
        </div>
        <div>
          <NLabel>Chuyển động</NLabel>
          <NSelect value={data.motionStyle || 'natural'} onChange={v => dispatch(id, { motionStyle: v })} options={MOTION_STYLES} />
        </div>
      </div>

      <NDivider />
      <div style={{ display: 'flex', gap: 6 }}>
        <NBtn onClick={onGenerate} disabled={data.status === 'running'} variant="primary">
          {data.status === 'running' ? '⏳ Đang tạo...' : '🎥 Create Video Prompt'}
        </NBtn>
        {output && <NBtn onClick={() => navigator.clipboard.writeText(output.videoPrompt || '')} small>📋 Copy</NBtn>}
      </div>

      {output?.videoPrompt && (
        <NOutput label="Video Prompt" value={output.videoPrompt.slice(0, 120) + '...'} small />
      )}
    </BaseNode>
  )
}
