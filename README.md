# 🎬 AI Video Workflow Builder

Ứng dụng web chuyên nghiệp để tạo kịch bản video bằng hệ thống workflow kéo thả node trực quan. Tích hợp Google Gemini AI để phân tích hình ảnh, viết kịch bản, tạo prompt và storyboard cho video quảng cáo.

---

## Tính năng nổi bật

- **Canvas kéo thả** — kéo node vào canvas, nối dây giữa các node, zoom/pan
- **14 loại node** — từ Image Analysis đến Export, đầy đủ cho quy trình sản xuất video
- **Chạy workflow thật** — thứ tự topo, truyền data giữa các node, gọi Gemini AI
- **Undo / Redo** — Ctrl+Z / Ctrl+Y, lưu 40 bước lịch sử
- **Auto Layout** — tự động sắp xếp node gọn gàng
- **Export đa định dạng** — TXT, JSON, Markdown
- **Dark mode cao cấp** — giao diện như SaaS thương mại

---

## Cài đặt nhanh

### 1. Cài dependencies

```bash
npm install
```

### 2. Cấu hình API key

```bash
# Sao chép file mẫu
copy .env.example .env
```

Mở file `.env` và điền API key:

```env
VITE_GEMINI_API_KEY=AIzaSy_your_key_here
```

> Lấy API key miễn phí tại: **https://aistudio.google.com/apikey**

### 3. Chạy dev server

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

---

## Không có API key vẫn chạy được

Nếu chưa có `VITE_GEMINI_API_KEY`, app tự động dùng **mock data mẫu tiếng Việt** rất phong phú — bạn vẫn có thể thử toàn bộ giao diện và workflow mà không cần kết nối mạng.

---

## Cấu trúc dự án

```
src/
├── api/
│   └── ggStudio.js          # Google Gemini SDK integration + mock data
├── workflow/
│   └── runner.js            # Workflow execution engine (topological sort)
├── nodes/
│   ├── BaseNode.jsx         # Shared node wrapper (status, handles, UI)
│   ├── ImageNode.jsx        # Upload ảnh + phân tích AI
│   ├── TextInputNode.jsx    # Nhập ý tưởng / mô tả sản phẩm
│   ├── StyleNode.jsx        # Chọn phong cách video
│   ├── PromptNode.jsx       # Tạo image/video prompt
│   ├── ScriptNode.jsx       # Viết kịch bản video
│   ├── StoryboardNode.jsx   # Tạo storyboard panels
│   ├── VideoPromptNode.jsx  # Prompt chuyển động video
│   ├── NegativeNode.jsx     # Negative prompt tránh lỗi AI
│   ├── ExportNode.jsx       # Xuất kết quả
│   ├── AspectRatioNode.jsx  # Tỷ lệ khung hình
│   ├── DurationNode.jsx     # Thời lượng video
│   ├── LanguageNode.jsx     # Ngôn ngữ đầu ra
│   ├── CameraStyleNode.jsx  # Phong cách camera
│   └── MotionStyleNode.jsx  # Kiểu chuyển động
├── components/
│   ├── Sidebar.jsx          # Thư viện node (có search + drag)
│   ├── PropertiesPanel.jsx  # Panel cấu hình node đang chọn
│   ├── BottomPanel.jsx      # Hiển thị kết quả + logs
│   └── Toast.jsx            # Hệ thống toast notification
├── flow/
│   └── nodes.js             # Đăng ký nodeTypes + default workflow
├── App.jsx
└── styles.css

server/
└── index.js                 # Proxy server (tuỳ chọn)
```

---

## Các loại node

### Input Nodes
| Node | Mô tả |
|------|-------|
| **Image Node** | Upload ảnh và phân tích bằng Gemini Vision |
| **Text Input** | Nhập ý tưởng, mô tả sản phẩm, nội dung quảng cáo |
| **Style** | Chọn phong cách: Cinematic, Korean Drama, TikTok Viral... |

### AI Generation Nodes
| Node | Mô tả |
|------|-------|
| **Prompt Generator** | Tạo image/video prompt chi tiết |
| **Script Generator** | Viết kịch bản theo cảnh (TVC, TikTok, Review...) |
| **Storyboard** | Tạo storyboard panels từ kịch bản |
| **Video Prompt** | Prompt chuyển động cho Runway/Kling/Sora |
| **Negative Prompt** | Tránh lỗi mặt, tay, trang phục, chuyển động |

### Utility Nodes
| Node | Mô tả |
|------|-------|
| **Aspect Ratio** | 9:16, 16:9, 1:1, 4:5, 21:9 |
| **Duration** | 5s, 8s, 10s, 15s, 30s, 60s |
| **Language** | Tiếng Việt, English, Song ngữ |
| **Camera Style** | Static, Slow Push-in, Cinematic Dolly... |
| **Motion Style** | Natural, Slow Motion, Fashion Pose Change... |

### Output Nodes
| Node | Mô tả |
|------|-------|
| **Export** | Xuất TXT, JSON, Markdown |

---

## Sử dụng Proxy Server (tuỳ chọn)

Nếu muốn ẩn API key khỏi browser (khuyến nghị cho production):

```bash
# Windows PowerShell
$env:GEMINI_API_KEY = "AIzaSy_your_key"
node server/index.js
```

```bash
# macOS / Linux
GEMINI_API_KEY="AIzaSy_your_key" node server/index.js
```

Thêm vào `.env`:

```env
VITE_GEMINI_PROXY_URL=http://localhost:4000/api/gemini/generate
```

---

## Phím tắt

| Phím | Chức năng |
|------|-----------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + S` | Lưu workflow |
| `Delete` | Xóa node/edge đang chọn |
| `Shift + Click` | Chọn nhiều node |
| `Scroll` | Zoom in/out canvas |
| `Kéo canvas` | Pan (di chuyển màn hình) |

---

## Scripts

```bash
npm run dev          # Chạy dev server (Vite)
npm run build        # Build production
npm run preview      # Preview bản build
npm run start:server # Chạy proxy server
```

---

## Công nghệ sử dụng

- **React 18** + **Vite 5**
- **React Flow 11** — canvas node kéo thả
- **@google/generative-ai** — Gemini SDK
- **Tailwind CSS** (CDN) + custom CSS
- **Express** — proxy server

---

## Lưu ý bảo mật

- **Không commit file `.env`** vào git — file này đã được `.gitignore`
- Đối với production: dùng proxy server để API key không bị lộ trong bundle JavaScript
- API key trong `VITE_*` sẽ được nhúng vào bundle client — chỉ phù hợp cho môi trường phát triển cá nhân
