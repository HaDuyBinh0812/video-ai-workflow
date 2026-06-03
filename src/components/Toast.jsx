import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
const COLORS = {
  success: { bg: 'rgba(16,185,129,0.15)', border: '#10b981', icon: '#10b981' },
  error:   { bg: 'rgba(239,68,68,0.15)',  border: '#ef4444', icon: '#ef4444' },
  warning: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', icon: '#f59e0b' },
  info:    { bg: 'rgba(124,58,237,0.15)', border: '#7c3aed', icon: '#7c3aed' }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info', duration = 3200) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.info
          return (
            <div key={t.id} className="toast-item" style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 10,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              minWidth: 240,
              maxWidth: 380,
              fontSize: 13,
              color: '#e6eef8',
              animation: 'slideInRight 0.25s ease-out'
            }}>
              <span style={{ color: c.icon, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{ICONS[t.type]}</span>
              <span>{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
