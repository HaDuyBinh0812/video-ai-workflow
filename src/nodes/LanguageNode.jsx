import React from 'react'
import BaseNode, { NLabel } from './BaseNode'

const LANGS = [
  { value: 'vietnamese', label: '🇻🇳 Tiếng Việt', color: '#ef4444' },
  { value: 'english',    label: '🇺🇸 English',      color: '#3b82f6' },
  { value: 'bilingual',  label: '🌐 Song ngữ',       color: '#8b5cf6' },
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function LanguageNode({ id, data }) {
  const selected = data.selectedLanguage || 'vietnamese'

  return (
    <BaseNode data={data} icon="🌐" accentColor="#8b5cf6" minWidth={240} hasInput={false}>
      <NLabel>Ngôn ngữ đầu ra</NLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
        {LANGS.map(l => {
          const active = selected === l.value
          return (
            <div
              key={l.value}
              onClick={() => dispatch(id, { selectedLanguage: l.value, status: 'ready' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8,
                cursor: 'pointer', border: `1.5px solid ${active ? l.color : 'rgba(255,255,255,0.06)'}`,
                background: active ? `${l.color}18` : 'transparent', transition: 'all 0.15s'
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? l.color : '#334155' }} />
              <span style={{ fontSize: 12, color: active ? l.color : '#475569', fontWeight: active ? 600 : 400 }}>{l.label}</span>
            </div>
          )
        })}
      </div>
    </BaseNode>
  )
}
