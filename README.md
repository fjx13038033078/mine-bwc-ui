# 执法视频 AI 检测与视频切割系统 — 前端（plus-ui）

本仓库是「执法记录仪智能分析系统」的前端，基于 **Vue3 + TypeScript + Element Plus + Vite**。围绕 **AI 违规检测** 与 **视频人体切割** 两条业务链路，提供三个核心页面：功能演示、检测记录、视频切割。

> 配套后端：`RuoYi-Cloud-Plus / ruoyi-camera`（业务编排）+ `cameraAi`（FastAPI AI 服务）。

---

## 一、页面总览

| 页面 | 路径 | 业务链路 | 主要能力 |
|------|------|----------|----------|
| **功能演示** | `src/views/camera/test/index.vue` | AI 检测（HTTP 同步） | 拖拽上传视频 → 实时返回违规事件、事件明细、**相关规章制度** |
| **检测记录** | `src/views/camera/fileRecord/index.vue` | AI 检测（MQ 异步） | 列表筛选、详情报告、关键帧截图、规章制度、人工复判 |
| **视频切割** | `src/views/camera/videoClip/index.vue` | 视频切割 | 切片列表、播放、下载、刷新预签名 URL、自动轮询 |

## 二、AI 检测 — 检测记录页

- **列表筛选**：视频序列号、用户、来源设备、媒体类型、数据来源、AI 检测状态、拍摄时间；默认仅显示 AI 检测数据（`dataSource=scan`）。
- **状态/违规标签**：实时显示 AI 检测状态与违规标记（红色醒目）。
- **详情对话框**：
  - 基础信息（序列号、用户、时长、违规时间区间等）；
  - **关键帧截图**：违规帧可点击放大预览；
  - **违规事件明细**：解析 `eventsJson`，按事件分条折叠展示，每条带独立的「**相关规章制度**」高亮区块；
  - 无结构化事件时回退到 `aiCheckResult` 文本展示（兼容历史数据）；
  - **人工复判**：可对 AI 判定进行二次确认/纠正。

## 三、AI 检测 — 功能演示页

- 拖拽上传单个视频（`camera/management/upload`，透传至 Python `analyze_url`）；
- 实时展示 **安全违规报告**（`unsafe_events`，折叠面板，含事件描述 + **相关规章制度**）与 **事件记录表格**（`events`）；
- 支持事件记录导出 CSV。

## 四、视频切割页

- 按原视频文件名搜索、按切片状态筛选；
- 展示原视频文件名、切片总数、当前片段（第 N/M 段）、起止秒、时长、文件大小、状态；
- **播放 / 下载 / 刷新 URL**：均先调用 `refreshClipUrl` 重新生成预签名地址，规避过期；
- **智能自动刷新**：列表存在「处理中」切片时自动轮询，全部完成后自动暂停，可手动开关。

## 五、目录结构

```
src/views/camera/
├── test/index.vue          # 功能演示（上传分析）
├── fileRecord/index.vue    # 检测记录（AI 检测结果管理）
└── videoClip/index.vue     # 视频切割（切片管理）

src/api/
├── camera/management/      # 检测记录 API + 类型（含 eventsJson）
├── camera/videoClip/       # 视频切割 API + 类型
└── videoUpload/            # 功能演示上传 API（含 regulations 字段）
```

## 六、数据字典

| 字典类型 | 说明 |
|---------|------|
| `camera_data_source` | 数据来源（`scan`=AI 检测扫描 / `clip`=视频切割扫描） |
| `ai_check_status` | AI 检测状态（0=待检测, 1=检测中, 2=已完成, 3=失败） |

## 七、本地运行

```bash
# 安装依赖
npm install --registry=https://registry.npmmirror.com

# 启动开发服务
npm run dev

# 构建生产环境
npm run build:prod
```

> 前端技术底座基于 RuoYi Plus UI（Vue3 + TS + Element Plus + Vite），框架自身的通用能力详见其官方仓库，此处不再赘述。
