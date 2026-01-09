<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!-- 左侧上传区域 -->
      <el-col :lg="8" :xs="24">
        <el-card shadow="hover">
          <template #header>
            <span>视频上传</span>
          </template>

          <div class="upload-file">
            <!-- 上传按钮 -->
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              :accept="fileAccept"
              :disabled="loading"
              drag
            >
              <el-icon class="el-icon--upload" :size="67">
                <i-ep-upload-filled />
              </el-icon>
              <div class="el-upload__text">将视频文件拖到此处，或<em>点击上传</em></div>
            </el-upload>

            <!-- 上传提示 -->
            <div class="el-upload__tip" style="margin-top: 10px">
              请上传大小不超过 <b style="color: #f56c6c">500MB</b>，格式为 <b style="color: #f56c6c">MP4/AVI/MOV/MKV</b> 的视频文件
            </div>

            <!-- 文件列表 -->
            <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
              <li v-if="form.file" key="video-file" class="el-upload-list__item ele-upload-list__item-content">
                <div class="file-info-wrapper">
                  <el-icon class="el-icon--document" color="#409EFF" :size="20">
                    <i-ep-video-play />
                  </el-icon>
                  <span class="file-name-text">{{ form.file.name }}</span>
                  <span class="file-size-text">({{ formatFileSize(form.file.size) }})</span>
                </div>
                <div class="ele-upload-list__item-content-action">
                  <el-button type="danger" link @click="handleRemove" :disabled="loading">删除</el-button>
                </div>
              </li>
            </transition-group>

            <!-- 操作按钮 -->
            <el-row :gutter="10" style="margin-top: 20px">
              <el-col :span="12">
                <el-button type="primary" icon="Upload" :loading="loading" :disabled="!form.file" @click="handleUpload" style="width: 100%">
                  {{ loading ? '分析中' : '开始分析' }}
                </el-button>
              </el-col>
              <el-col :span="12">
                <el-button icon="RefreshRight" :disabled="loading" @click="handleReset" style="width: 100%">重置</el-button>
              </el-col>
            </el-row>

            <!-- 进度显示 -->
            <div v-if="loading" style="margin-top: 20px">
              <el-progress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : undefined" />
              <div class="text-center" style="color: #909399; font-size: 12px; margin-top: 8px">正在上传并分析视频，请稍候...</div>
            </div>
          </div>
        </el-card>

        <!-- 使用说明 -->
        <el-card shadow="hover" style="margin-top: 20px">
          <template #header>
            <span>使用说明</span>
          </template>
          <el-alert type="info" :closable="false">
            <ul style="margin: 0; padding-left: 20px; line-height: 2">
              <li>支持 MP4、AVI、MOV、MKV 视频格式</li>
              <li>视频大小建议不超过 500MB</li>
              <li>分析完成后将自动展示结果</li>
              <li>支持导出分析结果为 CSV 文件</li>
            </ul>
          </el-alert>
        </el-card>
      </el-col>

      <!-- 右侧结果区域 -->
      <el-col :lg="16" :xs="24">
        <el-card shadow="hover">
          <template #header>
            <el-row :gutter="10">
              <el-col :span="1.5">
                <span>分析结果</span>
                <el-tag v-if="total > 0" type="success" effect="plain" style="margin-left: 10px">{{ total }} 条事件</el-tag>
              </el-col>
              <right-toolbar v-model:show-search="showSearch" @query-table="getList" v-if="total > 0">
                <template #right>
                  <el-button type="primary" icon="Download" @click="handleExport">导出</el-button>
                </template>
              </right-toolbar>
            </el-row>
          </template>

          <!-- 空状态 -->
          <div v-if="eventList.length === 0" style="padding: 60px 0; text-align: center">
            <el-empty description="暂无分析结果">
              <template #description>
                <span style="color: #909399">上传视频后，分析结果将在此处展示</span>
              </template>
            </el-empty>
          </div>

          <!-- 结果表格 -->
          <div v-else>
            <el-table v-loading="loading" border :data="eventList" style="width: 100%">
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column
                v-for="column in tableColumns"
                :key="column.prop"
                :prop="column.prop"
                :label="column.label"
                :width="column.width"
                :min-width="column.minWidth"
                :align="column.align || 'center'"
                :show-overflow-tooltip="column.showOverflowTooltip"
              >
                <template #default="scope">
                  <template v-if="column.prop === 'serial_number'">
                    <el-tag type="primary" effect="plain">{{ scope.row[column.prop] }}</el-tag>
                  </template>
                  <template v-else-if="column.prop === 'unit_number' || column.prop === 'user_number'">
                    <el-tag type="info" effect="plain">{{ scope.row[column.prop] }}</el-tag>
                  </template>
                  <template v-else>
                    {{ scope.row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="VideoUpload" lang="ts">
import { uploadVideo, VideoEvent, VideoUploadResponse } from '@/api/videoUpload/videoUpload';
import type { UploadFile, UploadInstance } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 表单数据
interface UploadForm {
  file: File | null;
}

const uploadRef = ref<UploadInstance>();
const loading = ref(false);
const showSearch = ref(false);
const uploadProgress = ref(0);
const eventList = ref<VideoEvent[]>([]);
const total = ref(0);

// 文件类型配置
const fileType = ['mp4', 'avi', 'mov', 'mkv'];
const fileAccept = fileType.map((type) => `.${type}`).join(',');
const fileSize = 500; // MB

const initFormData: UploadForm = {
  file: null
};

const data = reactive<{
  form: UploadForm;
}>({
  form: { ...initFormData }
});

const { form } = toRefs(data);

/** 处理文件选择 */
const handleFileChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;

  // 校验文件类型
  const fileName = file.name.split('.');
  const fileExt = fileName[fileName.length - 1].toLowerCase();
  const isTypeOk = fileType.includes(fileExt);
  if (!isTypeOk) {
    proxy?.$modal.msgError(`文件格式不正确, 请上传 ${fileType.join('/')} 格式文件!`);
    uploadRef.value?.clearFiles();
    return;
  }

  // 校验文件大小
  const isLt = file.size / 1024 / 1024 < fileSize;
  if (!isLt) {
    proxy?.$modal.msgError(`上传文件大小不能超过 ${fileSize}MB!`);
    uploadRef.value?.clearFiles();
    return;
  }

  form.value.file = file;
  proxy?.$modal.msgSuccess(`已选择文件：${file.name}`);
};

/** 移除文件 */
const handleRemove = () => {
  form.value.file = null;
  uploadRef.value?.clearFiles();
  eventList.value = [];
  total.value = 0;
};

/** 表格列配置 */
interface TableColumn {
  prop: string;
  label: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'left' | 'center' | 'right';
  showOverflowTooltip?: boolean;
}

const tableColumns = ref<TableColumn[]>([
  { prop: 'date', label: '日期', width: 110, align: 'center' },
  { prop: 'start_time', label: '开始时间', width: 110, align: 'center' },
  { prop: 'end_time', label: '结束时间', width: 110, align: 'center' },
  { prop: 'serial_number', label: '序列号', width: 120, align: 'center' },
  { prop: 'unit_number', label: '单元编号', width: 120, align: 'center' },
  { prop: 'user_number', label: '用户编号', width: 120, align: 'center' },
  { prop: 'event_description', label: '事件描述', minWidth: 300, align: 'center', showOverflowTooltip: true }
]);

/** 重置表单 */
const handleReset = () => {
  form.value = { ...initFormData };
  uploadRef.value?.clearFiles();
  uploadProgress.value = 0;
  eventList.value = [];
  total.value = 0;
};

/** 格式化文件大小 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/** 查询列表（用于 RightToolbar 回调） */
const getList = () => {
  // 视频上传页面不需要实际的列表查询功能，保留空函数以兼容 RightToolbar
};

/** 上传文件 */
const handleUpload = async () => {
  if (!form.value.file) {
    proxy?.$modal.msgWarning('请先选择要上传的视频文件');
    return;
  }

  loading.value = true;
  uploadProgress.value = 0;
  eventList.value = [];
  total.value = 0;

  try {
    const formData = new FormData();
    formData.append('file', form.value.file);

    const response: any = await uploadVideo(formData, (progressEvent: any) => {
      if (progressEvent.total) {
        uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      }
    });

    uploadProgress.value = 100;

    // response 包含 code、msg、data 字段
    if (response?.data?.analysis_result?.events && response.data.analysis_result.events.length > 0) {
      eventList.value = response.data.analysis_result.events;
      total.value = eventList.value.length;
      proxy?.$modal.msgSuccess(response.data.message || response.msg || '视频分析完成');
    } else {
      proxy?.$modal.msgWarning(response?.data?.message || response?.msg || '未检测到事件');
    }
  } catch (error) {
    console.error('上传失败:', error);
    proxy?.$modal.msgError('上传失败，请检查网络连接');
  } finally {
    loading.value = false;
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  if (eventList.value.length === 0) {
    proxy?.$modal.msgWarning('暂无数据可导出');
    return;
  }

  // 转换为CSV格式
  const headers = tableColumns.value.map((col) => col.label).join(',');
  const rows = eventList.value.map((row) => {
    return tableColumns.value
      .map((col) => {
        const value = row[col.prop] || '';
        return `"${value}"`;
      })
      .join(',');
  });

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `视频分析结果_${new Date().getTime()}.csv`;
  link.click();

  proxy?.$modal.msgSuccess('导出成功');
};
</script>

<style scoped lang="scss">
/* 文件上传组件样式（参考 FileUpload 组件） */
.upload-file {
  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    padding: 40px 20px;
  }

  .el-icon--upload {
    color: #409eff;
  }

  .el-upload__text {
    margin: 16px 0 0;
    line-height: 1.8;

    em {
      color: #409eff;
      font-style: normal;
    }
  }

  .el-upload__tip {
    line-height: 1.8;
    color: #606266;
    font-size: 12px;
  }
}

/* 文件列表样式（参考 FileUpload 组件） */
.upload-file-list {
  margin-top: 10px;
  padding: 0;
  list-style: none;

  .el-upload-list__item {
    border: 1px solid #e4e7ed;
    line-height: 2;
    margin-bottom: 10px;
    padding: 8px 10px;
    position: relative;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .ele-upload-list__item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: inherit;

    .file-info-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;

      .file-name-text {
        font-size: 14px;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-size-text {
        font-size: 12px;
        color: #909399;
        flex-shrink: 0;
      }
    }

    .ele-upload-list__item-content-action {
      flex-shrink: 0;
      margin-left: 10px;
    }
  }
}

/* 响应式布局 */
@media (max-width: 1200px) {
  :deep(.el-col-lg-8) {
    max-width: 100%;
    flex: 0 0 100%;
    margin-bottom: 20px;
  }

  :deep(.el-col-lg-16) {
    max-width: 100%;
    flex: 0 0 100%;
  }
}
</style>
