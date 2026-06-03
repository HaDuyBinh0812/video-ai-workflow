import React, { useState, useRef } from 'react'
import BaseNode, { NLabel, NSelect, NBtn, NOutput, NDivider } from './BaseNode'
import { analyzeImage, analyzeImageMock } from '../api/ggStudio'

const IMAGE_TYPES = [
  { value: 'character', label: '👤 Nhân vật' },
  { value: 'product',   label: '📦 Sản phẩm' },
  { value: 'background',label: '🏞  Bối cảnh' },
  { value: 'outfit',    label: '👗 Trang phục' },
  { value: 'logo',      label: '🏷  Logo / Thương hiệu' },
  { value: 'storyboard',label: '🎬 Storyboard' },
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function ImageNode({ id, data }) {
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  function onFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      const base64 = dataUrl.split(',')[1]
      dispatch(id, { imageBase64: base64, imageMimeType: file.type, imagePreview: dataUrl, status: 'ready' })
    }
    reader.readAsDataURL(file)
  }

  async function onAnalyze() {
    setLoading(true)
    dispatch(id, { status: 'running' })
    try {
      const fn = data.imageBase64 ? analyzeImage : analyzeImageMock
      const res = data.imageBase64
        ? await analyzeImage(data.imageBase64, data.imageMimeType || 'image/jpeg')
        : await analyzeImageMock()
      dispatch(id, { analysis: res, status: 'success', output: res })
    } catch {
      dispatch(id, { status: 'error' })
    }
    setLoading(false)
  }

  return (
    <BaseNode data={data} icon="🖼" accentColor="#7c3aed" minWidth={280}>
      <NLabel>Loại hình ảnh</NLabel>
      <NSelect
        value={data.imageType || 'character'}
        onChange={v => dispatch(id, { imageType: v })}
        options={IMAGE_TYPES}
      />

      {/* Image preview */}
      {data.imagePreview ? (
        <div style={{ marginTop: 8, position: 'relative' }}>
          <img src={data.imagePreview} alt="preview" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
          <button
            onClick={() => dispatch(id, { imagePreview: null, imageBase64: null, analysis: null, status: 'idle' })}
            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 4, color: '#fff', fontSize: 10, padding: '2px 6px', cursor: 'pointer' }}
          >✕</button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            marginTop: 8, border: '1.5px dashed rgba(255,255,255,0.12)', borderRadius: 8,
            padding: '18px 0', textAlign: 'center', cursor: 'pointer', color: '#475569', fontSize: 12,
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>📂</div>
          <div>Click để upload ảnh</div>
          <div style={{ fontSize: 10, marginTop: 2, color: '#334155' }}>JPG, PNG, WEBP</div>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />

      <NDivider />
      <div style={{ display: 'flex', gap: 6 }}>
        <NBtn onClick={() => fileRef.current?.click()} small>📂 Upload</NBtn>
        <NBtn onClick={onAnalyze} disabled={loading} variant="primary" small>
          {loading ? '⏳ Phân tích...' : '🔍 Analyze'}
        </NBtn>
      </div>

      {data.analysis?.description && (
        <NOutput label="Phân tích AI" value={data.analysis.description} small />
      )}
    </BaseNode>
  )
}
