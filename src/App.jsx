import React, { useCallback, useEffect, useState, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import Sidebar from './components/Sidebar'
import PropertiesPanel from './components/PropertiesPanel'
import BottomPanel from './components/BottomPanel'
import { ToastProvider, useToast } from './components/Toast'
import { nodeTypes, defaultNodes, defaultEdges, makeNode } from './flow/nodes'
import { buildExecutionOrder, processNode, autoLayout, validateWorkflow, getAncestors } from './workflow/runner'
import DeletableEdge from './nodes/DeletableEdge'

const STORAGE_KEY = 'ai-video-workflow:v2'
const MAX_HISTORY = 40

const edgeTypes = { default: DeletableEdge }

const DISPLAY_KEYS = {
  promptNode: 'generatedPrompts',
  scriptNode: 'script',
  storyboardNode: 'storyboard',
  videoPromptNode: 'videoPrompt',
  negativeNode: 'negativePrompt',
}

function AppInner() {
  const toast = useToast()
  const { project, fitView } = useReactFlow()

  const [nodes, setNodes] = useState(defaultNodes)
  const [edges, setEdges] = useState(defaultEdges)
  const [selectedNode, setSelectedNode] = useState(null)
  const [logs, setLogs] = useState([])
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  // History for undo/redo
  const historyRef = useRef({ past: [], future: [] })
  const runToNodeRef = useRef(null)

  function pushHistory(ns, es) {
    historyRef.current.past.push({ nodes: ns, edges: es })
    if (historyRef.current.past.length > MAX_HISTORY) historyRef.current.past.shift()
    historyRef.current.future = []
  }

  function undo() {
    if (!historyRef.current.past.length) { toast('Không có gì để Undo', 'warning'); return }
    historyRef.current.future.push({ nodes, edges })
    const prev = historyRef.current.past.pop()
    setNodes(prev.nodes); setEdges(prev.edges)
    toast('↩ Undo', 'info', 1500)
  }

  function redo() {
    if (!historyRef.current.future.length) { toast('Không có gì để Redo', 'warning'); return }
    historyRef.current.past.push({ nodes, edges })
    const next = historyRef.current.future.pop()
    setNodes(next.nodes); setEdges(next.edges)
    toast('↪ Redo', 'info', 1500)
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if (ctrl && e.key === 's') { e.preventDefault(); saveWorkflow() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.nodes?.length) { setNodes(data.nodes); setEdges(data.edges || []) }
      } catch {}
    }
  }, [])

  // Listen for node:update events from node components
  useEffect(() => {
    function handler(e) {
      const { id, update } = e.detail || {}
      if (!id) return
      setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, ...update } } : n))
    }
    window.addEventListener('node:update', handler)
    return () => window.removeEventListener('node:update', handler)
  }, [])

  // Canvas drop handler for sidebar drag-to-canvas
  function onDrop(e) {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/node-type')
    const label = e.dataTransfer.getData('application/node-label')
    if (!type) return
    const bounds = e.currentTarget.getBoundingClientRect()
    const pos = project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top })
    const newNode = makeNode(type, label, pos.x, pos.y)
    pushHistory(nodes, edges)
    setNodes(ns => [...ns, newNode])
  }

  const onNodesChange = useCallback(changes => {
    setNodes(ns => applyNodeChanges(changes, ns))
  }, [])

  const onEdgesChange = useCallback(changes => {
    setEdges(es => applyEdgeChanges(changes, es))
  }, [])

  const onConnect = useCallback(params => {
    pushHistory(nodes, edges)
    setEdges(es => addEdge({ ...params, animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 } }, es))
  }, [nodes, edges])

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), [])
  const onPaneClick = useCallback(() => setSelectedNode(null), [])

  // Auto-layout
  function doAutoLayout() {
    pushHistory(nodes, edges)
    const arranged = autoLayout(nodes, edges)
    setNodes(arranged)
    setTimeout(() => fitView({ padding: 0.1 }), 50)
    toast('✓ Auto layout hoàn thành', 'success')
  }

  // Save / Load
  function saveWorkflow() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }))
    toast('💾 Workflow đã lưu', 'success')
  }

  function loadWorkflow() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) { toast('Không có workflow đã lưu', 'warning'); return }
    try {
      const data = JSON.parse(saved)
      pushHistory(nodes, edges)
      setNodes(data.nodes || []); setEdges(data.edges || [])
      toast('📂 Workflow đã tải', 'success')
    } catch { toast('Lỗi khi tải workflow', 'error') }
  }

  function resetWorkflow() {
    if (!confirm('Reset về workflow mẫu mặc định?')) return
    pushHistory(nodes, edges)
    setNodes(defaultNodes); setEdges(defaultEdges); setResult(null); setLogs([])
    toast('↺ Reset workflow', 'info')
  }

  // Export / Import JSON
  function exportJSON() {
    const data = JSON.stringify({ nodes, edges }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'workflow.json'; a.click(); URL.revokeObjectURL(url)
    toast('📦 Đã xuất workflow.json', 'success')
  }

  function importJSON(e) {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        pushHistory(nodes, edges)
        setNodes(data.nodes || []); setEdges(data.edges || [])
        toast('📂 Import thành công', 'success')
      } catch { toast('File JSON không hợp lệ', 'error') }
    }
    reader.readAsText(f)
    e.target.value = ''
  }

  // Add node from sidebar
  function onAddNode(node) {
    pushHistory(nodes, edges)
    setNodes(ns => [...ns, node])
    toast(`✚ Đã thêm ${node.data.label}`, 'info', 1500)
  }

  // Duplicate selected node
  function duplicateNode() {
    if (!selectedNode) return
    const dup = makeNode(selectedNode.type, selectedNode.data.label + ' (copy)', selectedNode.position.x + 40, selectedNode.position.y + 40, { ...selectedNode.data, status: 'idle', output: null })
    pushHistory(nodes, edges)
    setNodes(ns => [...ns, dup])
    toast('⧉ Duplicate node', 'success', 1500)
  }

  // Update node from properties panel
  function onUpdateNode(upd) {
    setNodes(ns => ns.map(n => n.id === selectedNode?.id ? { ...n, data: { ...n.data, ...upd } } : n))
    toast('💾 Đã lưu thay đổi', 'success', 1500)
  }

  // Delete selected node
  function onDeleteNode() {
    if (!selectedNode) return
    pushHistory(nodes, edges)
    setNodes(ns => ns.filter(n => n.id !== selectedNode.id))
    setEdges(es => es.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id))
    setSelectedNode(null)
    toast('🗑 Đã xóa node', 'info', 1500)
  }

  function addLog(level, text) {
    setLogs(l => [{ time: Date.now(), level, text }, ...l])
  }

  // ─── SINGLE NODE RUNNER (runs sub-graph up to targetId) ─────────────────────
  async function runToNode(targetId) {
    if (running) return
    setRunning(true)
    let order, incoming
    try {
      ;({ order, incoming } = buildExecutionOrder(nodes, edges))
    } catch (err) {
      addLog('error', err.message)
      toast('Lỗi: ' + err.message, 'error')
      setRunning(false)
      return
    }
    const ancestors = getAncestors(targetId, edges)
    const filteredOrder = order.filter(id => ancestors.has(id))
    const filteredSet = new Set(filteredOrder)
    const targetNode = nodes.find(n => n.id === targetId)
    addLog('info', `▶ Generate: ${targetNode?.data?.label || targetId} (${filteredOrder.length} bước)`)
    const idToNode = Object.fromEntries(nodes.map(n => [n.id, n]))
    const outputs = {}
    for (const id of filteredOrder) {
      const node = idToNode[id]
      setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'running' } } : n))
      try {
        const upstreamOutputs = (incoming[id] || [])
          .filter(srcId => filteredSet.has(srcId))   // only nodes we actually ran
          .map(srcId => outputs[srcId])
          .filter(Boolean)
        const enrichedNode = {
          ...node,
          data: { ...node.data, ...upstreamOutputs.reduce((acc, out) => ({ ...acc, ...out }), {}) }
        }
        const out = await processNode(enrichedNode, upstreamOutputs)
        outputs[id] = out
        const displayKey = DISPLAY_KEYS[node.type]
        const displayOut = displayKey && out[displayKey] ? out[displayKey] : out
        setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'success', output: displayOut } } : n))
        if (id === targetId) addLog('success', `✓ ${node.data?.label || node.type}`)
      } catch (err) {
        setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'error' } } : n))
        addLog('error', `✗ ${node.data?.label || node.type}: ${err.message}`)
        toast(`Lỗi tại: ${node.data?.label}`, 'error')
        setRunning(false)
        return
      }
    }
    setRunning(false)
  }
  runToNodeRef.current = runToNode

  useEffect(() => {
    function onRunTo(e) {
      const { id } = e.detail || {}
      if (id) runToNodeRef.current?.(id)
    }
    window.addEventListener('node:run-to', onRunTo)
    return () => window.removeEventListener('node:run-to', onRunTo)
  }, [])

  // ─── WORKFLOW RUNNER ────────────────────────────────────────────────────────
  async function runWorkflow() {
    if (running) return
    setRunning(true)
    setLogs([])
    setResult(null)

    // Validate first
    const validation = validateWorkflow(nodes, edges)
    if (validation.warnings.length) validation.warnings.forEach(w => addLog('warning', w))
    if (!validation.valid) {
      validation.errors.forEach(e => addLog('error', e))
      toast('Workflow có lỗi — xem Logs', 'error')
      setRunning(false)
      return
    }

    let order, incoming
    try {
      ;({ order, incoming } = buildExecutionOrder(nodes, edges))
    } catch (err) {
      addLog('error', err.message)
      toast('Lỗi workflow: ' + err.message, 'error')
      setRunning(false)
      return
    }

    addLog('info', `▶ Bắt đầu chạy workflow (${order.length} nodes)`)

    const idToNode = Object.fromEntries(nodes.map(n => [n.id, n]))
    const outputs = {}
    let failed = false

    for (const id of order) {
      const node = idToNode[id]
      // Mark running
      setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'running' } } : n))
      addLog('info', `⏳ ${node.data?.label || node.type}`)

      try {
        const upstreamOutputs = incoming[id].map(srcId => outputs[srcId]).filter(Boolean)
        // Pass upstream outputs into node data for context
        const enrichedNode = {
          ...node,
          data: {
            ...node.data,
            // Flatten upstream outputs into node data so processNode can access them
            ...upstreamOutputs.reduce((acc, out) => ({ ...acc, ...out }), {})
          }
        }
        const out = await processNode(enrichedNode, upstreamOutputs)
        outputs[id] = out

        const displayKey = DISPLAY_KEYS[node.type]
        const displayOut = displayKey && out[displayKey] ? out[displayKey] : out

        setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'success', output: displayOut } } : n))
        addLog('success', `✓ ${node.data?.label || node.type}`)
      } catch (err) {
        setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'error' } } : n))
        addLog('error', `✗ ${node.data?.label || node.type}: ${err.message}`)
        toast(`Lỗi tại node: ${node.data?.label}`, 'error')
        failed = true
        break
      }
    }

    if (!failed) {
      // Collect final merged output from last node
      const lastId = order[order.length - 1]
      const exportOutput = outputs[lastId]
      const allMerged = Object.values(outputs).reduce((acc, out) => ({ ...acc, ...out }), {})

      setResult({ exportData: allMerged, nodes: outputs })
      addLog('info', '✅ Workflow hoàn thành!')
      toast('✅ Workflow chạy thành công!', 'success', 4000)
    }

    setRunning(false)
  }

  return (
    <div className="app-shell">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <span>🎬</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#e6eef8', letterSpacing: '-0.01em' }}>AI Video Workflow Builder</div>
            <div style={{ fontSize: 11, color: '#334155' }}>Visual prompt & script automation</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <HeaderBtn onClick={resetWorkflow} title="New Workflow">↺ New</HeaderBtn>
          <HeaderBtn onClick={saveWorkflow}>💾 Save</HeaderBtn>
          <HeaderBtn onClick={loadWorkflow}>📂 Load</HeaderBtn>
          <label style={{ ...headerBtnStyle, cursor: 'pointer' }}>
            📥 Import
            <input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
          </label>
          <HeaderBtn onClick={exportJSON}>📦 Export</HeaderBtn>
          <HeaderBtn onClick={doAutoLayout}>◈ Layout</HeaderBtn>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.06)' }} />
          <button
            onClick={runWorkflow}
            disabled={running}
            className="run-btn"
          >
            {running ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                Running...
              </span>
            ) : '▶ Run Workflow'}
          </button>
        </div>
      </header>

      {/* MAIN AREA */}
      <div className="main">
        {/* Sidebar */}
        <aside className="sidebar">
          <Sidebar onAddNode={onAddNode} />
        </aside>

        {/* Canvas */}
        <div
          className="canvas-wrap"
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            style={{ width: '100%', height: '100%' }}
          >
            <Background gap={20} size={1} color="#0d1520" variant="dots" />
            <MiniMap
              nodeColor={n => {
                const s = n.data?.status
                if (s === 'error') return '#ef4444'
                if (s === 'success') return '#10b981'
                if (s === 'running') return '#f59e0b'
                return '#1e293b'
              }}
              maskColor="rgba(0,0,0,0.6)"
              style={{ background: '#070c12', border: '1px solid rgba(255,255,255,0.06)' }}
            />
            <Controls style={{ button: { background: '#0f1720', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8' } }} />
          </ReactFlow>

          {/* Canvas overlay: undo/redo */}
          <div style={{ position: 'absolute', bottom: 70, left: 12, display: 'flex', gap: 5, zIndex: 10 }}>
            <button onClick={undo} className="canvas-fab" title="Undo (Ctrl+Z)">↩</button>
            <button onClick={redo} className="canvas-fab" title="Redo (Ctrl+Y)">↪</button>
          </div>
        </div>

        {/* Properties panel */}
        <aside className="rightpanel">
          <PropertiesPanel
            node={selectedNode}
            onUpdate={onUpdateNode}
            onDelete={onDeleteNode}
            onDuplicate={duplicateNode}
          />
        </aside>
      </div>

      {/* BOTTOM PANEL */}
      <div className="bottom">
        <BottomPanel
          logs={logs}
          result={result}
          onCopy={() => {
            const text = result?.exportData?.compiled || JSON.stringify(result, null, 2)
            if (text) { navigator.clipboard.writeText(text); toast('📋 Đã copy kết quả!', 'success') }
          }}
        />
      </div>
    </div>
  )
}

function HeaderBtn({ onClick, children, title, disabled }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={headerBtnStyle}>{children}</button>
  )
}

const headerBtnStyle = {
  background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
  padding: '6px 12px', fontSize: 12, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 5,
  transition: 'all 0.15s', whiteSpace: 'nowrap'
}

export default function App() {
  return (
    <ReactFlowProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </ReactFlowProvider>
  )
}
