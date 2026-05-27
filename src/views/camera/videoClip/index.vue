<template>
  <div class="video-clip-page">
    <!-- 搜索区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="90px">
            <el-form-item label="原视频文件名" prop="sourceFileName">
              <el-input v-model="queryParams.sourceFileName" placeholder="请输入原视频文件名" clearable style="width: 260px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="切片状态" prop="clipStatus">
              <el-select v-model="queryParams.clipStatus" placeholder="请选择状态" clearable style="width: 140px">
                <el-option label="处理中" :value="0" />
                <el-option label="完成" :value="1" />
                <el-option label="失败" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card class="video-clip-table-card" shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['camera:videoClip:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleBatchDelete">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" :columns="columns" @query-table="getList" />
        </el-row>
      </template>

      <el-table v-loading="loading" class="video-clip-table" :data="dataList" border fit style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column v-if="columns[0].visible" label="原视频文件名" align="center" prop="sourceFileName" min-width="240" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[1].visible" label="切片总数" align="center" prop="sourceClipCount" width="100">
          <template #default="scope">
            <el-tag type="info" effect="plain">{{ scope.row.sourceClipCount ?? '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[2].visible" label="当前片段" align="center" width="110">
          <template #default="scope">
            <span v-if="scope.row.sourceClipCount != null && scope.row.sourceClipCount > 0">
              第 {{ (scope.row.clipIndex ?? 0) + 1 }} / {{ scope.row.sourceClipCount }} 段
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[3].visible" label="起始(秒)" align="center" prop="startSecond" width="90">
          <template #default="scope">{{ scope.row.startSecond?.toFixed(1) }}</template>
        </el-table-column>
        <el-table-column v-if="columns[4].visible" label="结束(秒)" align="center" prop="endSecond" width="90">
          <template #default="scope">{{ scope.row.endSecond?.toFixed(1) }}</template>
        </el-table-column>
        <el-table-column v-if="columns[5].visible" label="时长(秒)" align="center" prop="durationSeconds" width="90">
          <template #default="scope">{{ scope.row.durationSeconds?.toFixed(1) }}</template>
        </el-table-column>
        <el-table-column v-if="columns[6].visible" label="文件大小" align="center" prop="fileSize" width="110">
          <template #default="scope">{{ formatFileSize(scope.row.fileSize) }}</template>
        </el-table-column>
        <el-table-column v-if="columns[7].visible" label="状态" align="center" prop="clipStatus" width="90">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.clipStatus)">{{ getStatusLabel(scope.row.clipStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[8].visible" label="失败信息" align="center" prop="errorMessage" min-width="160" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[9].visible" label="创建时间" align="center" prop="createTime" min-width="160">
          <template #default="scope">{{ parseTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="播放切片" placement="top">
              <el-button
                v-hasPermi="['camera:videoClip:query']"
                link type="primary" icon="VideoPlay"
                :disabled="scope.row.clipStatus !== 1"
                @click="handlePlay(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="下载切片" placement="top">
              <el-button
                v-hasPermi="['camera:videoClip:query']"
                link type="primary" icon="Download"
                :disabled="scope.row.clipStatus !== 1"
                @click="handleDownload(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="刷新URL" placement="top">
              <el-button
                v-hasPermi="['camera:videoClip:query']"
                link type="primary" icon="Refresh"
                :disabled="scope.row.clipStatus !== 1"
                @click="handleRefreshUrl(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['camera:videoClip:remove']" link type="danger" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 视频播放对话框 -->
    <el-dialog v-model="playDialog.visible" :title="playDialog.title" width="860px" append-to-body :before-close="handlePlayClose">
      <div class="video-player-container">
        <video
          v-if="playDialog.url"
          ref="videoRef"
          class="clip-video-player"
          controls
          autoplay
          :src="playDialog.url"
          @error="handleVideoError"
        >
          您的浏览器不支持 HTML5 视频播放
        </video>
        <div v-else class="video-loading">
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
          <p>正在加载视频...</p>
        </div>
      </div>
      <div class="clip-info-bar">
        <span><el-icon><Timer /></el-icon> 起始：{{ playDialog.startSecond?.toFixed(1) }}s</span>
        <span><el-icon><Timer /></el-icon> 结束：{{ playDialog.endSecond?.toFixed(1) }}s</span>
        <span><el-icon><Clock /></el-icon> 时长：{{ playDialog.durationSeconds?.toFixed(1) }}s</span>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, getCurrentInstance, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listVideoClip, delVideoClip, refreshClipUrl } from '@/api/camera/videoClip';
import type { VideoClipVO, VideoClipQuery } from '@/api/camera/videoClip/types';

const { proxy } = getCurrentInstance()!;

// ---------- 搜索 ----------
const showSearch = ref(true);
const queryFormRef = ref();
const queryParams = reactive<VideoClipQuery>({
  pageNum: 1,
  pageSize: 10,
  sourceFileName: undefined,
  clipStatus: undefined
});

// ---------- 表格 ----------
const loading = ref(false);
const dataList = ref<VideoClipVO[]>([]);
const total = ref(0);
const multiple = ref(true);
const selectedIds = ref<number[]>([]);

const columns = ref([
  { key: 0, label: '原视频文件名', visible: true },
  { key: 1, label: '切片总数', visible: true },
  { key: 2, label: '当前片段', visible: true },
  { key: 3, label: '起始(秒)', visible: true },
  { key: 4, label: '结束(秒)', visible: true },
  { key: 5, label: '时长(秒)', visible: true },
  { key: 6, label: '文件大小', visible: true },
  { key: 7, label: '状态', visible: true },
  { key: 8, label: '失败信息', visible: false },
  { key: 9, label: '创建时间', visible: true }
]);

// ---------- 播放对话框 ----------
const playDialog = reactive({
  visible: false,
  title: '',
  url: '',
  startSecond: 0,
  endSecond: 0,
  durationSeconds: 0
});
const videoRef = ref<HTMLVideoElement>();
/** 关闭播放器时的清理会触发 video error，需忽略 */
const ignoreVideoError = ref(false);

// ---------- 状态辅助 ----------
const getStatusType = (status: number) => {
  const map: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'danger' };
  return map[status] ?? 'info';
};
const getStatusLabel = (status: number) => {
  const map: Record<number, string> = { 0: '处理中', 1: '完成', 2: '失败' };
  return map[status] ?? '未知';
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
};

// ---------- 数据加载 ----------
const getList = async () => {
  loading.value = true;
  try {
    const res = await listVideoClip(queryParams);
    dataList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.sourceFileName = undefined;
  queryParams.clipStatus = undefined;
  handleQuery();
};

// ---------- 选择 ----------
const handleSelectionChange = (selection: VideoClipVO[]) => {
  selectedIds.value = selection.map(s => s.clipId);
  multiple.value = selection.length === 0;
};

// ---------- 播放 ----------
const handlePlay = async (row: VideoClipVO) => {
  let url = '';
  try {
    // 切片入库时保存的是 Python 生成的 24 小时预签名 URL。
    // 播放前统一由 Java 重新生成，避免使用已过期或配置不一致的旧 URL。
    const res = await refreshClipUrl(row.clipId);
    url = res.data?.url ?? row.url;
  } catch {
    url = row.url;
  }
  if (!url) {
    ElMessage.error('获取播放地址失败');
    return;
  }
  playDialog.url = url;
  playDialog.title = `切片播放 - ${row.sourceFileName || '未知文件'}（第 ${(row.clipIndex ?? 0) + 1} 段）`;
  playDialog.startSecond = row.startSecond;
  playDialog.endSecond = row.endSecond;
  playDialog.durationSeconds = row.durationSeconds;
  playDialog.visible = true;
};

const handlePlayClose = (done?: () => void) => {
  ignoreVideoError.value = true;
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.removeAttribute('src');
    videoRef.value.load();
  }
  playDialog.url = '';
  playDialog.visible = false;
  done?.();
  nextTick(() => {
    ignoreVideoError.value = false;
  });
};

const handleVideoError = () => {
  if (ignoreVideoError.value || !playDialog.visible) {
    return;
  }
  ElMessage.warning('视频加载失败，URL可能已过期，请刷新URL后重试');
};

// ---------- 下载 ----------
const handleDownload = async (row: VideoClipVO) => {
  let url = '';
  try {
    // 下载前先刷新一次，避免数据库里的 URL 已过期
    const res = await refreshClipUrl(row.clipId);
    url = res.data?.url ?? row.url;
  } catch {
    url = row.url;
  }
  if (!url) {
    ElMessage.error('获取下载地址失败');
    return;
  }
  const a = document.createElement('a');
  a.href = url;
  const baseName = row.sourceFileName?.replace(/\.[^/.]+$/, '') || `clip_${row.videoId}`;
  a.download = `${baseName}_片段${(row.clipIndex ?? 0) + 1}.mp4`;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ---------- 刷新URL ----------
const handleRefreshUrl = async (row: VideoClipVO) => {
  try {
    await refreshClipUrl(row.clipId);
    ElMessage.success('URL刷新成功');
    getList();
  } catch {
    ElMessage.error('URL刷新失败');
  }
};

// ---------- 删除 ----------
const handleDelete = async (row: VideoClipVO) => {
  await ElMessageBox.confirm(`确认删除切片 [${row.clipId}]？`, '提示', { type: 'warning' });
  await delVideoClip([row.clipId]);
  ElMessage.success('删除成功');
  getList();
};

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return;
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条切片记录？`, '提示', { type: 'warning' });
  await delVideoClip(selectedIds.value);
  ElMessage.success('删除成功');
  getList();
};

// ---------- 初始化 ----------
getList();
</script>

<style scoped>
.video-clip-page {
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px 0 16px;
  min-width: 0;
}

.video-clip-page :deep(.el-card) {
  width: 100%;
  max-width: 100%;
}

.video-clip-page .video-clip-table-card :deep(.el-card__header) {
  padding-left: 16px;
  padding-right: 16px;
}

.video-clip-page .video-clip-table-card :deep(.el-card__body) {
  padding: 12px 8px 16px;
}

.video-clip-page .video-clip-table {
  width: 100% !important;
}

.video-clip-page .video-clip-table :deep(.el-table__inner-wrapper) {
  width: 100%;
}

.video-clip-page .video-clip-table :deep(table) {
  width: 100% !important;
}

.video-player-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  border-radius: 4px;
  min-height: 400px;
}

.clip-video-player {
  width: 100%;
  max-height: 480px;
  border-radius: 4px;
}

.video-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  gap: 12px;
}

.clip-info-bar {
  display: flex;
  gap: 24px;
  padding: 10px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.clip-info-bar span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
