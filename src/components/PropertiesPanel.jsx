import React, { useState, useEffect } from 'react'

const STATUS_LABELS = {
  idle: { color: '#475569', label: 'Idle' },
  ready: { color: '#3b82f6', label: 'Ready' },
  running: { color: '#f59e0b', label: 'Running' },
  success: { color: '#10b981', label: 'Done' },
  error: { color: '#ef4444', label: 'Error' },
  warning: { color: '#f97316', label: 'Warning' },
}

function Btn({ onClick, children, variant = 'default', disabled }) {
  const styles = {
    default: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' },
    primary: { background: 'linear-gradient(90deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none' },
    danger:  { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' },
    success: { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], borderRadius: 7, padding: '5px 10px', fontSize: 11,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      transition: 'opacity 0.2s'
    }}>{children}</button>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: '#475569', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      {children}
    </div>
  )
}

function InputF({ value, onChange, placeholder }) {
  return (
    <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: '#0b1220', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '5px 8px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
  )
}

function SelectF({ value, onChange, options }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', background: '#0b1220', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '5px 8px', fontSize: 12, outline: 'none' }}>
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  )
}

function TextareaF({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: '100%', background: '#0b1220', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '5px 8px', fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
  )
}

// Node-specific extra config fields
function NodeSpecificConfig({ node, local, setLocal }) {
  const type = node.type

  if (type === 'scriptNode') return (
    <>
      <Field label="Phong cách video">
        <SelectF value={local.videoStyle} onChange={v => setLocal(l => ({ ...l, videoStyle: v }))}
          options={[
            { value: 'tvc', label: 'TVC Quảng cáo' }, { value: 'tiktok', label: 'Viral TikTok' },
            { value: 'review', label: 'Review sản phẩm' }, { value: 'fashion', label: 'Fashion Lookbook' },
            { value: 'luxury', label: 'Sang trọng cao cấp' }, { value: 'beforeafter', label: 'Before/After' },
          ]} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field label="Số cảnh">
          <SelectF value={local.sceneCount} onChange={v => setLocal(l => ({ ...l, sceneCount: Number(v) }))}
            options={[3,4,6,8,10].map(n => ({ value: n, label: `${n} cảnh` }))} />
        </Field>
        <Field label="Thời lượng">
          <SelectF value={local.duration} onChange={v => setLocal(l => ({ ...l, duration: Number(v) }))}
            options={[8,10,15,30,60].map(n => ({ value: n, label: `${n}s` }))} />
        </Field>
      </div>
      <Field label="Ngôn ngữ">
        <SelectF value={local.language} onChange={v => setLocal(l => ({ ...l, language: v }))}
          options={[{ value: 'vietnamese', label: '🇻🇳 Tiếng Việt' }, { value: 'english', label: '🇺🇸 English' }, { value: 'bilingual', label: '🌐 Song ngữ' }]} />
      </Field>
    </>
  )

  if (type === 'promptNode') return (
    <>
      <Field label="Loại prompt">
        <SelectF value={local.promptType} onChange={v => setLocal(l => ({ ...l, promptType: v }))}
          options={[
            { value: 'image', label: '🖼 Prompt tạo ảnh' }, { value: 'video', label: '🎬 Prompt video' },
            { value: 'product', label: '📦 Prompt sản phẩm' }, { value: 'fashion', label: '👗 Prompt thời trang' },
          ]} />
      </Field>
      <Field label="Mức độ chi tiết">
        <SelectF value={local.detailLevel} onChange={v => setLocal(l => ({ ...l, detailLevel: v }))}
          options={[{ value: 'short', label: 'Ngắn' }, { value: 'medium', label: 'Trung bình' }, { value: 'detailed', label: 'Chi tiết' }, { value: 'ultra', label: 'Siêu chi tiết' }]} />
      </Field>
      <Field label="Yêu cầu bổ sung">
        <TextareaF value={local.additionalRequirements} onChange={v => setLocal(l => ({ ...l, additionalRequirements: v }))} placeholder="Thêm yêu cầu..." rows={2} />
      </Field>
    </>
  )

  if (type === 'storyboardNode') return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field label="Số panels">
          <SelectF value={local.panelCount} onChange={v => setLocal(l => ({ ...l, panelCount: Number(v) }))}
            options={[4,6,8,10].map(n => ({ value: n, label: `${n} panels` }))} />
        </Field>
        <Field label="Tỷ lệ">
          <SelectF value={local.aspectRatio} onChange={v => setLocal(l => ({ ...l, aspectRatio: v }))}
            options={['9:16','16:9','1:1','4:5'].map(r => ({ value: r, label: r }))} />
        </Field>
      </div>
    </>
  )

  if (type === 'videoPromptNode') return (
    <>
      <Field label="Chế độ">
        <SelectF value={local.mode} onChange={v => setLocal(l => ({ ...l, mode: v }))}
          options={[
            { value: 'imageToVideo', label: '🖼→🎬 Image to Video' },
            { value: 'fashionLookbook', label: '👗 Fashion Lookbook' },
            { value: 'productCommercial', label: '📦 Product Commercial' },
            { value: 'beforeAfter', label: '🔄 Before/After' },
          ]} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field label="Camera">
          <SelectF value={local.cameraMovement} onChange={v => setLocal(l => ({ ...l, cameraMovement: v }))}
            options={['slow-push','static','dolly','handheld','orbit'].map(c => ({ value: c, label: c }))} />
        </Field>
        <Field label="Motion">
          <SelectF value={local.motionStyle} onChange={v => setLocal(l => ({ ...l, motionStyle: v }))}
            options={['natural','slow','fast','fashion','cinematic'].map(m => ({ value: m, label: m }))} />
        </Field>
      </div>
    </>
  )

  if (type === 'imageNode') return (
    <Field label="Loại hình ảnh">
      <SelectF value={local.imageType} onChange={v => setLocal(l => ({ ...l, imageType: v }))}
        options={[
          { value: 'character', label: '👤 Nhân vật' }, { value: 'product', label: '📦 Sản phẩm' },
          { value: 'background', label: '🏞 Bối cảnh' }, { value: 'outfit', label: '👗 Trang phục' },
          { value: 'logo', label: '🏷 Logo' },
        ]} />
    </Field>
  )

  return null
}

export default function PropertiesPanel({ node, onUpdate, onDelete, onDuplicate }) {
  const [local, setLocal] = useState({})
  useEffect(() => setLocal(node?.data || {}), [node])

  if (!node) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
        <div style={{ fontSize: 32, opacity: 0.3 }}>◈</div>
        <div style={{ fontSize: 12, color: '#334155', textAlign: 'center' }}>
          Chọn một node<br/>để xem và chỉnh sửa
        </div>
      </div>
    )
  }

  const ss = STATUS_LABELS[local.status] || STATUS_LABELS.idle

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Node header */}
      <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e6eef8', flex: 1 }}>
            {local.label || node.type}
          </div>
          <div style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 10,
            background: `${ss.color}18`, color: ss.color, border: `1px solid ${ss.color}33`, fontWeight: 600
          }}>{ss.label}</div>
        </div>
        <div style={{ fontSize: 11, color: '#334155' }}>{node.type} • ID: {node.id}</div>
      </div>

      {/* Scrollable config area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <Field label="Label">
          <InputF value={local.label} onChange={v => setLocal(l => ({ ...l, label: v }))} placeholder="Node name..." />
        </Field>

        <NodeSpecificConfig node={node} local={local} setLocal={setLocal} />

        {/* Output preview */}
        {local.output && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Output</div>
            <div style={{
              background: 'rgba(0,0,0,0.3)', borderRadius: 7, padding: '8px 10px',
              border: '1px solid rgba(255,255,255,0.04)', maxHeight: 200, overflowY: 'auto'
            }}>
              <pre style={{ fontSize: 10, color: '#64748b', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(local.output, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn onClick={() => onUpdate(local)} variant="primary">💾 Save</Btn>
          <Btn onClick={() => {
            setLocal(l => ({ ...l, status: 'idle', output: null }))
            onUpdate({ ...local, status: 'idle', output: null })
          }}>↺ Reset</Btn>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn onClick={onDuplicate}>⧉ Duplicate</Btn>
          <Btn onClick={onDelete} variant="danger">🗑 Delete</Btn>
        </div>
      </div>
    </div>
  )
}
