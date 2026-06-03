import {
  analyzeImage, generatePrompts, generateScript,
  generateStoryboard, generateVideoPrompt, generateNegativePrompt
} from '../api/ggStudio'

// Build topological execution order using Kahn's algorithm
export function buildExecutionOrder(nodes, edges) {
  const nodeIds = new Set(nodes.map(n => n.id))
  // Filter out dangling edges (source or target node no longer exists)
  const validEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))

  const incoming = {}
  nodes.forEach(n => (incoming[n.id] = []))
  validEdges.forEach(e => incoming[e.target].push(e.source))

  const inDeg = {}
  nodes.forEach(n => (inDeg[n.id] = incoming[n.id].length))

  const queue = nodes.filter(n => inDeg[n.id] === 0).map(n => n.id)
  const order = []

  while (queue.length) {
    const id = queue.shift()
    order.push(id)
    validEdges.forEach(e => {
      if (e.source === id) {
        inDeg[e.target]--
        if (inDeg[e.target] === 0) queue.push(e.target)
      }
    })
  }

  if (order.length !== nodes.length) {
    throw new Error('Workflow có vòng lặp — kiểm tra lại các kết nối')
  }

  return { order, incoming }
}

// Auto-layout nodes based on topological levels
export function autoLayout(nodes, edges) {
  if (!nodes.length) return nodes

  const adj = {}
  const inDeg = {}
  nodes.forEach(n => { adj[n.id] = []; inDeg[n.id] = 0 })
  edges.forEach(e => { if (adj[e.source]) { adj[e.source].push(e.target); inDeg[e.target]++ } })

  const levels = {}
  const bfsQueue = nodes.filter(n => inDeg[n.id] === 0).map(n => n.id)
  bfsQueue.forEach(id => (levels[id] = 0))
  const visited = new Set()
  const workQueue = [...bfsQueue]

  while (workQueue.length) {
    const id = workQueue.shift()
    if (visited.has(id)) continue
    visited.add(id)
    ;(adj[id] || []).forEach(next => {
      levels[next] = Math.max(levels[next] ?? 0, (levels[id] ?? 0) + 1)
      workQueue.push(next)
    })
  }

  const byLevel = {}
  nodes.forEach(n => {
    const lv = levels[n.id] ?? 0
    if (!byLevel[lv]) byLevel[lv] = []
    byLevel[lv].push(n.id)
  })

  const NODE_W = 340, H_GAP = 100, NODE_H = 240, V_GAP = 50, OFFSET_X = 80, OFFSET_Y = 80

  return nodes.map(n => {
    const lv = levels[n.id] ?? 0
    const levelList = byLevel[lv] || [n.id]
    const idx = levelList.indexOf(n.id)
    const totalH = levelList.length * (NODE_H + V_GAP) - V_GAP
    const startY = OFFSET_Y + Math.max(0, (600 - totalH) / 2)
    return { ...n, position: { x: OFFSET_X + lv * (NODE_W + H_GAP), y: startY + idx * (NODE_H + V_GAP) } }
  })
}

// Process a single node given upstream outputs merged into inputs.
// Each node returns { ...merged, ownOutput } so accumulated data flows through chains.
// Example: TextInput→Prompt→Script — Script sees textInput AND generatedPrompts.
export async function processNode(node, upstreamOutputs) {
  const merged = upstreamOutputs.reduce((acc, out) => ({ ...acc, ...(out || {}) }), {})
  const data = node.data || {}

  switch (node.type) {
    case 'imageNode': {
      if (data.imageBase64) {
        try {
          const analysis = await analyzeImage(data.imageBase64, data.imageMimeType || 'image/jpeg')
          return { ...merged, imageAnalysis: analysis, imageType: data.imageType || 'general', imageDescription: data.description || '' }
        } catch {
          return { ...merged, imageDescription: data.description || '', imageType: data.imageType || 'general' }
        }
      }
      return { ...merged, imageDescription: data.description || '', imageType: data.imageType || 'general' }
    }

    case 'textInputNode':
      return { ...merged, textInput: data.text || '' }

    case 'styleNode':
      return { ...merged, style: data.selectedStyle || 'Cinematic' }

    case 'aspectRatioNode':
      return { ...merged, aspectRatio: data.selectedRatio || '9:16' }

    case 'durationNode':
      return { ...merged, duration: Number(data.selectedDuration) || 30 }

    case 'languageNode':
      return { ...merged, language: data.selectedLanguage || 'vietnamese' }

    case 'cameraStyleNode':
      return { ...merged, cameraStyle: data.selectedCamera || 'Cinematic Dolly' }

    case 'motionStyleNode':
      return { ...merged, motionStyle: data.selectedMotion || 'Natural Movement' }

    case 'promptNode': {
      const res = await generatePrompts({
        ...merged,
        promptType: data.promptType || 'image',
        detailLevel: data.detailLevel || 'detailed',
        additionalRequirements: data.additionalRequirements || ''
      })
      return { ...merged, generatedPrompts: res }
    }

    case 'scriptNode': {
      const res = await generateScript({
        ...merged,
        videoStyle: data.videoStyle || 'tvc',
        sceneCount: Number(data.sceneCount) || 6,
        duration: Number(data.duration || merged.duration) || 30,
        language: data.language || merged.language || 'vietnamese',
        includeDialogue: data.includeDialogue !== false
      })
      return { ...merged, script: res }
    }

    case 'storyboardNode': {
      const res = await generateStoryboard({
        ...merged,
        panelCount: Number(data.panelCount) || 6,
        aspectRatio: data.aspectRatio || merged.aspectRatio || '9:16'
      })
      return { ...merged, storyboard: res }
    }

    case 'videoPromptNode': {
      const res = await generateVideoPrompt({
        ...merged,
        mode: data.mode || 'imageToVideo',
        cameraMovement: data.cameraMovement || merged.cameraStyle || 'slow-push',
        motionStyle: data.motionStyle || merged.motionStyle || 'natural'
      })
      return { ...merged, videoPrompt: res }
    }

    case 'negativeNode': {
      const res = await generateNegativePrompt(merged)
      return { ...merged, negativePrompt: res }
    }

    case 'exportNode': {
      const compiled = compileExport(merged)
      return { ...merged, compiled }
    }

    default:
      return { ...merged, nodeType: node.type }
  }
}

// Compile final formatted output text
export function compileExport(data) {
  const lines = []
  lines.push('═══════════════════════════════════════════════')
  lines.push('   AI VIDEO WORKFLOW — KẾT QUẢ HOÀN CHỈNH')
  lines.push('═══════════════════════════════════════════════')
  lines.push('')

  // Video info
  const script = data.script || {}
  if (script.title) lines.push(`📹 TIÊU ĐỀ: ${script.title}`)
  if (data.aspectRatio) lines.push(`📐 TỶ LỆ: ${data.aspectRatio}`)
  if (data.duration) lines.push(`⏱  THỜI LƯỢNG: ${data.duration}s`)
  if (data.style) lines.push(`🎨 PHONG CÁCH: ${data.style}`)
  if (data.language) lines.push(`🌐 NGÔN NGỮ: ${data.language}`)
  lines.push('')

  // Hook
  if (script.hook) {
    lines.push('─── HOOK MỞ ĐẦU ─────────────────────────────')
    lines.push(script.hook)
    lines.push('')
  }

  // Image analysis
  const img = data.imageAnalysis
  if (img?.description) {
    lines.push('─── PHÂN TÍCH HÌNH ẢNH ───────────────────────')
    lines.push(img.description)
    if (img.suggested_prompt) lines.push(`→ Suggested prompt: ${img.suggested_prompt}`)
    lines.push('')
  } else if (data.imageDescription) {
    lines.push('─── MÔ TẢ HÌNH ẢNH ──────────────────────────')
    lines.push(data.imageDescription)
    lines.push('')
  }

  // Generated prompts
  const gp = data.generatedPrompts
  if (gp?.mainPrompt) {
    lines.push('─── PROMPT TẠO ẢNH CHÍNH ────────────────────')
    lines.push(gp.mainPrompt)
    if (gp.camera) lines.push(`Camera: ${gp.camera}`)
    if (gp.lighting) lines.push(`Lighting: ${gp.lighting}`)
    if (gp.motion) lines.push(`Motion: ${gp.motion}`)
    lines.push('')
  }

  // Scenes
  if (script.scenes?.length) {
    lines.push('─── KỊCH BẢN TỪNG CẢNH ──────────────────────')
    script.scenes.forEach((s, i) => {
      lines.push('')
      lines.push(`CẢNH ${i + 1} — ${s.duration || '?s'} | ${s.camera || ''} | ${s.setting || ''}`)
      if (s.description) lines.push(`[MÔ TẢ]   ${s.description}`)
      if (s.action)      lines.push(`[HÀNH ĐỘNG] ${s.action}`)
      if (s.dialogue)    lines.push(`[LỜI THOẠI] "${s.dialogue}"`)
      if (s.imagePrompt) lines.push(`[IMG PROMPT] ${s.imagePrompt}`)
      if (s.videoPrompt) lines.push(`[VID PROMPT] ${s.videoPrompt}`)
    })
    lines.push('')
  }

  // Storyboard
  const sb = data.storyboard
  if (sb?.panels?.length) {
    lines.push('─── STORYBOARD ──────────────────────────────')
    sb.panels.forEach(p => {
      lines.push(`Panel ${p.id}: [${p.cameraAngle}] ${p.description}`)
      if (p.imagePrompt) lines.push(`  → Prompt: ${p.imagePrompt}`)
    })
    lines.push('')
  }

  // Video prompt
  const vp = data.videoPrompt
  if (vp?.videoPrompt) {
    lines.push('─── VIDEO PROMPT (CHÍNH) ────────────────────')
    lines.push(vp.videoPrompt)
    lines.push('')
    if (vp.scenePrompts?.length) {
      lines.push('Video prompts từng cảnh:')
      vp.scenePrompts.forEach(sp => {
        lines.push(`  Cảnh ${sp.scene} (${sp.duration}): ${sp.prompt}`)
      })
      lines.push('')
    }
  }

  // Negative prompt
  const np = data.negativePrompt
  if (np?.negativePrompt) {
    lines.push('─── NEGATIVE PROMPT ─────────────────────────')
    lines.push(np.negativePrompt)
    lines.push('')
    if (np.identityLock?.length) {
      lines.push('Identity Lock Rules:')
      np.identityLock.forEach(r => lines.push(`  • ${r}`))
      lines.push('')
    }
  }

  // CTA
  if (script.cta) {
    lines.push('─── CTA CUỐI VIDEO ──────────────────────────')
    lines.push(script.cta)
    lines.push('')
  }

  lines.push('═══════════════════════════════════════════════')

  return lines.join('\n')
}

// Return Set of all node IDs that are ancestors of (or equal to) targetId
export function getAncestors(targetId, edges) {
  const ancestors = new Set()
  const queue = [targetId]
  while (queue.length) {
    const id = queue.shift()
    edges.filter(e => e.target === id).forEach(e => {
      if (!ancestors.has(e.source)) {
        ancestors.add(e.source)
        queue.push(e.source)
      }
    })
  }
  ancestors.add(targetId)
  return ancestors
}

export function validateWorkflow(nodes, edges) {
  const errors = []
  const warnings = []

  if (!nodes.length) {
    errors.push('Workflow trống — thêm ít nhất một node')
    return { errors, warnings, valid: false }
  }

  const nodeIds = new Set(nodes.map(n => n.id))

  // Check dangling edges
  edges.forEach(e => {
    if (!nodeIds.has(e.source)) errors.push(`Edge trỏ tới node không tồn tại: ${e.source}`)
    if (!nodeIds.has(e.target)) errors.push(`Edge trỏ tới node không tồn tại: ${e.target}`)
  })

  // Check for orphan nodes (no connections)
  const connectedIds = new Set()
  edges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target) })
  nodes.forEach(n => {
    if (!connectedIds.has(n.id) && nodes.length > 1) {
      warnings.push(`Node "${n.data?.label || n.type}" chưa được kết nối`)
    }
  })

  // Check topological order (detect cycles)
  try {
    buildExecutionOrder(nodes, edges)
  } catch (err) {
    errors.push(err.message)
  }

  return { errors, warnings, valid: errors.length === 0 }
}
