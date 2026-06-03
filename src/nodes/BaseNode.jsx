import React from 'react'
import { Handle, Position } from 'reactflow'

const STATUS = {
  idle:    { border: 'rgba(255,255,255,0.06)', dot: '#444',    label: 'Idle' },
  ready:   { border: '#3b82f6',               dot: '#3b82f6', label: 'Ready' },
  running: { border: '#f59e0b',               dot: '#f59e0b', label: 'Running' },
  success: { border: '#10b981',               dot: '#10b981', label: 'Done' },
  error:   { border: '#ef4444',               dot: '#ef4444', label: 'Error' },
  warning: { border: '#f97316',               dot: '#f97316', label: 'Warning' },
}

export default function BaseNode({
  data,
  children,
  hasInput = true,
  hasOutput = true,
  icon = '◆',
  accentColor = '#7c3aed',
  minWidth = 280,
}) {
  const status = data?.status || 'idle'
  const ss = STATUS[status] || STATUS.idle
  const isRunning = status === 'running'

  return (
    <div style={{
      background: 'linear-gradient(160deg, #121c28 0%, #0d1520 100%)',
      border: `1.5px solid ${ss.border}`,
      borderRadius: 12,
      minWidth,
      maxWidth: 360,
      boxShadow: `0 4px 24px rgba(0,0,0,0.5)${isRunning ? `, 0 0 20px ${accentColor}22` : ''}`,
      transition: 'border-color 0.3s, box-shadow 0.3s',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        padding: '9px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.015)',
        borderRadius: '10px 10px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: `${accentColor}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, flexShrink: 0
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 12.5, color: '#e6eef8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data?.label || 'Node'}
          </div>
        </div>
        {/* Status dot */}
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: ss.dot, flexShrink: 0,
          boxShadow: isRunning ? `0 0 6px ${ss.dot}` : 'none',
          animation: isRunning ? 'pulse 1.2s ease-in-out infinite' : 'none',
        }} title={ss.label} />
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px' }}>
        {children}
      </div>

      {/* Handles */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#334155', width: 10, height: 10, border: '2px solid #1e293b', left: -6 }}
        />
      )}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: accentColor, width: 10, height: 10, border: `2px solid ${accentColor}55`, right: -6 }}
        />
      )}
    </div>
  )
}

// Shared UI primitives used inside nodes
export function NLabel({ children }) {
  return <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</div>
}

export function NSelect({ value, onChange, options, disabled }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%', background: '#0d1520', color: '#cbd5e1',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7,
        padding: '5px 8px', fontSize: 12, outline: 'none', cursor: 'pointer'
      }}
    >
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  )
}

export function NInput({ value, onChange, placeholder, disabled, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%', background: '#0d1520', color: '#cbd5e1',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7,
        padding: '5px 8px', fontSize: 12, outline: 'none', boxSizing: 'border-box'
      }}
    />
  )
}

export function NTextarea({ value, onChange, placeholder, rows = 3, disabled }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      style={{
        width: '100%', background: '#0d1520', color: '#cbd5e1',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7,
        padding: '5px 8px', fontSize: 12, outline: 'none',
        resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit'
      }}
    />
  )
}

export function NBtn({ onClick, disabled, children, variant = 'default', small }) {
  const variants = {
    default: { background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.08)' },
    primary: { background: 'linear-gradient(90deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', boxShadow: '0 2px 12px rgba(124,58,237,0.3)' },
    success: { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
    danger:  { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' },
  }
  const s = variants[variant] || variants.default
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s, borderRadius: 7, padding: small ? '4px 8px' : '5px 10px',
        fontSize: small ? 11 : 12, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 4,
        transition: 'opacity 0.2s', whiteSpace: 'nowrap'
      }}
    >{children}</button>
  )
}

export function NOutput({ label, value, small }) {
  if (!value) return null
  return (
    <div style={{ marginTop: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '5px 8px', border: '1px solid rgba(255,255,255,0.04)' }}>
      {label && <div style={{ fontSize: 10, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>}
      <div style={{ fontSize: small ? 10 : 11, color: '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 80, overflow: 'hidden' }}>
        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      </div>
    </div>
  )
}

export function NDivider() {
  return <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '8px 0' }} />
}
