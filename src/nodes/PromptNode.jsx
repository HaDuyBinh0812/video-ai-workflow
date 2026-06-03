import React from 'react'
import BaseNode, { NLabel, NSelect, NTextarea, NBtn, NOutput, NDivider } from './BaseNode'

const PROMPT_TYPES = [
  { value: 'image',    label: '🖼  Prompt tạo ảnh' },
  { value: 'video',    label: '🎬 Prompt video motion' },
  { value: 'product',  label: '📦 Prompt sản phẩm' },
  { value: 'fashion',  label: '👗 Prompt thời trang' },
  { value: 'character',label: '👤 Prompt nhân vật nhất quán' },
]
const DETAIL_LEVELS = [
  { value: 'short',   label: 'Ngắn gọn' },
  { value: 'medium',  label: 'Trung bình' },
  { value: 'detailed',label: 'Chi tiết' },
  { value: 'ultra',   label: 'Siêu chi tiết' },
]

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function PromptNode({ id, data }) {
  function onGenerate() {
    window.dispatchEvent(new CustomEvent('node:run-to', { detail: { id } }))
  }

  const output = data.output

  return (
    <BaseNode data={data} icon="✨" accentColor="#ff7a59" minWidth={300}>
      <NLabel>Loại prompt</NLabel>
      <NSelect
        value={data.promptType || 'image'}
        onChange={v => dispatch(id, { promptType: v })}
        options={PROMPT_TYPES}
      />

      <div style={{ marginTop: 6 }}>
        <NLabel>Mức độ chi tiết</NLabel>
        <NSelect
          value={data.detailLevel || 'detailed'}
          onChange={v => dispatch(id, { detailLevel: v })}
          options={DETAIL_LEVELS}
        />
      </div>

      <div style={{ marginTop: 6 }}>
        <NLabel>Yêu cầu bổ sung</NLabel>
        <NTextarea
          value={data.additionalRequirements || ''}
          onChange={v => dispatch(id, { additionalRequirements: v })}
          placeholder="Thêm yêu cầu đặc biệt..."
          rows={2}
        />
      </div>

      <NDivider />
      <div style={{ display: 'flex', gap: 6 }}>
        <NBtn onClick={onGenerate} disabled={data.status === 'running'} variant="primary">
          {data.status === 'running' ? '⏳ Đang tạo...' : '✨ Generate'}
        </NBtn>
        {output && <NBtn onClick={() => navigator.clipboard.writeText(output.mainPrompt || '')} small>📋 Copy</NBtn>}
      </div>

      {output?.mainPrompt && (
        <NOutput label="Main Prompt" value={output.mainPrompt} small />
      )}
    </BaseNode>
  )
}
