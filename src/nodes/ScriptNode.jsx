import React from 'react'
import BaseNode, { NLabel, NSelect, NBtn, NOutput, NDivider } from './BaseNode'

const VIDEO_STYLES = [
  { value: 'tvc',        label: '📺 TVC Quảng cáo' },
  { value: 'tiktok',     label: '📱 Viral TikTok' },
  { value: 'review',     label: '⭐ Review sản phẩm' },
  { value: 'fashion',    label: '👗 Fashion Lookbook' },
  { value: 'emotional',  label: '❤️  Kể chuyện cảm xúc' },
  { value: 'luxury',     label: '💎 Sang trọng cao cấp' },
  { value: 'beforeafter',label: '🔄 Before / After' },
  { value: 'tutorial',   label: '📖 Hướng dẫn sử dụng' },
  { value: 'ugc',        label: '🎥 UGC tự nhiên' },
  { value: 'drama',      label: '🎭 Drama ngắn' },
]
const SCENE_COUNTS = [3, 4, 6, 8, 10].map(n => ({ value: n, label: `${n} cảnh` }))
const DURATIONS = [
  { value: 8,  label: '8 giây' },
  { value: 10, label: '10 giây' },
  { value: 15, label: '15 giây' },
  { value: 30, label: '30 giây' },
  { value: 60, label: '60 giây' },
]
const LANGUAGES = [
  { value: 'vietnamese', label: '🇻🇳 Tiếng Việt' },
  { value: 'english',    label: '🇺🇸 Tiếng Anh' },
  { value: 'bilingual',  label: '🌐 Song ngữ Việt-Anh' },
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function ScriptNode({ id, data }) {
  function onGenerate() {
    window.dispatchEvent(new CustomEvent('node:run-to', { detail: { id } }))
  }

  const output = data.output
  const toggle = (key) => dispatch(id, { [key]: !data[key] })

  return (
    <BaseNode data={data} icon="📝" accentColor="#7c3aed" minWidth={310}>
      <NLabel>Phong cách video</NLabel>
      <NSelect value={data.videoStyle || 'tvc'} onChange={v => dispatch(id, { videoStyle: v })} options={VIDEO_STYLES} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
        <div>
          <NLabel>Số cảnh</NLabel>
          <NSelect value={data.sceneCount || 6} onChange={v => dispatch(id, { sceneCount: Number(v) })} options={SCENE_COUNTS} />
        </div>
        <div>
          <NLabel>Thời lượng</NLabel>
          <NSelect value={data.duration || 30} onChange={v => dispatch(id, { duration: Number(v) })} options={DURATIONS} />
        </div>
      </div>

      <div style={{ marginTop: 6 }}>
        <NLabel>Ngôn ngữ kịch bản</NLabel>
        <NSelect value={data.language || 'vietnamese'} onChange={v => dispatch(id, { language: v })} options={LANGUAGES} />
      </div>

      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          onClick={() => toggle('includeDialogue')}
          style={{
            width: 32, height: 18, borderRadius: 9,
            background: data.includeDialogue !== false ? '#7c3aed' : '#1e293b',
            position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
          }}
        >
          <div style={{
            width: 14, height: 14, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 2,
            left: data.includeDialogue !== false ? 15 : 2,
            transition: 'left 0.2s'
          }} />
        </div>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Có lời thoại / voiceover</span>
      </div>

      <NDivider />
      <div style={{ display: 'flex', gap: 6 }}>
        <NBtn onClick={onGenerate} disabled={data.status === 'running'} variant="primary">
          {data.status === 'running' ? '⏳ Đang tạo...' : '📝 Generate Script'}
        </NBtn>
        {output && (
          <NBtn onClick={() => navigator.clipboard.writeText(JSON.stringify(output, null, 2))} small>
            📋 Copy
          </NBtn>
        )}
      </div>

      {output?.title && (
        <NOutput label="Kịch bản" value={`"${output.title}"\n${output.hook}\n→ ${output.scenes?.length || 0} cảnh | CTA: ${output.cta || ''}`} small />
      )}
    </BaseNode>
  )
}
