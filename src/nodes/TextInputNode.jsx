import React from 'react'
import BaseNode, { NLabel, NTextarea, NBtn } from './BaseNode'

function dispatch(id, update) {
  window.dispatchEvent(new CustomEvent('node:update', { detail: { id, update } }))
}

export default function TextInputNode({ id, data }) {
  return (
    <BaseNode data={data} icon="✏️" accentColor="#06b6d4" minWidth={270} hasInput={false}>
      <NLabel>Ý tưởng / Mô tả sản phẩm</NLabel>
      <NTextarea
        value={data.text || ''}
        onChange={v => dispatch(id, { text: v, status: v.trim() ? 'ready' : 'idle' })}
        placeholder="Nhập ý tưởng, mô tả sản phẩm, nội dung quảng cáo..."
        rows={4}
      />
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <NBtn onClick={() => dispatch(id, { text: '', status: 'idle' })} small>🗑 Xóa</NBtn>
        {data.text && <span style={{ fontSize: 10, color: '#475569', margin: 'auto 0' }}>{data.text.length} ký tự</span>}
      </div>
    </BaseNode>
  )
}
