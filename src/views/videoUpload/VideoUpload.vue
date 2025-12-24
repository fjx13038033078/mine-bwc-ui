<template>
  <div class="page-wrapper">
    <!-- 顶部导航栏 -->
    <!-- <header class="page-header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="32"><VideoCamera /></el-icon>
          <span>视频智能分析系统</span>
        </div>
        <div class="header-info">
          <el-tag effect="dark" type="info">v1.0</el-tag>
        </div>
      </div>
    </header> -->

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧上传区域 -->
      <section class="upload-section">
        <el-card class="upload-card" shadow="hover">
          <div class="section-title">
            <el-icon :size="22" color="#409EFF"><UploadFilled /></el-icon>
            <span>上传视频</span>
          </div>

          <!-- 上传区域 -->
          <el-upload
            ref="uploadRef"
            class="video-uploader"
            drag
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept=".mp4,.avi,.mov,.mkv"
          >
            <div v-if="!selectedFile" class="upload-placeholder">
              <div class="upload-icon-wrapper">
                <el-icon class="upload-icon" :size="48"><UploadFilled /></el-icon>
              </div>
              <div class="upload-text">
                <p class="main-text">拖拽视频文件到此处</p>
                <p class="sub-text">或 <em>点击选择文件</em></p>
              </div>
              <div class="format-tags">
                <el-tag size="small" type="info">MP4</el-tag>
                <el-tag size="small" type="info">AVI</el-tag>
                <el-tag size="small" type="info">MOV</el-tag>
                <el-tag size="small" type="info">MKV</el-tag>
              </div>
            </div>

            <div v-else class="file-selected">
              <div class="file-icon">
                <el-icon :size="40" color="#409EFF"><VideoPlay /></el-icon>
              </div>
              <div class="file-details">
                <p class="file-name">{{ selectedFile.name }}</p>
                <p class="file-meta">
                  <span>{{ formatFileSize(selectedFile.size) }}</span>
                  <el-tag size="small" type="success">已选择</el-tag>
                </p>
              </div>
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click.stop="removeFile"
              />
            </div>
          </el-upload>

          <!-- 操作按钮 -->
          <div class="action-area">
            <el-button
              type="primary"
              size="large"
              :icon="Upload"
              :loading="isUploading"
              :disabled="!selectedFile"
              @click="uploadFile"
              class="upload-btn"
            >
              {{ isUploading ? `分析中 ${uploadProgress}%` : '开始分析' }}
            </el-button>
            <el-button
              size="large"
              :icon="RefreshRight"
              :disabled="isUploading"
              @click="resetForm"
            >
              重置
            </el-button>
          </div>

          <!-- 进度显示 -->
          <div v-if="isUploading" class="progress-area">
            <el-progress
              :percentage="uploadProgress"
              :stroke-width="12"
              :status="uploadProgress === 100 ? 'success' : undefined"
            />
            <p class="progress-text">正在上传并分析视频，请稍候...</p>
          </div>

          <!-- 错误提示 -->
          <el-alert
            v-if="uploadError"
            title="分析失败"
            type="error"
            :description="uploadResult"
            show-icon
            :closable="false"
            style="margin-top: 20px"
          />
        </el-card>

        <!-- 使用说明 -->
        <el-card class="tips-card" shadow="hover">
          <div class="section-title">
            <el-icon :size="22" color="#E6A23C"><InfoFilled /></el-icon>
            <span>使用说明</span>
          </div>
          <ul class="tips-list">
            <li><el-icon><Check /></el-icon>支持 MP4、AVI、MOV、MKV 格式</li>
            <li><el-icon><Check /></el-icon>视频大小建议不超过 500MB</li>
            <li><el-icon><Check /></el-icon>分析完成后将自动展示结果</li>
          </ul>
        </el-card>
      </section>

      <!-- 右侧结果区域 -->
      <section class="result-section" :class="{ 'has-data': eventsData.length > 0 }">
        <el-card class="result-card" shadow="hover">
          <div class="section-title">
            <el-icon :size="22" color="#67C23A"><List /></el-icon>
            <span>分析结果</span>
            <el-tag v-if="eventsData.length > 0" type="success" effect="dark" class="count-tag">
              {{ eventsData.length }} 条事件
            </el-tag>
          </div>

          <!-- 空状态 -->
          <div v-if="eventsData.length === 0" class="empty-state">
            <el-empty description="暂无分析结果">
              <template #image>
                <el-icon :size="80" color="#dcdfe6"><Document /></el-icon>
              </template>
              <p class="empty-tip">上传视频后，分析结果将在此处展示</p>
            </el-empty>
          </div>

          <!-- 结果表格 -->
          <div v-else class="table-wrapper">
            <el-table
              :data="eventsData"
              stripe
              border
              style="width: 100%"
              max-height="calc(100vh - 320px)"
              :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: '600' }"
            >
              <el-table-column type="index" label="#" width="60" align="center" fixed="left" />
              <el-table-column
                v-for="key in getOrderedColumns(eventsData)"
                :key="key"
                :prop="key"
                :label="formatColumnLabel(key)"
                :min-width="getColumnWidth(key)"
                :align="key === 'event_description' ? 'left' : 'center'"
              >
                <template #default="{ row }">
                  <div class="cell-content" :class="getCellClass(key)">
                    <template v-if="key === 'confidence' || key === 'score'">
                      <el-progress 
                        :percentage="Number((row[key] * 100).toFixed(1))" 
                        :stroke-width="10"
                        :text-inside="true"
                        :status="row[key] > 0.8 ? 'success' : row[key] > 0.5 ? '' : 'warning'"
                      />
                    </template>
                    <template v-else-if="key === 'type' || key === 'event_type' || key === 'label'">
                      <el-tag :type="getTagType(row[key])">{{ row[key] }}</el-tag>
                    </template>
                    <template v-else-if="key === 'event_description'">
                      <el-popover
                        placement="top-start"
                        :width="400"
                        trigger="hover"
                        :content="row[key]"
                      >
                        <template #reference>
                          <div class="description-cell">{{ row[key] }}</div>
                        </template>
                      </el-popover>
                    </template>
                    <template v-else-if="key === 'serial_number'">
                      <el-tag type="primary" effect="plain">{{ row[key] }}</el-tag>
                    </template>
                    <template v-else-if="key === 'unit_number' || key === 'user_number'">
                      <el-tag type="info" effect="plain">{{ row[key] }}</el-tag>
                    </template>
                    <template v-else-if="key === 'date'">
                      <span class="date-cell">{{ row[key] }}</span>
                    </template>
                    <template v-else-if="key === 'start_time' || key === 'end_time'">
                      <span class="time-cell">{{ row[key] }}</span>
                    </template>
                    <template v-else>
                      {{ row[key] }}
                    </template>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </section>
    </main>

    <!-- 底部信息 -->
    <!-- <footer class="page-footer">
      <span>© 2025 视频智能分析系统</span>
    </footer> -->
  </div>
</template>

<script setup>
  import { getToken } from '@/utils/auth';
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import {
  VideoCamera,
  UploadFilled,
  VideoPlay,
  Delete,
  Upload,
  RefreshRight,
  List,
  InfoFilled,
  Check,
  Document
} from '@element-plus/icons-vue'

// 响应式状态
const uploadRef = ref(null)
const selectedFile = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref(null)
const uploadError = ref(false)
const eventsData = ref([])

// API 地址 (通过代理访问，解决跨域问题)
const apiUrl = '/dev-api/camera/camera/management/upload'

// 处理文件选择
const handleFileChange = (uploadFile) => {
  const file = uploadFile.raw
  
  if (!file) return
  
  const validExtensions = ['mp4', 'avi', 'mov', 'mkv']
  const fileExtension = file.name.split('.').pop().toLowerCase()
  
  if (!validExtensions.includes(fileExtension)) {
    ElMessage.error('请上传支持的视频格式：MP4、AVI、MOV、MKV')
    return
  }
  
  selectedFile.value = file
  uploadResult.value = null
  uploadError.value = false
  
  ElMessage.success(`已选择文件：${file.name}`)
}

// 移除文件
const removeFile = () => {
  selectedFile.value = null
  uploadRef.value?.clearFiles()
  uploadResult.value = null
  uploadError.value = false
  eventsData.value = []
}

// 格式化列标签
const formatColumnLabel = (key) => {
  const labelMap = {
    'date': '日期',
    'start_time': '开始时间',
    'end_time': '结束时间',
    'event_description': '事件描述',
    'serial_number': '序列号',
    'unit_number': '单元编号',
    'user_number': '用户编号',
    'time': '时间',
    'timestamp': '时间戳',
    'type': '类型',
    'event_type': '事件类型',
    'description': '描述',
    'content': '内容',
    'label': '标签',
    'confidence': '置信度',
    'score': '分数',
    'duration': '时长',
    'frame': '帧',
    'id': 'ID',
    'name': '名称'
  }
  return labelMap[key] || key
}

// 定义列顺序
const columnOrder = ['date', 'start_time', 'end_time', 'serial_number', 'unit_number', 'user_number', 'event_description']

// 获取排序后的列
const getOrderedColumns = (data) => {
  if (!data || data.length === 0) return []
  const keys = Object.keys(data[0])
  return keys.sort((a, b) => {
    const indexA = columnOrder.indexOf(a)
    const indexB = columnOrder.indexOf(b)
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
}

// 获取列宽度
const getColumnWidth = (key) => {
  const widthMap = {
    'event_description': 400,
    'date': 110,
    'start_time': 100,
    'end_time': 100,
    'serial_number': 110,
    'unit_number': 110,
    'user_number': 100,
    'description': 350,
    'content': 250,
    'time': 100,
    'timestamp': 120,
    'type': 100,
    'event_type': 100,
    'label': 100,
    'confidence': 130,
    'score': 130,
    'id': 70,
    'frame': 70
  }
  return widthMap[key] || 120
}

// 获取单元格样式类
const getCellClass = (key) => {
  if (['description', 'content', 'event_description'].includes(key)) {
    return 'text-left'
  }
  return ''
}

// 获取标签类型
const getTagType = (value) => {
  const typeMap = {
    '人物': 'primary',
    '车辆': 'success',
    '动物': 'warning',
    '物体': 'info',
    '场景': 'danger'
  }
  if (typeMap[value]) return typeMap[value]
  const types = ['primary', 'success', 'warning', 'info', 'danger', '']
  const hash = value ? value.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0
  return types[hash % types.length]
}

// 重置表单
const resetForm = () => {
  removeFile()
  uploadProgress.value = 0
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 上传文件
const uploadFile = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择要上传的视频文件')
    return
  }
  
  isUploading.value = true
  uploadProgress.value = 0
  uploadResult.value = null
  uploadError.value = false
  eventsData.value = []
  
  const formDataToSend = new FormData()
  formDataToSend.append('file', selectedFile.value)
  
  try {
    const response = await axios.post(apiUrl, formDataToSend, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'clientid': import.meta.env.VITE_APP_CLIENT_ID,
        'Authorization': 'Bearer ' + getToken()
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        }
      }
    })
    
    isUploading.value = false
    uploadProgress.value = 100
    uploadResult.value = JSON.stringify(response.data, null, 2)
    
    if (response.data.data?.analysis_result?.events) {
      eventsData.value = response.data.data.analysis_result.events
    }
    
    ElMessage.success('分析完成！')
    
  } catch (error) {
    isUploading.value = false
    uploadError.value = true
    
    if (error.response) {
      uploadResult.value = `HTTP ${error.response.status}: ${error.response.statusText}\n${JSON.stringify(error.response.data, null, 2)}`
      ElMessage.error(`请求失败: ${error.response.status}`)
    } else if (error.request) {
      uploadResult.value = '网络错误，请检查网络连接和接口地址'
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      uploadResult.value = error.message
      ElMessage.error('请求失败')
    }
  }
}
</script>

<style scoped>
/* 页面整体布局 */
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* background: #f0f2f5; */
}

/* 顶部导航 */
.page-header {
  background: linear-gradient(135deg, #1d3557 0%, #457b9d 100%);
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 12px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* 左侧上传区域 */
.upload-section {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-card,
.tips-card,
.result-card {
  border-radius: 12px;
  border: rgba(0, 0, 0, 0.08) 1px solid;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.count-tag {
  margin-left: auto;
}

/* 上传区域 */
.video-uploader {
  width: 100%;
}

.video-uploader :deep(.el-upload) {
  width: 100%;
}

.video-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: auto;
  padding: 30px 20px;
  border-radius: 12px;
  border: 2px dashed #dcdfe6;
  transition: all 0.3s;
  background: #fafafa;
}

.video-uploader :deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
  background: #ecf5ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF 0%, #79bbff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  color: #fff;
}

.upload-text {
  text-align: center;
}

.upload-text .main-text {
  font-size: 16px;
  color: #606266;
  margin: 0 0 4px 0;
}

.upload-text .sub-text {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.upload-text .sub-text em {
  color: #409EFF;
  font-style: normal;
  cursor: pointer;
}

.format-tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* 已选择文件 */
.file-selected {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px;
  background: #f0f9eb;
  border-radius: 8px;
}

.file-icon {
  width: 56px;
  height: 56px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 13px;
  color: #909399;
}

/* 操作按钮 */
.action-area {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.upload-btn {
  flex: 1;
}

/* 进度区域 */
.progress-area {
  margin-top: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.progress-text {
  text-align: center;
  color: #909399;
  font-size: 13px;
  margin: 12px 0 0 0;
}

/* 使用说明 */
.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  color: #606266;
  font-size: 14px;
  border-bottom: 1px dashed #ebeef5;
}

.tips-list li:last-child {
  border-bottom: none;
}

.tips-list li .el-icon {
  color: #67C23A;
}

/* 右侧结果区域 */
.result-section {
  flex: 1;
  min-width: 0;
}

.result-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.result-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  margin-top: 12px;
}

/* 表格容器 */
.table-wrapper {
  flex: 1;
  overflow: hidden;
}

/* 表格样式 */
.result-card :deep(.el-table) {
  border-radius: 8px;
  font-size: 13px;
}

.result-card :deep(.el-table th.el-table__cell) {
  padding: 12px 0;
  font-size: 13px;
}

.result-card :deep(.el-table td.el-table__cell) {
  padding: 10px 0;
}

.result-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: #fafbfc;
}

.result-card :deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: #ecf5ff !important;
}

/* 单元格样式 */
.cell-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-content.text-left {
  justify-content: flex-start;
  text-align: left;
}

.description-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
  padding: 4px 8px;
}

.description-cell:hover {
  color: #409EFF;
}

.date-cell {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  color: #606266;
}

.time-cell {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  color: #409EFF;
  font-weight: 500;
}

.cell-content :deep(.el-progress) {
  width: 100%;
  max-width: 100px;
}

.cell-content :deep(.el-tag) {
  font-size: 12px;
}

/* 底部 */
.page-footer {
  padding: 16px 24px;
  text-align: center;
  color: #909399;
  font-size: 13px;
  background: #fff;
  border-top: 1px solid #ebeef5;
}

/* 响应式 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .upload-section {
    width: 100%;
  }
  
  .result-section {
    min-height: 500px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .page-header {
    padding: 0 16px;
  }
  
  .logo span {
    display: none;
  }
}
</style>
