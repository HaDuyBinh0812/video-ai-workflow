import React from 'react'
import BaseNode, { NLabel, NSelect, NBtn, NDivider } from './BaseNode'
import { compileExport } from '../workflow/runner'

const EXPORT_FORMATS = [
  { value: 'all',          label: '📦 Toàn bộ workflow' },
  { value: 'script',       label: '📝 Chỉ kịch bản' },
  { value: 'imagePrompt',  label: '🖼  Chỉ prompt ảnh' },
  { value: 'videoPrompt',  label: '🎥 Chỉ prompt video' },
  { value: 'negative',     label: '🚫 Chỉ negative prompt' },
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}

export default function ExportNode({ id, data }) {
  const output = data.output || {}
  const compiled = output.compiled || ''
  const exportData = output.exportData || {}

  function getExportText() {
    const fmt = data.exportFormat || 'all'
    if (fmt === 'script' && exportData.script) return JSON.stringify(exportData.script, null, 2)
    if (fmt === 'imagePrompt' && exportData.generatedPrompts) return exportData.generatedPrompts.mainPrompt || ''
    if (fmt === 'videoPrompt' && exportData.videoPrompt) return exportData.videoPrompt.videoPrompt || ''
    if (fmt === 'negative' && exportData.negativePrompt) return exportData.negativePrompt.negativePrompt || ''
    return compiled || JSON.stringify(exportData, null, 2)
  }

  function onExportTXT() {
    const text = getExportText()
    if (!text) return
    downloadText(text, 'workflow-result.txt')
  }

  function onExportJSON() {
    const text = JSON.stringify(exportData, null, 2)
    downloadText(text, 'workflow-result.json')
  }

  function onExportMD() {
    const lines = ['# AI Video Workflow Result\n']
    const script = exportData.script
    if (script?.title) lines.push(`## 📹 ${script.title}\n`)
    if (script?.hook) lines.push(`> ${script.hook}\n`)
    if (script?.scenes?.length) {
      lines.push('## Kịch bản')
      script.scenes.forEach((s, i) => {
        lines.push(`\n### Cảnh ${i + 1} (${s.duration})`)
        if (s.description) lines.push(`**Mô tả:** ${s.description}`)
        if (s.dialogue) lines.push(`**Lời thoại:** "${s.dialogue}"`)
        if (s.imagePrompt) lines.push(`\`\`\`\n${s.imagePrompt}\n\`\`\``)
      })
    }
    if (exportData.negativePrompt?.negativePrompt) {
      lines.push('\n## Negative Prompt')
      lines.push(`\`\`\`\n${exportData.negativePrompt.negativePrompt}\n\`\`\``)
    }
    downloadText(lines.join('\n'), 'workflow-result.md')
  }

  function onCopy() {
    const text = getExportText()
    if (text) navigator.clipboard.writeText(text)
  }

  const hasOutput = !!compiled

  return (
    <BaseNode data={data} icon="📤" accentColor="#10b981" minWidth={290} hasOutput={false}>
      <NLabel>Định dạng xuất</NLabel>
      <NSelect
        value={data.exportFormat || 'all'}
        onChange={v => dispatch(id, { exportFormat: v })}
        options={EXPORT_FORMATS}
      />

      <NDivider />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        <NBtn onClick={onCopy} disabled={!hasOutput} variant={hasOutput ? 'success' : 'default'}>
          📋 Copy All
        </NBtn>
        <NBtn onClick={onExportTXT} disabled={!hasOutput}>📄 TXT</NBtn>
        <NBtn onClick={onExportJSON} disabled={!hasOutput}>📦 JSON</NBtn>
        <NBtn onClick={onExportMD} disabled={!hasOutput}>📝 Markdown</NBtn>
      </div>

      {hasOutput ? (
        <div style={{ marginTop: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '6px 10px' }}>
          <div style={{ fontSize: 10, color: '#10b981', marginBottom: 2 }}>✓ KẾT QUẢ SẴN SÀNG</div>
          <div style={{ fontSize: 10, color: '#475569' }}>
            {exportData.script?.scenes?.length || 0} cảnh •
            {exportData.storyboard?.panels?.length || 0} panels •
            {compiled.length} ký tự
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 8, fontSize: 11, color: '#334155', textAlign: 'center', padding: '8px 0' }}>
          Chạy workflow để xuất kết quả
        </div>
      )}
    </BaseNode>
  )
}
