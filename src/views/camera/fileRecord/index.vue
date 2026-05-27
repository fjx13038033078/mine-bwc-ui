<template>
  <div class="file-record-page">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px] file-record-search">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="90px">
            <el-form-item label="视频序列号" prop="serialNumber">
              <el-input v-model="queryParams.serialNumber" placeholder="请输入视频序列号" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户姓名" prop="userName">
              <el-input v-model="queryParams.userName" placeholder="请输入用户姓名" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户编号" prop="userCode">
              <el-input v-model="queryParams.userCode" placeholder="请输入用户编号" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="来源设备" prop="deviceId">
              <el-input v-model="queryParams.deviceId" placeholder="请输入来源设备" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="媒体类型" prop="mediaType">
              <el-select v-model="queryParams.mediaType" placeholder="请选择媒体类型" clearable style="width: 200px">
                <el-option label="MP4" value="mp4" />
                <el-option label="MOV" value="mov" />
                <el-option label="AVI" value="avi" />
                <el-option label="MKV" value="mkv" />
              </el-select>
            </el-form-item>
            <el-form-item label="数据来源" prop="dataSource">
              <el-select v-model="queryParams.dataSource" placeholder="请选择数据来源" clearable style="width: 200px">
                <el-option
                  v-for="item in fileRecordDataSourceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="AI检测状态" prop="aiCheckStatus">
              <el-select v-model="queryParams.aiCheckStatus" placeholder="请选择检测状态" clearable style="width: 200px">
                <el-option label="未检测" :value="0" />
                <el-option label="检测中" :value="1" />
                <el-option label="检测完成" :value="2" />
                <el-option label="检测失败" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="拍摄时间" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card class="file-record-table-card" shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['camera:management:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['camera:management:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" :columns="columns" @query-table="getList" />
        </el-row>
      </template>

      <el-table v-loading="loading" class="file-record-table" :data="dataList" border fit style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column v-if="columns[0].visible" label="视频ID" align="center" prop="videoId" width="80" />
        <el-table-column v-if="columns[12].visible" label="视频序列号" align="center" prop="serialNumber" width="130" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[1].visible" label="用户姓名" align="center" prop="userName" width="100" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[2].visible" label="用户编号" align="center" prop="userCode" width="110" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[3].visible" label="来源设备" align="center" prop="deviceId" width="120" :show-overflow-tooltip="true" />
        <el-table-column v-if="columns[4].visible" label="拍摄时间" align="center" prop="shootTime" width="160">
          <template #default="scope">
            <span>{{ parseTime(scope.row.shootTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[5].visible" label="视频时长" align="center" prop="durationDisplay" width="90" />
        <el-table-column v-if="columns[6].visible" label="媒体类型" align="center" prop="mediaType" width="90">
          <template #default="scope">
            <el-tag type="info" effect="plain">{{ scope.row.mediaType?.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column v-if="columns[8].visible" label="数据来源" align="center" prop="dataSource" width="130">
          <template #default="scope">
            <dict-tag :options="fileRecordDataSourceOptions" :value="scope.row.dataSource" />
          </template>
        </el-table-column>
        <el-table-column v-if="columns[9].visible" label="AI检测状态" align="center" prop="aiCheckStatus" width="110">
          <template #default="scope">
            <el-tag :type="getAiStatusType(scope.row.aiCheckStatus)">
              {{ getAiStatusLabel(scope.row.aiCheckStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[10].visible" label="违规标记" align="center" prop="hasViolation" width="100">
          <template #default="scope">
            <template v-if="scope.row.aiCheckStatus === 2">
              <el-tag v-if="scope.row.hasViolation === 1" type="danger" effect="dark">
                <el-icon><Warning /></el-icon> 违规
              </el-tag>
              <el-tag v-else type="success" effect="plain">正常</el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[13].visible" label="复判状态" align="center" prop="reviewStatus" width="100">
          <template #default="scope">
            <template v-if="scope.row.aiCheckStatus === 2">
              <el-tag v-if="scope.row.reviewStatus === 1" :type="scope.row.reviewResult === 0 ? 'success' : 'danger'">
                {{ scope.row.reviewResult === 0 ? '复判正常' : '复判违规' }}
              </el-tag>
              <el-tag v-else type="info" effect="plain">未复判</el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[11].visible" label="上传时间" align="center" prop="uploadTime" min-width="160">
          <template #default="scope">
            <span>{{ parseTime(scope.row.uploadTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button v-hasPermi="['camera:management:query']" link type="primary" icon="View" @click="handleView(scope.row)" />
            </el-tooltip>
            <el-tooltip content="播放视频" placement="top">
              <el-button v-hasPermi="['camera:management:query']" link type="primary" icon="VideoPlay" @click="handlePlay(scope.row)" />
            </el-tooltip>
            <el-tooltip content="人工复判" placement="top">
              <el-button
                v-hasPermi="['camera:management:edit']"
                link
                type="primary"
                icon="EditPen"
                :disabled="scope.row.aiCheckStatus !== 2"
                @click="handleReview(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['camera:management:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialog.visible" :title="detailDialog.title" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="视频ID">{{ detailData.videoId }}</el-descriptions-item>
        <el-descriptions-item label="视频序列号">{{ detailData.serialNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="来源设备">{{ detailData.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="用户编号">{{ detailData.userCode }}</el-descriptions-item>
        <el-descriptions-item label="用户姓名">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="拍摄时间">{{ parseTime(detailData.shootTime) }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ parseTime(detailData.uploadTime) }}</el-descriptions-item>
        <el-descriptions-item label="视频时长">{{ detailData.durationDisplay }}</el-descriptions-item>
        <el-descriptions-item label="媒体类型">
          <el-tag type="info" effect="plain">{{ detailData.mediaType?.toUpperCase() }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="数据来源">
          <dict-tag :options="fileRecordDataSourceOptions" :value="detailData.dataSource" />
        </el-descriptions-item>
        <el-descriptions-item label="AI检测状态">
          <el-tag :type="getAiStatusType(detailData.aiCheckStatus)">
            {{ getAiStatusLabel(detailData.aiCheckStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="违规状态">
          <template v-if="detailData.aiCheckStatus === 2">
            <el-tag v-if="detailData.hasViolation === 1" type="danger" effect="dark">
              <el-icon><Warning /></el-icon> 存在违规
            </el-tag>
            <el-tag v-else type="success" effect="plain">正常</el-tag>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.violationType" label="违规类型">
          <el-tag type="danger">{{ detailData.violationType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.hasViolation === 1 && (detailData.violationStartSecond != null || detailData.violationEndSecond != null)" label="违规时间点">
          {{ formatViolationTime(detailData.violationStartSecond, detailData.violationEndSecond) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.processTime" label="检测耗时"> {{ detailData.processTime?.toFixed(2) }}秒 </el-descriptions-item>
        <el-descriptions-item v-if="detailData.checkTime" label="检测时间">
          {{ parseTime(detailData.checkTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="文件描述" :span="2">{{ detailData.fileDescription || '-' }}</el-descriptions-item>
        <el-descriptions-item label="存储位置" :span="2">
          <el-link type="primary" :underline="false">{{ detailData.storageLocation }}</el-link>
        </el-descriptions-item>
      </el-descriptions>

      <!-- AI分析报告区域 -->
      <div v-if="detailData.aiCheckStatus === 2" class="ai-report-section">
        <el-divider content-position="left">
          <el-icon><DataAnalysis /></el-icon> AI分析报告
        </el-divider>

        <!-- 违规截图展示 -->
        <div v-if="detailData.screenshotUrl" class="screenshot-section">
          <h4>关键帧截图</h4>
          <el-image :src="detailData.screenshotUrl" :preview-src-list="[detailData.screenshotUrl]" fit="contain" class="violation-screenshot">
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>截图加载失败</span>
              </div>
            </template>
          </el-image>
        </div>

        <!-- AI分析结果 -->
        <div v-if="detailData.aiCheckResult" class="result-section">
          <h4>分析结果</h4>
          <pre class="ai-result-text">{{ formatAiResult(detailData.aiCheckResult) }}</pre>
        </div>
      </div>

      <!-- 人工复判记录 -->
      <div v-if="detailData.reviewStatus === 1" class="ai-report-section">
        <el-divider content-position="left">
          <el-icon><EditPen /></el-icon> 人工复判记录
        </el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="复判结果">
            <el-tag :type="detailData.reviewResult === 0 ? 'success' : 'danger'" effect="dark">
              {{ detailData.reviewResult === 0 ? '正常（纠正为无违规）' : '确认违规' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="复判人">{{ detailData.reviewerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="复判时间">{{ parseTime(detailData.reviewTime) }}</el-descriptions-item>
          <el-descriptions-item label="复判说明" :span="2">{{ detailData.reviewComment || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailDialog.visible = false">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- 人工复判对话框 -->
    <el-dialog v-model="reviewDialog.visible" :title="reviewDialog.title" width="900px" append-to-body @close="handleCloseReview">
      <div class="review-layout">
        <!-- 左侧：视频播放 + AI结果 -->
        <div class="review-left">
          <div class="video-container" style="margin-bottom: 12px">
            <video v-if="reviewDialog.visible && reviewDialog.url" ref="reviewVideoRef" :src="reviewDialog.url" controls class="video-player">
              您的浏览器不支持视频播放
            </video>
            <div v-else class="video-placeholder">
              <el-icon :size="48" color="#909399"><VideoPlay /></el-icon>
              <span>加载视频中...</span>
            </div>
          </div>

          <!-- AI 原始判定 -->
          <el-card shadow="never" class="ai-summary-card">
            <template #header><span style="font-weight: 600">AI 原始判定</span></template>
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="违规判定">
                <el-tag v-if="reviewData.hasViolation === 1" type="danger" effect="dark">违规</el-tag>
                <el-tag v-else type="success" effect="plain">正常</el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="reviewData.violationType" label="违规类型">{{ reviewData.violationType }}</el-descriptions-item>
              <el-descriptions-item v-if="reviewData.aiCheckResult" label="分析描述">
                <div class="ai-result-text" style="max-height: 120px">{{ formatAiResult(reviewData.aiCheckResult) }}</div>
              </el-descriptions-item>
            </el-descriptions>
            <div v-if="reviewData.screenshotUrl" style="margin-top: 8px">
              <span style="font-size: 13px; color: #606266">关键帧截图：</span>
              <el-image
                :src="reviewData.screenshotUrl"
                :preview-src-list="[reviewData.screenshotUrl]"
                fit="contain"
                style="width: 100%; max-height: 160px; margin-top: 4px; border-radius: 4px; border: 1px solid #ebeef5"
              />
            </div>
          </el-card>
        </div>

        <!-- 右侧：复判表单 -->
        <div class="review-right">
          <el-card shadow="never">
            <template #header><span style="font-weight: 600">复判表单</span></template>
            <el-form ref="reviewFormRef" :model="reviewForm" :rules="reviewRules" label-position="top">
              <el-form-item label="您的判定" prop="reviewResult">
                <el-radio-group v-model="reviewForm.reviewResult" size="large">
                  <el-radio-button :value="0">
                    <el-icon><CircleCheck /></el-icon> 正常（无违规）
                  </el-radio-button>
                  <el-radio-button :value="1">
                    <el-icon><Warning /></el-icon> 确认违规
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="复判说明" prop="reviewComment">
                <el-input
                  v-model="reviewForm.reviewComment"
                  type="textarea"
                  :rows="5"
                  maxlength="500"
                  show-word-limit
                  placeholder="请描述您的判定依据（选填）"
                />
              </el-form-item>

              <!-- 已有复判记录提示 -->
              <el-alert v-if="reviewData.reviewStatus === 1" type="warning" :closable="false" style="margin-bottom: 16px">
                <template #title>
                  该视频已于 {{ parseTime(reviewData.reviewTime) }} 由 {{ reviewData.reviewerName }} 复判过， 结果为「{{
                    reviewData.reviewResult === 0 ? '正常' : '违规'
                  }}」。再次提交将覆盖上次结果。
                </template>
              </el-alert>
            </el-form>
          </el-card>
        </div>
      </div>
      <template #footer>
        <el-button @click="reviewDialog.visible = false">取 消</el-button>
        <el-button type="primary" :loading="reviewSubmitting" @click="handleSubmitReview">提交复判</el-button>
      </template>
    </el-dialog>

    <!-- 视频播放对话框 -->
    <el-dialog v-model="playDialog.visible" :title="playDialog.title" width="800px" append-to-body @close="handleClosePlay">
      <div class="video-container">
        <video v-if="playDialog.visible" ref="videoRef" :src="playDialog.url" controls autoplay class="video-player">您的浏览器不支持视频播放</video>
      </div>
      <template #footer>
        <el-button @click="playDialog.visible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CameraFileRecord" lang="ts">
import { listCameraManagement, delCameraManagement, getVideoPlayUrl, submitManualReview } from '@/api/camera/management';
import { CameraManagementVO, CameraManagementQuery, ManualReviewForm } from '@/api/camera/management/types';
import { parseTime } from '@/utils/ruoyi';
import { Warning, DataAnalysis, Picture, EditPen, CircleCheck, VideoPlay } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/** 检测记录页实际使用的数据来源（与后端入库值一致） */
const fileRecordDataSourceOptions = [
  { label: 'AI检测扫描', value: 'scan', elTagType: 'warning' },
  { label: '视频切割扫描', value: 'clip', elTagType: 'success' }
];

const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const multiple = ref(true);
const total = ref(0);
const dataList = ref<CameraManagementVO[]>([]);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const videoRef = ref<HTMLVideoElement>();

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: '视频ID', visible: false, children: [] },
  { key: 1, label: '用户姓名', visible: true, children: [] },
  { key: 2, label: '用户编号', visible: true, children: [] },
  { key: 3, label: '来源设备', visible: true, children: [] },
  { key: 4, label: '拍摄时间', visible: true, children: [] },
  { key: 5, label: '视频时长', visible: true, children: [] },
  { key: 6, label: '媒体类型', visible: true, children: [] },
  { key: 7, label: '文件描述', visible: true, children: [] },
  { key: 8, label: '数据来源', visible: true, children: [] },
  { key: 9, label: 'AI检测状态', visible: true, children: [] },
  { key: 10, label: '违规标记', visible: true, children: [] },
  { key: 11, label: '上传时间', visible: true, children: [] },
  { key: 12, label: '视频序列号', visible: true, children: [] },
  { key: 13, label: '复判状态', visible: true, children: [] }
]);

// 详情对话框
const detailDialog = reactive<DialogOption>({
  visible: false,
  title: '视频详情'
});

const detailData = ref<Partial<CameraManagementVO>>({});

// 播放对话框
const playDialog = reactive({
  visible: false,
  title: '视频播放',
  url: ''
});

// 查询参数
const queryParams = ref<CameraManagementQuery>({
  pageNum: 1,
  pageSize: 10,
  serialNumber: undefined,
  userName: undefined,
  userCode: undefined,
  deviceId: undefined,
  mediaType: undefined,
  dataSource: 'scan',
  aiCheckStatus: undefined
});

/** 查询列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await listCameraManagement(proxy?.addDateRange(queryParams.value, dateRange.value, 'ShootTime'));
    dataList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.value.dataSource = 'scan';
  queryParams.value.pageNum = 1;
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: CameraManagementVO[]) => {
  ids.value = selection.map((item) => item.videoId);
  multiple.value = !selection.length;
};

/** 查看详情 */
const handleView = (row: CameraManagementVO) => {
  detailData.value = row;
  detailDialog.visible = true;
};

/** 播放视频 */
const handlePlay = async (row: CameraManagementVO) => {
  try {
    playDialog.title = `播放视频 - ${row.userName}`;
    // 调用后端接口获取预签名URL
    const res = await getVideoPlayUrl(row.videoId);
    playDialog.url = res.data;
    playDialog.visible = true;
  } catch (error) {
    proxy?.$modal.msgError('获取视频播放地址失败');
  }
};

/** 关闭播放 */
const handleClosePlay = () => {
  if (videoRef.value) {
    videoRef.value.pause();
  }
  playDialog.url = '';
};

// ============== 人工复判 ==============
const reviewVideoRef = ref<HTMLVideoElement>();
const reviewFormRef = ref<ElFormInstance>();
const reviewSubmitting = ref(false);

const reviewDialog = reactive({
  visible: false,
  title: '人工复判',
  url: ''
});

const reviewData = ref<Partial<CameraManagementVO>>({});

const reviewForm = reactive<ManualReviewForm>({
  videoId: 0,
  reviewResult: 0,
  reviewComment: ''
});

const reviewRules = reactive({
  reviewResult: [{ required: true, message: '请选择复判结果', trigger: 'change' }]
});

/** 打开复判对话框 */
const handleReview = async (row: CameraManagementVO) => {
  reviewData.value = row;
  reviewForm.videoId = row.videoId;
  reviewForm.reviewResult = row.hasViolation === 1 ? 1 : 0;
  reviewForm.reviewComment = '';
  reviewDialog.title = `人工复判 - ${row.userName || ''}（ID: ${row.videoId}）`;

  try {
    const res = await getVideoPlayUrl(row.videoId);
    reviewDialog.url = res.data;
  } catch {
    reviewDialog.url = '';
  }
  reviewDialog.visible = true;
};

/** 提交复判 */
const handleSubmitReview = async () => {
  const valid = await reviewFormRef.value?.validate();
  if (!valid) return;

  await proxy?.$modal.confirm('确认提交复判结果？提交后将更新该视频的最终判定。');
  reviewSubmitting.value = true;
  try {
    await submitManualReview(reviewForm);
    proxy?.$modal.msgSuccess('复判提交成功');
    reviewDialog.visible = false;
    await getList();
  } catch {
    proxy?.$modal.msgError('复判提交失败');
  } finally {
    reviewSubmitting.value = false;
  }
};

/** 关闭复判对话框 */
const handleCloseReview = () => {
  if (reviewVideoRef.value) {
    reviewVideoRef.value.pause();
  }
  reviewDialog.url = '';
  reviewFormRef.value?.resetFields();
};

/** 删除按钮操作 */
const handleDelete = async (row?: CameraManagementVO) => {
  // 后端期望 Long[] 数组，确保传入数组格式
  const videoIds = row?.videoId ? [row.videoId] : ids.value;
  const displayIds = row?.videoId || ids.value;
  await proxy?.$modal.confirm('是否确认删除视频编号为"' + displayIds + '"的数据项？');
  await delCameraManagement(videoIds);
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'camera/management/export',
    {
      ...queryParams.value
    },
    `camera_management_${new Date().getTime()}.xlsx`
  );
};

/** 获取AI状态标签 */
const getAiStatusLabel = (status: number) => {
  const map: Record<number, string> = {
    0: '未检测',
    1: '检测中',
    2: '检测完成',
    3: '检测失败'
  };
  return map[status] ?? '-';
};

/** 获取AI状态类型 */
const getAiStatusType = (status: number): 'info' | 'warning' | 'success' | 'danger' | 'primary' => {
  const map: Record<number, 'info' | 'warning' | 'success' | 'danger'> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger'
  };
  return map[status] ?? 'info';
};

/** 格式化AI结果 */
const formatAiResult = (result: string) => {
  if (!result) return '-';
  try {
    const obj = JSON.parse(result);
    // 如果是包装的JSON格式，提取description字段
    if (obj.description) {
      return obj.description;
    }
    return JSON.stringify(obj, null, 2);
  } catch {
    return result;
  }
};

/** 格式化违规时间点（秒 -> MM:SS） */
const formatViolationTime = (startSec?: number, endSec?: number) => {
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };
  if (startSec != null && endSec != null) return `${fmt(startSec)} - ${fmt(endSec)}`;
  if (startSec != null) return `起始 ${fmt(startSec)}`;
  if (endSec != null) return `结束 ${fmt(endSec)}`;
  return '-';
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
/* 表格区域横向铺满主内容区（与 app-main 同宽） */
.file-record-page {
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px 0 16px;
  min-width: 0;
}

.file-record-page .file-record-search :deep(.el-card),
.file-record-page .file-record-table-card {
  width: 100%;
  max-width: 100%;
}

.file-record-page .file-record-table-card :deep(.el-card__header) {
  padding-left: 16px;
  padding-right: 16px;
}

.file-record-page .file-record-table-card :deep(.el-card__body) {
  padding: 12px 8px 16px;
}

.file-record-page .file-record-table {
  width: 100% !important;
}

.file-record-page .file-record-table :deep(.el-table__inner-wrapper) {
  width: 100%;
}

.file-record-page .file-record-table :deep(table) {
  width: 100% !important;
}

.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  max-height: 450px;
}

.ai-report-section {
  margin-top: 20px;

  h4 {
    margin: 12px 0 8px;
    font-size: 14px;
    color: #606266;
  }
}

.screenshot-section {
  margin-bottom: 16px;

  .violation-screenshot {
    width: 100%;
    max-height: 300px;
    border-radius: 8px;
    border: 1px solid #ebeef5;
  }

  .image-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background: #f5f7fa;
    color: #909399;
    font-size: 14px;

    .el-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
  }
}

.result-section {
  margin-top: 12px;
}

.ai-result-text {
  margin: 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.review-layout {
  display: flex;
  gap: 16px;

  .review-left {
    flex: 1;
    min-width: 0;
  }

  .review-right {
    width: 320px;
    flex-shrink: 0;
  }
}

.ai-summary-card {
  :deep(.el-card__header) {
    padding: 10px 16px;
    background: #fafafa;
  }

  :deep(.el-card__body) {
    padding: 12px;
  }
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 280px;
  background: #000;
  border-radius: 8px;
  color: #909399;
  gap: 8px;
}

:deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
