import React, { useState } from 'react'

const LOG_COLORS = { info: '#7c3aed', success: '#10b981', error: '#ef4444', warning: '#f59e0b' }

function LogLine({ log }) {
  const color = LOG_COLORS[log.level] || '#475569'
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 11, marginBottom: 4, alignItems: 'flex-start' }}>
      <span style={{ color: '#334155', flexShrink: 0, fontSize: 10, marginTop: 1 }}>
        {new Date(log.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span style={{
        flexShrink: 0, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
        background: `${color}20`, color, border: `1px solid ${color}30`, textTransform: 'uppercase'
      }}>{log.level}</span>
      <span style={{ color: '#94a3b8', flex: 1 }}>{log.text}</span>
    </div>
  )
}

function downloadText(text, name) {
  const blob = new Blob([text], { type: 'text/plain; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url)
}

export default function BottomPanel({ logs, result, onCopy }) {
  const [activeTab, setActiveTab] = useState('result')

  const compiled = result?.exportData?.compiled || result?.nodes
    ? (typeof result?.nodes === 'object' ? Object.values(result.nodes).map(n => n.generated || '').join('\n') : '')
    : ''
  const compiledText = result?.exportData?.compiled || compiled || (result ? JSON.stringify(result, null, 2) : '')

  const tabs = [
    { id: 'result', label: '📄 Kết quả', hasContent: !!result },
    { id: 'script', label: '📝 Kịch bản', hasContent: !!result?.exportData?.script },
    { id: 'prompts', label: '✨ Prompts', hasContent: !!(result?.exportData?.generatedPrompts || result?.exportData?.videoPrompt) },
    { id: 'logs', label: `📋 Logs ${logs.length ? `(${logs.length})` : ''}`, hasContent: logs.length > 0 },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
            background: activeTab === tab.id ? 'rgba(124,58,237,0.2)' : 'transparent',
            color: activeTab === tab.id ? '#a78bfa' : '#475569',
            border: `1px solid ${activeTab === tab.id ? 'rgba(124,58,237,0.4)' : 'transparent'}`,
            fontWeight: tab.hasContent ? 600 : 400,
            transition: 'all 0.15s'
          }}>{tab.label}</button>
        ))}
        {result && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button onClick={onCopy} style={actionBtn}>📋 Copy All</button>
            <button onClick={() => compiledText && downloadText(compiledText, 'workflow-result.txt')} style={actionBtn}>📄 TXT</button>
            <button onClick={() => result && downloadText(JSON.stringify(result.exportData || result, null, 2), 'workflow-result.json')} style={actionBtn}>📦 JSON</button>
            <button onClick={() => result?.exportData?.script && downloadMD(result.exportData)} style={actionBtn}>📝 MD</button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'result' && (
          result?.exportData?.compiled || compiledText ? (
            <pre style={{
              fontSize: 11, color: '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              fontFamily: "'Fira Code', 'Consolas', monospace", lineHeight: 1.7, margin: 0
            }}>{compiledText}</pre>
          ) : (
            <EmptyState />
          )
        )}

        {activeTab === 'script' && (
          result?.exportData?.script ? (
            <ScriptView script={result.exportData.script} />
          ) : <EmptyState msg="Chạy workflow để xem kịch bản" />
        )}

        {activeTab === 'prompts' && (
          result?.exportData ? (
            <PromptsView data={result.exportData} />
          ) : <EmptyState msg="Chạy workflow để xem prompts" />
        )}

        {activeTab === 'logs' && (
          logs.length > 0 ? (
            <div>
              {[...logs].reverse().map((log, i) => <LogLine key={i} log={log} />)}
            </div>
          ) : <EmptyState msg="Logs sẽ hiển thị khi chạy workflow" />
        )}
      </div>
    </div>
  )
}

function EmptyState({ msg = 'Chưa có kết quả. Nhấn Run Workflow để bắt đầu.' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: '#334155' }}>
      <div style={{ fontSize: 28 }}>🎬</div>
      <div style={{ fontSize: 12 }}>{msg}</div>
    </div>
  )
}

function ScriptView({ script }) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef8', marginBottom: 4 }}>{script.title}</div>
        {script.hook && (
          <div style={{ fontSize: 12, color: '#7c3aed', fontStyle: 'italic', padding: '6px 10px', background: 'rgba(124,58,237,0.08)', borderRadius: 6, borderLeft: '3px solid #7c3aed' }}>
            "{script.hook}"
          </div>
        )}
      </div>
      {script.scenes?.map((s, i) => (
        <div key={i} style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.15)', padding: '2px 8px', borderRadius: 4 }}>
              CẢNH {i + 1}
            </div>
            <span style={{ fontSize: 11, color: '#475569' }}>{s.duration} • {s.camera}</span>
          </div>
          {s.description && <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>📍 {s.description}</div>}
          {s.action && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>→ {s.action}</div>}
          {s.dialogue && (
            <div style={{ fontSize: 11, color: '#e2c882', fontStyle: 'italic', padding: '4px 8px', background: 'rgba(226,200,130,0.06)', borderRadius: 4 }}>
              💬 "{s.dialogue}"
            </div>
          )}
          {s.imagePrompt && (
            <div style={{ marginTop: 6, fontSize: 10, color: '#475569', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
              🖼 {s.imagePrompt.slice(0, 120)}{s.imagePrompt.length > 120 ? '...' : ''}
            </div>
          )}
        </div>
      ))}
      {script.cta && (
        <div style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
          <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>CTA: </span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{script.cta}</span>
        </div>
      )}
    </div>
  )
}

function PromptsView({ data }) {
  const gp = data.generatedPrompts
  const vp = data.videoPrompt
  const np = data.negativePrompt

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {gp?.mainPrompt && (
        <PromptCard title="🖼 Image Prompt" content={gp.mainPrompt} color="#7c3aed"
          extra={[gp.camera && `📷 ${gp.camera}`, gp.lighting && `💡 ${gp.lighting}`].filter(Boolean)} />
      )}
      {vp?.videoPrompt && (
        <PromptCard title="🎥 Video Prompt" content={vp.videoPrompt} color="#06b6d4" />
      )}
      {np?.negativePrompt && (
        <PromptCard title="🚫 Negative Prompt" content={np.negativePrompt} color="#64748b" />
      )}
    </div>
  )
}

function PromptCard({ title, content, color, extra = [] }) {
  return (
    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: `1px solid ${color}22` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{title}</span>
        <button onClick={() => navigator.clipboard.writeText(content)} style={{ ...actionBtn, fontSize: 10 }}>📋</button>
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>{content}</div>
      {extra.map((e, i) => <div key={i} style={{ marginTop: 4, fontSize: 10, color: '#475569' }}>{e}</div>)}
    </div>
  )
}

const actionBtn = {
  background: 'rgba(255,255,255,0.05)', color: '#64748b',
  border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6,
  padding: '3px 8px', fontSize: 11, cursor: 'pointer'
}

function downloadMD(data) {
  const lines = ['# AI Video Workflow Result\n']
  const script = data.script
  if (script?.title) { lines.push(`## 📹 ${script.title}`); lines.push('') }
  if (script?.hook) { lines.push(`> ${script.hook}`); lines.push('') }
  if (script?.scenes?.length) {
    lines.push('## Kịch bản')
    script.scenes.forEach((s, i) => {
      lines.push(`\n### Cảnh ${i + 1} (${s.duration})`)
      if (s.description) lines.push(`**Mô tả:** ${s.description}`)
      if (s.dialogue) lines.push(`**Lời thoại:** "${s.dialogue}"`)
      if (s.imagePrompt) { lines.push(''); lines.push('```'); lines.push(s.imagePrompt); lines.push('```') }
    })
  }
  if (data.negativePrompt?.negativePrompt) {
    lines.push('\n## Negative Prompt'); lines.push('```'); lines.push(data.negativePrompt.negativePrompt); lines.push('```')
  }
  const text = lines.join('\n')
  const blob = new Blob([text], { type: 'text/markdown; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'workflow-result.md'; a.click(); URL.revokeObjectURL(url)
}
