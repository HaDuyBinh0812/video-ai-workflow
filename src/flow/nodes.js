import React from 'react'
import ImageNode from '../nodes/ImageNode'
import TextInputNode from '../nodes/TextInputNode'
import StyleNode from '../nodes/StyleNode'
import PromptNode from '../nodes/PromptNode'
import ScriptNode from '../nodes/ScriptNode'
import StoryboardNode from '../nodes/StoryboardNode'
import VideoPromptNode from '../nodes/VideoPromptNode'
import NegativeNode from '../nodes/NegativeNode'
import ExportNode from '../nodes/ExportNode'
import AspectRatioNode from '../nodes/AspectRatioNode'
import DurationNode from '../nodes/DurationNode'
import LanguageNode from '../nodes/LanguageNode'
import CameraStyleNode from '../nodes/CameraStyleNode'
import MotionStyleNode from '../nodes/MotionStyleNode'

export const nodeTypes = {
  imageNode:      ImageNode,
  textInputNode:  TextInputNode,
  styleNode:      StyleNode,
  promptNode:     PromptNode,
  scriptNode:     ScriptNode,
  storyboardNode: StoryboardNode,
  videoPromptNode:VideoPromptNode,
  negativeNode:   NegativeNode,
  exportNode:     ExportNode,
  aspectRatioNode:AspectRatioNode,
  durationNode:   DurationNode,
  languageNode:   LanguageNode,
  cameraStyleNode:CameraStyleNode,
  motionStyleNode:MotionStyleNode,
}

// Default sample workflow: columns (x) → rows (y)
//   Col 0 (inputs): TextInput, Image, Style
//   Col 1: Prompt
//   Col 2: Script
//   Col 3: Storyboard
//   Col 4: VideoPrompt + Negative
//   Col 5: Export
export const defaultNodes = [
  { id: '1', type: 'textInputNode',  position: { x: 60,   y: 80  }, data: { label: 'Text Input',        status: 'idle', text: 'Sản phẩm kem dưỡng da cao cấp, dòng anti-aging, phong cách Hàn Quốc sang trọng' } },
  { id: '2', type: 'imageNode',      position: { x: 60,   y: 300 }, data: { label: 'Image Node',         status: 'idle' } },
  { id: '3', type: 'styleNode',      position: { x: 60,   y: 520 }, data: { label: 'Style',              status: 'ready', selectedStyle: 'Korean Drama' } },
  { id: '4', type: 'promptNode',     position: { x: 460,  y: 180 }, data: { label: 'Prompt Generator',   status: 'idle', promptType: 'image', detailLevel: 'detailed' } },
  { id: '5', type: 'scriptNode',     position: { x: 860,  y: 120 }, data: { label: 'Script Generator',   status: 'idle', videoStyle: 'tvc', sceneCount: 6, duration: 30, language: 'vietnamese', includeDialogue: true } },
  { id: '6', type: 'storyboardNode', position: { x: 1260, y: 120 }, data: { label: 'Storyboard',         status: 'idle', panelCount: 6, aspectRatio: '9:16' } },
  { id: '7', type: 'videoPromptNode',position: { x: 1660, y: 60  }, data: { label: 'Video Prompt',       status: 'idle', mode: 'imageToVideo', cameraMovement: 'slow-push', motionStyle: 'natural' } },
  { id: '8', type: 'negativeNode',   position: { x: 1660, y: 360 }, data: { label: 'Negative Prompt',    status: 'idle' } },
  { id: '9', type: 'exportNode',     position: { x: 2060, y: 200 }, data: { label: 'Export',             status: 'idle', exportFormat: 'all' } },
]

export const defaultEdges = [
  { id: 'e1-4', source: '1', target: '4', animated: false, style: { stroke: '#7c3aed55', strokeWidth: 1.5 } },
  { id: 'e2-4', source: '2', target: '4', animated: false, style: { stroke: '#7c3aed55', strokeWidth: 1.5 } },
  { id: 'e3-4', source: '3', target: '4', animated: false, style: { stroke: '#7c3aed55', strokeWidth: 1.5 } },
  { id: 'e3-5', source: '3', target: '5', animated: false, style: { stroke: '#7c3aed55', strokeWidth: 1.5 } },
  { id: 'e4-5', source: '4', target: '5', animated: false, style: { stroke: '#7c3aed55', strokeWidth: 1.5 } },
  { id: 'e5-6', source: '5', target: '6', animated: false, style: { stroke: '#7c3aed55', strokeWidth: 1.5 } },
  { id: 'e6-7', source: '6', target: '7', animated: false, style: { stroke: '#7c3aed55', strokeWidth: 1.5 } },
  { id: 'e6-8', source: '6', target: '8', animated: false, style: { stroke: '#7c3aed55', strokeWidth: 1.5 } },
  { id: 'e7-9', source: '7', target: '9', animated: false, style: { stroke: '#7c3aed55', strokeWidth: 1.5 } },
  { id: 'e8-9', source: '8', target: '9', animated: false, style: { stroke: '#7c3aed55', strokeWidth: 1.5 } },
]

// Available node types for the sidebar
export const NODE_LIBRARY = [
  {
    group: 'Input',
    color: '#06b6d4',
    items: [
      { type: 'imageNode',      label: 'Image Node',    icon: '🖼',  desc: 'Upload & analyze image' },
      { type: 'textInputNode',  label: 'Text Input',    icon: '✏️',  desc: 'Nhập ý tưởng / mô tả' },
      { type: 'styleNode',      label: 'Style',         icon: '🎨',  desc: 'Chọn phong cách video' },
    ]
  },
  {
    group: 'AI Generation',
    color: '#7c3aed',
    items: [
      { type: 'promptNode',      label: 'Prompt Generator',   icon: '✨', desc: 'Tạo image/video prompt' },
      { type: 'scriptNode',      label: 'Script Generator',   icon: '📝', desc: 'Viết kịch bản video' },
      { type: 'storyboardNode',  label: 'Storyboard',         icon: '🎬', desc: 'Tạo storyboard panels' },
      { type: 'videoPromptNode', label: 'Video Prompt',       icon: '🎥', desc: 'Prompt chuyển động video' },
      { type: 'negativeNode',    label: 'Negative Prompt',    icon: '🚫', desc: 'Tránh lỗi AI generation' },
    ]
  },
  {
    group: 'Utility',
    color: '#f59e0b',
    items: [
      { type: 'aspectRatioNode', label: 'Aspect Ratio', icon: '📐', desc: 'Tỷ lệ khung hình' },
      { type: 'durationNode',    label: 'Duration',     icon: '⏱',  desc: 'Thời lượng video' },
      { type: 'languageNode',    label: 'Language',     icon: '🌐', desc: 'Ngôn ngữ đầu ra' },
      { type: 'cameraStyleNode', label: 'Camera Style', icon: '📷', desc: 'Phong cách camera' },
      { type: 'motionStyleNode', label: 'Motion Style', icon: '🌊', desc: 'Kiểu chuyển động' },
    ]
  },
  {
    group: 'Output',
    color: '#10b981',
    items: [
      { type: 'exportNode', label: 'Export', icon: '📤', desc: 'Xuất kết quả cuối cùng' },
    ]
  }
]

let _counter = 1000
export function makeNode(type, label, x = 200, y = 200, extraData = {}) {
  return {
    id: String(++_counter),
    type,
    position: { x, y },
    data: { label, status: 'idle', ...extraData }
  }
}
