<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="视频ID" prop="videoId">
              <el-input v-model="queryParams.videoId" placeholder="请输入视频ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="设备编号" prop="deviceId">
              <el-input v-model="queryParams.deviceId" placeholder="请输入设备编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户编号" prop="userNumber">
              <el-input v-model="queryParams.userNumber" placeholder="请输入用户编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="拍摄时间" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="检测状态" prop="aiStatus">
              <el-select v-model="queryParams.aiStatus" placeholder="请选择检测状态" clearable>
                <el-option label="未检测" value="pending" />
                <el-option label="检测中" value="processing" />
                <el-option label="检测完成" value="completed" />
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

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="videoListData">
        <el-table-column label="视频ID" align="center" prop="videoId" width="120" />
        <el-table-column label="设备编号" align="center" prop="deviceId" width="100" />
        <el-table-column label="用户编号" align="center" prop="userNumber" width="120" />
        <el-table-column label="用户姓名" align="center" prop="principal" width="100" />
        <el-table-column label="视频缩略图" align="center" width="120">
          <template #default="scope">
            <el-image
              :src="scope.row.thumbnail"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 4px; cursor: pointer"
              @click="handlePlay(scope.row)"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon :size="30" color="#909399">
                    <i-ep-video-play />
                  </el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="摄录时间(摄录时长)" align="center" prop="duration" width="100" />
        <el-table-column label="拍摄时间" align="center" prop="captureTime" width="160" />
        <el-table-column label="上传时间" align="center" prop="uploadTime" width="160" />
        <el-table-column label="文件描述" align="left" prop="fileDescription" min-width="180" show-overflow-tooltip />
        <el-table-column label="存储位置" align="left" prop="storageLocation" width="200" show-overflow-tooltip />
        <el-table-column label="文件标记" align="center" prop="fileTag" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.fileTag" :type="getFileTagType(scope.row.fileTag)" size="small">
              {{ scope.row.fileTag }}
            </el-tag>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="数据来源" align="center" prop="dataSource" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.dataSource" type="info" size="small" effect="plain">
              {{ scope.row.dataSource }}
            </el-tag>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="AI检测状态" align="center" prop="aiStatus" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.aiStatus)" size="small">
              {{ getStatusText(scope.row.aiStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="违规检测" align="center" prop="violationCount" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.aiStatus === 'completed'" :type="scope.row.violationCount > 0 ? 'danger' : 'success'" size="small">
              {{ scope.row.violationCount > 0 ? `${scope.row.violationCount}项违规` : '无违规' }}
            </el-tag>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="240" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="播放视频" placement="top">
              <el-button link type="primary" icon="VideoPlay" @click="handlePlay(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="AI检测结果" placement="top">
              <el-button
                link
                type="primary"
                icon="DataAnalysis"
                :disabled="scope.row.aiStatus !== 'completed'"
                @click="handleViewResult(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="重新检测" placement="top">
              <el-button link type="primary" icon="Refresh" @click="handleRedetect(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="下载视频" placement="top">
              <el-button link type="primary" icon="Download" @click="handleDownload(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 视频播放对话框 -->
    <el-dialog v-model="playDialog.visible" :title="playDialog.title" width="900px" append-to-body @close="closePlayDialog">
      <div class="video-container">
        <video
          ref="videoPlayerRef"
          :src="currentVideo.videoUrl"
          controls
          controlsList="nodownload"
          style="width: 100%; max-height: 500px; background: #000"
          @play="onVideoPlay"
          @pause="onVideoPause"
          @ended="onVideoEnded"
        >
          您的浏览器不支持视频播放
        </video>
        <div class="video-info-panel">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="视频ID">{{ currentVideo.videoId }}</el-descriptions-item>
            <el-descriptions-item label="设备编号">{{ currentVideo.deviceId }}</el-descriptions-item>
            <el-descriptions-item label="用户编号">{{ currentVideo.userNumber }}</el-descriptions-item>
            <el-descriptions-item label="用户姓名">{{ currentVideo.principal }}</el-descriptions-item>
            <el-descriptions-item label="拍摄时间">{{ currentVideo.captureTime }}</el-descriptions-item>
            <el-descriptions-item label="上传时间">{{ currentVideo.uploadTime }}</el-descriptions-item>
            <el-descriptions-item label="摄录时间(摄录时长)">{{ currentVideo.duration }}</el-descriptions-item>
            <el-descriptions-item label="AI检测状态">
              <el-tag :type="getStatusType(currentVideo.aiStatus)" size="small">
                {{ getStatusText(currentVideo.aiStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="文件描述" :span="2">{{ currentVideo.fileDescription || '-' }}</el-descriptions-item>
            <el-descriptions-item label="存储位置" :span="2">{{ currentVideo.storageLocation || '-' }}</el-descriptions-item>
            <el-descriptions-item label="文件标记">
              <el-tag v-if="currentVideo.fileTag" :type="getFileTagType(currentVideo.fileTag)" size="small">
                {{ currentVideo.fileTag }}
              </el-tag>
              <span v-else style="color: #909399">-</span>
            </el-descriptions-item>
            <el-descriptions-item label="数据来源">
              <el-tag v-if="currentVideo.dataSource" type="info" size="small" effect="plain">
                {{ currentVideo.dataSource }}
              </el-tag>
              <span v-else style="color: #909399">-</span>
            </el-descriptions-item>
            <el-descriptions-item label="违规检测" :span="2">
              <el-tag v-if="currentVideo.aiStatus === 'completed'" :type="currentVideo.violationCount > 0 ? 'danger' : 'success'" size="small">
                {{ currentVideo.violationCount > 0 ? `${currentVideo.violationCount}项违规` : '无违规' }}
              </el-tag>
              <span v-else style="color: #909399">未检测</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="currentVideo.aiStatus === 'completed'" type="primary" icon="DataAnalysis" @click="handleViewResultFromPlay">
            查看AI检测结果
          </el-button>
          <el-button @click="closePlayDialog">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- AI检测结果对话框 -->
    <el-dialog v-model="resultDialog.visible" title="AI检测结果详情" width="950px" append-to-body>
      <div class="result-container">
        <el-alert
          v-if="currentResult.violationCount > 0"
          :title="`检测到 ${currentResult.violationCount} 项违规行为`"
          type="error"
          :closable="false"
          show-icon
          style="margin-bottom: 15px"
        />
        <el-alert v-else title="未检测到违规行为" type="success" :closable="false" show-icon style="margin-bottom: 15px" />

        <el-divider content-position="left">基本信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="视频ID">{{ currentResult.videoId }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ currentResult.deviceId }}</el-descriptions-item>
          <el-descriptions-item label="检测时间">{{ currentResult.detectTime }}</el-descriptions-item>
          <el-descriptions-item label="检测用时">{{ currentResult.processingTime }}</el-descriptions-item>
          <el-descriptions-item label="检测模型">{{ currentResult.modelVersion }}</el-descriptions-item>
          <el-descriptions-item label="置信度">
            <el-progress :percentage="currentResult.confidence" :color="getConfidenceColor(currentResult.confidence)" />
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">检测结果明细</el-divider>
        <el-table :data="currentResult.violations" border :style="{ width: '100%' }">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="违规类型" align="center" min-width="130">
            <template #default="scope">
              <el-tag :type="getViolationTypeColor(scope.row.type)" size="small">{{ scope.row.typeName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="违规描述" align="left" prop="description" min-width="200" show-overflow-tooltip />
          <el-table-column label="时间点" align="center" width="80" prop="timestamp" />
          <el-table-column label="严重程度" align="center" width="180">
            <template #default="scope">
              <el-rate v-model="scope.row.severity" disabled show-score text-color="#ff9900" />
            </template>
          </el-table-column>
        </el-table>

        <el-divider content-position="left">匹配知识库</el-divider>
        <div v-if="currentResult.knowledgeMatches.length > 0">
          <el-card v-for="(match, index) in currentResult.knowledgeMatches" :key="index" shadow="hover" style="margin-bottom: 10px">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span style="font-weight: 600">{{ match.title }}</span>
                <el-tag size="small" type="primary">匹配度: {{ match.matchScore }}%</el-tag>
              </div>
            </template>
            <p style="color: #606266; line-height: 1.6">{{ match.content }}</p>
            <div style="margin-top: 10px">
              <el-tag size="small" style="margin-right: 5px">{{ match.category }}</el-tag>
              <el-tag size="small" type="info">{{ match.source }}</el-tag>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="未匹配到相关知识库条目" :image-size="80" />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" icon="Download" @click="handleExportResult">导出检测报告</el-button>
          <el-button @click="resultDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="VideoManagement" lang="ts">
import { videoList } from '@/api/equipment/video-management';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 视频数据接口
interface VideoVO {
  videoId: string;
  deviceId: string;
  userNumber: string;
  principal: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  captureTime: string;
  uploadTime: string;
  aiStatus: 'pending' | 'processing' | 'completed';
  violationCount: number;
  fileDescription?: string; // 文件描述
  storageLocation?: string; // 存储位置
  fileTag?: string; // 文件标记
  dataSource?: string; // 数据来源
}

interface VideoQuery {
  pageNum: number;
  pageSize: number;
  videoId?: string;
  deviceId?: string;
  userNumber?: string;
  aiStatus?: string;
}

interface ViolationItem {
  type: string;
  typeName: string;
  description: string;
  timestamp: string;
  severity: number;
}

interface KnowledgeMatch {
  title: string;
  content: string;
  category: string;
  source: string;
  matchScore: number;
}

interface AIResult {
  videoId: string;
  deviceId: string;
  detectTime: string;
  processingTime: string;
  modelVersion: string;
  confidence: number;
  violationCount: number;
  violations: ViolationItem[];
  knowledgeMatches: KnowledgeMatch[];
}

// 导入本地视频
import localVideo from '@/assets/video/202111230846.mov';

// 静态数据 - 模拟视频数据（使用本地视频）
const staticVideoData: VideoVO[] = [
  {
    videoId: 'VIDEO001',
    deviceId: 'DEV001',
    userNumber: 'USER001',
    principal: '张三',
    videoUrl: localVideo,
    thumbnail: 'https://picsum.photos/200/150?random=1',
    duration: '05:23',
    captureTime: '2024-01-15 09:30:00',
    uploadTime: '2024-01-15 09:35:00',
    aiStatus: 'completed',
    violationCount: 3,
    fileDescription: '矿区入口安全帽检测视频',
    storageLocation: '/data/videos/2024/01/15/',
    fileTag: '重点监控',
    dataSource: '固定摄像头'
  },
  {
    videoId: 'VIDEO002',
    deviceId: 'DEV002',
    userNumber: 'USER002',
    principal: '李四',
    videoUrl: localVideo,
    thumbnail: 'https://picsum.photos/200/150?random=2',
    duration: '03:45',
    captureTime: '2024-01-15 10:15:00',
    uploadTime: '2024-01-15 10:18:00',
    aiStatus: 'completed',
    violationCount: 0,
    fileDescription: '2号工作面日常巡检',
    storageLocation: '/data/videos/2024/01/15/',
    fileTag: '日常监控',
    dataSource: '移动设备'
  },
  {
    videoId: 'VIDEO003',
    deviceId: 'DEV001',
    userNumber: 'USER001',
    principal: '张三',
    videoUrl: localVideo,
    thumbnail: 'https://picsum.photos/200/150?random=3',
    duration: '07:12',
    captureTime: '2024-01-15 11:20:00',
    uploadTime: '2024-01-15 11:25:00',
    aiStatus: 'processing',
    violationCount: 0,
    fileDescription: '设备维护作业记录',
    storageLocation: '/data/videos/2024/01/15/',
    fileTag: '作业记录',
    dataSource: '固定摄像头'
  },
  {
    videoId: 'VIDEO004',
    deviceId: 'DEV003',
    userNumber: 'USER003',
    principal: '王五',
    videoUrl: localVideo,
    thumbnail: 'https://picsum.photos/200/150?random=4',
    duration: '04:56',
    captureTime: '2024-01-15 13:40:00',
    uploadTime: '2024-01-15 13:42:00',
    aiStatus: 'completed',
    violationCount: 1,
    fileDescription: '焊接作业安全监控',
    storageLocation: '/data/videos/2024/01/15/',
    fileTag: '特种作业',
    dataSource: '手持设备'
  },
  {
    videoId: 'VIDEO005',
    deviceId: 'DEV004',
    userNumber: 'USER004',
    principal: '赵六',
    videoUrl: localVideo,
    thumbnail: 'https://picsum.photos/200/150?random=5',
    duration: '06:33',
    captureTime: '2024-01-15 14:10:00',
    uploadTime: '2024-01-15 14:15:00',
    aiStatus: 'pending',
    violationCount: 0,
    fileDescription: '电气设备巡检录像',
    storageLocation: '/data/videos/2024/01/15/',
    fileTag: '设备巡检',
    dataSource: '移动设备'
  },
  {
    videoId: 'VIDEO006',
    deviceId: 'DEV002',
    userNumber: 'USER002',
    principal: '李四',
    videoUrl: localVideo,
    thumbnail: 'https://picsum.photos/200/150?random=6',
    duration: '08:21',
    captureTime: '2024-01-16 08:30:00',
    uploadTime: '2024-01-16 08:35:00',
    aiStatus: 'completed',
    violationCount: 2,
    fileDescription: '吊装作业全过程监控',
    storageLocation: '/data/videos/2024/01/16/',
    fileTag: '重点监控',
    dataSource: '固定摄像头'
  },
  {
    videoId: 'VIDEO007',
    deviceId: 'DEV005',
    userNumber: 'USER005',
    principal: '孙七',
    videoUrl: localVideo,
    thumbnail: 'https://picsum.photos/200/150?random=7',
    duration: '05:47',
    captureTime: '2024-01-16 09:15:00',
    uploadTime: '2024-01-16 09:20:00',
    aiStatus: 'completed',
    violationCount: 0,
    fileDescription: '矿井通风系统检查',
    storageLocation: '/data/videos/2024/01/16/',
    fileTag: '安全检查',
    dataSource: '固定摄像头'
  },
  {
    videoId: 'VIDEO008',
    deviceId: 'DEV001',
    userNumber: 'USER001',
    principal: '张三',
    videoUrl: localVideo,
    thumbnail: 'https://picsum.photos/200/150?random=8',
    duration: '04:12',
    captureTime: '2024-01-16 10:45:00',
    uploadTime: '2024-01-16 10:48:00',
    aiStatus: 'processing',
    violationCount: 0,
    fileDescription: '人员进出管理记录',
    storageLocation: '/data/videos/2024/01/16/',
    fileTag: '人员管理',
    dataSource: '门禁摄像头'
  }
];

// 模拟AI检测结果数据
const staticAIResults: Record<string, AIResult> = {
  VIDEO001: {
    videoId: 'VIDEO001',
    deviceId: 'DEV001',
    detectTime: '2024-01-15 09:40:00',
    processingTime: '3分15秒',
    modelVersion: 'SafetyAI-v2.5.1',
    confidence: 89,
    violationCount: 3,
    violations: [
      {
        type: 'no_helmet',
        typeName: '未佩戴安全帽',
        description: '检测到矿工进入工作面时未佩戴安全帽',
        timestamp: '00:45',
        severity: 5
      },
      {
        type: 'smoking',
        typeName: '违规吸烟',
        description: '检测到人员在井下吸烟',
        timestamp: '02:30',
        severity: 4
      },
      {
        type: 'area_intrusion',
        typeName: '危险区域入侵',
        description: '检测到未授权人员进入危险作业区',
        timestamp: '04:15',
        severity: 5
      }
    ],
    knowledgeMatches: [
      {
        title: '矿山安全规程第23条',
        content: '所有进入井下作业人员必须正确佩戴安全帽，安全帽应符合GB2811-2019标准要求，并定期检查使用状况。',
        category: '安全规范',
        source: '国家矿山安全监察局',
        matchScore: 95
      },
      {
        title: '井下作业禁令',
        content: '严禁在井下吸烟、使用明火，违者将依据《煤矿安全规程》进行严肃处理。',
        category: '禁令条例',
        source: '企业安全手册',
        matchScore: 92
      }
    ]
  },
  VIDEO004: {
    videoId: 'VIDEO004',
    deviceId: 'DEV003',
    detectTime: '2024-01-15 13:50:00',
    processingTime: '2分40秒',
    modelVersion: 'SafetyAI-v2.5.1',
    confidence: 92,
    violationCount: 1,
    violations: [
      {
        type: 'improper_operation',
        typeName: '违规操作',
        description: '设备操作未按标准流程进行',
        timestamp: '01:20',
        severity: 3
      }
    ],
    knowledgeMatches: [
      {
        title: '设备操作规范',
        content: '操作人员必须经过专业培训并持证上岗，严格按照操作规程进行设备操作。',
        category: '操作规范',
        source: '设备管理手册',
        matchScore: 88
      }
    ]
  },
  VIDEO006: {
    videoId: 'VIDEO006',
    deviceId: 'DEV002',
    detectTime: '2024-01-16 08:42:00',
    processingTime: '4分05秒',
    modelVersion: 'SafetyAI-v2.5.1',
    confidence: 86,
    violationCount: 2,
    violations: [
      {
        type: 'no_protective_gear',
        typeName: '未穿防护服',
        description: '检测到人员未穿着规定的防护服进行焊割作业',
        timestamp: '03:25',
        severity: 4
      },
      {
        type: 'unsafe_distance',
        typeName: '安全距离不足',
        description: '作业人员与设备距离过近，未保持安全距离',
        timestamp: '05:50',
        severity: 3
      }
    ],
    knowledgeMatches: [
      {
        title: '焊割作业安全规范',
        content: '焊割作业人员必须穿戴防护服、防护面罩等个人防护装备，并保持安全作业距离。',
        category: '作业规范',
        source: '特种作业安全手册',
        matchScore: 90
      }
    ]
  },
  VIDEO002: {
    videoId: 'VIDEO002',
    deviceId: 'DEV002',
    detectTime: '2024-01-15 10:25:00',
    processingTime: '2分10秒',
    modelVersion: 'SafetyAI-v2.5.1',
    confidence: 95,
    violationCount: 0,
    violations: [],
    knowledgeMatches: []
  },
  VIDEO007: {
    videoId: 'VIDEO007',
    deviceId: 'DEV005',
    detectTime: '2024-01-16 09:28:00',
    processingTime: '2分55秒',
    modelVersion: 'SafetyAI-v2.5.1',
    confidence: 93,
    violationCount: 0,
    violations: [],
    knowledgeMatches: []
  }
};

const videoListData = ref<VideoVO[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const dateRange = ref<[string, string]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const videoPlayerRef = ref<HTMLVideoElement>();

const playDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const resultDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    videoId: '',
    deviceId: '',
    userNumber: '',
    aiStatus: ''
  } as VideoQuery,
  currentVideo: {} as VideoVO,
  currentResult: {} as AIResult
});

const { queryParams, currentVideo, currentResult } = toRefs(data);

/** 获取状态类型 */
const getStatusType = (status: string) => {
  const statusMap = {
    pending: 'info',
    processing: 'warning',
    completed: 'success'
  } as const;
  return (statusMap[status as keyof typeof statusMap] || 'info') as 'info' | 'warning' | 'success';
};

/** 获取状态文本 */
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '未检测',
    processing: '检测中',
    completed: '检测完成'
  };
  return statusMap[status] || '未知';
};

/** 获取违规类型颜色 */
const getViolationTypeColor = (type: string) => {
  const colorMap = {
    no_helmet: 'danger',
    smoking: 'danger',
    area_intrusion: 'danger',
    no_protective_gear: 'warning',
    unsafe_distance: 'warning',
    improper_operation: 'warning'
  } as const;
  return (colorMap[type as keyof typeof colorMap] || 'info') as 'info' | 'warning' | 'danger';
};

/** 获取置信度颜色 */
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 90) return '#67C23A';
  if (confidence >= 75) return '#E6A23C';
  return '#F56C6C';
};

/** 获取文件标记类型 */
const getFileTagType = (tag: string) => {
  const tagMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    '重点监控': 'danger',
    '日常监控': 'info',
    '作业记录': 'success',
    '特种作业': 'warning',
    '设备巡检': 'info',
    '安全检查': 'success',
    '人员管理': 'info'
  };
  return tagMap[tag] || 'info';
};

/** 查询视频列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await videoList(proxy?.addDateRange(queryParams.value, dateRange.value));
    videoListData.value = res.rows;
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
  handleQuery();
};

/** 播放视频 */
const handlePlay = (row: VideoVO) => {
  playDialog.visible = true;
  playDialog.title = `播放视频 - ${row.videoId}`;
  currentVideo.value = { ...row };
};

/** 查看AI检测结果 */
const handleViewResult = (row: VideoVO) => {
  if (row.aiStatus !== 'completed') {
    proxy?.$modal.msgWarning('该视频尚未完成AI检测');
    return;
  }
  const result = staticAIResults[row.videoId];
  if (!result) {
    proxy?.$modal.msgWarning('未找到检测结果数据');
    return;
  }
  resultDialog.visible = true;
  currentResult.value = result;
};

/** 从播放对话框查看检测结果 */
const handleViewResultFromPlay = () => {
  playDialog.visible = false;
  const result = staticAIResults[currentVideo.value.videoId];
  if (result) {
    resultDialog.visible = true;
    currentResult.value = result;
  }
};

/** 重新检测 */
const handleRedetect = (row: VideoVO) => {
  proxy?.$modal
    .confirm(`确认要对视频 ${row.videoId} 进行AI重新检测吗？`)
    .then(() => {
      // TODO: 调用重新检测接口
      proxy?.$modal.msgSuccess('已提交检测任务，请稍后查看结果');
      getList();
    })
    .catch(() => {});
};

/** 下载视频 */
const handleDownload = (row: VideoVO) => {
  proxy?.$modal.msgSuccess(`正在下载视频 ${row.videoId}...`);
};

/** 删除视频 */
const handleDelete = (row: VideoVO) => {
  proxy?.$modal
    .confirm(`是否确认删除视频 ${row.videoId}？`)
    .then(() => {
      // TODO: 调用删除接口
      proxy?.$modal.msgSuccess('删除成功');
      getList();
    })
    .catch(() => {});
};

/** 导出检测报告 */
const handleExportResult = () => {
  proxy?.$modal.msgSuccess(`正在导出 ${currentResult.value.videoId} 的检测报告...`);
};

/** 视频播放事件 */
const onVideoPlay = () => {
  console.log('视频开始播放');
};

const onVideoPause = () => {
  console.log('视频暂停');
};

const onVideoEnded = () => {
  console.log('视频播放结束');
};

/** 关闭播放对话框 */
const closePlayDialog = () => {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.pause();
  }
  playDialog.visible = false;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.video-container {
  .video-info-panel {
    margin-top: 15px;
  }
}

.result-container {
  max-height: 600px;
  overflow-y: auto;

  :deep(.el-progress__text) {
    font-size: 14px !important;
  }
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  transition: all 0.3s;

  &:hover {
    background: #e6e8eb;
  }
}

:deep(.el-image) {
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}
</style>
