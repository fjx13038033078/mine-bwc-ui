<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="视频ID" prop="videoId">
              <el-input v-model="queryParams.videoId" placeholder="请输入视频ID" clearable @keyup.enter="handleQuery" style="width: 150px" />
            </el-form-item>
            <el-form-item label="设备ID" prop="deviceId">
              <el-input v-model="queryParams.deviceId" placeholder="请输入设备ID" clearable @keyup.enter="handleQuery" style="width: 150px" />
            </el-form-item>
            <el-form-item label="责任人" prop="principal">
              <el-input v-model="queryParams.principal" placeholder="请输入责任人" clearable @keyup.enter="handleQuery" style="width: 120px" />
            </el-form-item>
            <el-form-item label="技能配置" prop="skillConfigured">
              <el-select v-model="queryParams.skillConfigured" placeholder="请选择状态" clearable style="width: 120px">
                <el-option label="已配置" value="true" />
                <el-option label="未配置" value="false" />
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

    <!-- 统计概览 -->
    <el-row :gutter="15" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="28"><i-ep-video-camera /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ allVideoList.length }}</div>
              <div class="stat-label">视频总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon :size="28"><i-ep-circle-check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ configuredVideoCount }}</div>
              <div class="stat-label">已配置技能</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon :size="28"><i-ep-warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ unconfiguredVideoCount }}</div>
              <div class="stat-label">待配置技能</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon :size="28"><i-ep-cpu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalSkillUsage }}</div>
              <div class="stat-label">技能配置次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Setting" :disabled="multiple" @click="handleBatchConfig">批量配置技能</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport">导出配置</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="videoList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="视频ID" align="center" prop="videoId" width="120" />
        <el-table-column label="设备ID" align="center" prop="deviceId" width="100" />
        <el-table-column label="责任人" align="center" prop="principal" width="100" />
        <el-table-column label="视频缩略图" align="center" width="120">
          <template #default="scope">
            <el-image
              :src="scope.row.thumbnail"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 4px; cursor: pointer"
              @click="handlePreview(scope.row)"
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
        <el-table-column label="视频时长" align="center" prop="duration" width="100" />
        <el-table-column label="拍摄时间" align="center" prop="captureTime" width="160" />
        <el-table-column label="已配置技能" align="left" min-width="300" show-overflow-tooltip>
          <template #default="scope">
            <div v-if="scope.row.configuredSkills && scope.row.configuredSkills.length > 0" class="skills-container">
              <el-tag
                v-for="skill in scope.row.configuredSkills"
                :key="skill.skillId"
                :type="skill.status === 'enabled' ? 'success' : 'info'"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px"
              >
                <el-icon :color="skill.color" style="margin-right: 4px">
                  <component :is="skill.icon" />
                </el-icon>
                {{ skill.skillName }}
              </el-tag>
            </div>
            <span v-else style="color: #909399">未配置技能</span>
          </template>
        </el-table-column>
        <el-table-column label="技能数量" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.configuredSkills && scope.row.configuredSkills.length > 0" type="primary" size="small">
              {{ scope.row.configuredSkills.length }} 个
            </el-tag>
            <span v-else style="color: #909399">0 个</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="260">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
            <el-button link type="success" icon="Setting" @click="handleConfigSkills(scope.row)">配置技能</el-button>
            <el-button link type="warning" icon="VideoPlay" @click="handlePreview(scope.row)">预览</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 配置技能对话框 -->
    <el-dialog v-model="configDialog.visible" :title="configDialog.title" width="1000px" append-to-body @close="closeConfigDialog">
      <div class="config-dialog-content">
        <el-alert type="info" :closable="false" style="margin-bottom: 20px">
          <template #title>
            <div style="display: flex; align-items: center; gap: 8px">
              <el-icon :size="18"><i-ep-info-filled /></el-icon>
              <span style="font-weight: bold">技能配置说明</span>
            </div>
          </template>
          <p style="margin: 8px 0 0 0; line-height: 1.6">
            为视频选择需要应用的AI识别技能。系统将使用选中的技能对视频进行分析和识别。
            {{ configDialog.isBatch ? `当前批量配置 ${selectedIds.length} 个视频。` : '' }}
          </p>
        </el-alert>

        <!-- 当前视频信息（单个配置时显示） -->
        <el-card v-if="!configDialog.isBatch && currentVideo.videoId" shadow="hover" style="margin-bottom: 20px">
          <template #header>
            <div style="display: flex; align-items: center; gap: 8px">
              <el-icon :size="18" color="#409EFF"><i-ep-video-camera /></el-icon>
              <span style="font-weight: bold">当前视频信息</span>
            </div>
          </template>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="视频ID">{{ currentVideo.videoId }}</el-descriptions-item>
            <el-descriptions-item label="设备ID">{{ currentVideo.deviceId }}</el-descriptions-item>
            <el-descriptions-item label="责任人">{{ currentVideo.principal }}</el-descriptions-item>
            <el-descriptions-item label="视频时长">{{ currentVideo.duration }}</el-descriptions-item>
            <el-descriptions-item label="拍摄时间" :span="2">{{ currentVideo.captureTime }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 技能选择 -->
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-icon :size="18" color="#67C23A"><i-ep-cpu /></el-icon>
                <span style="font-weight: bold; font-size: 15px">AI识别技能选择</span>
                <el-tag v-if="selectedSkills.length > 0" size="small" type="success">已选 {{ selectedSkills.length }} 个</el-tag>
              </div>
              <div style="display: flex; gap: 8px">
                <el-button size="small" @click="handleSelectAllSkills">全选</el-button>
                <el-button size="small" @click="handleClearAllSkills">清空</el-button>
              </div>
            </div>
          </template>

          <div class="skill-selection-area">
            <el-checkbox-group v-model="selectedSkills">
              <el-row :gutter="12">
                <el-col :span="12" v-for="skill in availableSkills" :key="skill.skillId">
                  <div class="skill-checkbox-card" :class="{ 'is-checked': selectedSkills.includes(skill.skillId) }">
                    <el-checkbox :label="skill.skillId">
                      <div class="skill-checkbox-content">
                        <div class="skill-checkbox-left">
                          <el-icon :size="24" :color="skill.color">
                            <component :is="skill.icon" />
                          </el-icon>
                          <div class="skill-info">
                            <div class="skill-name">{{ skill.skillName }}</div>
                            <div class="skill-desc">{{ skill.description }}</div>
                          </div>
                        </div>
                        <div class="skill-checkbox-right">
                          <el-tag :type="skill.category === '安全监控' ? 'danger' : 'primary'" size="small">
                            {{ skill.category }}
                          </el-tag>
                          <el-tag v-if="skill.status === 'enabled'" type="success" size="small" style="margin-left: 5px">已启用</el-tag>
                          <el-tag v-else type="info" size="small" style="margin-left: 5px">已停用</el-tag>
                        </div>
                      </div>
                    </el-checkbox>
                  </div>
                </el-col>
              </el-row>
            </el-checkbox-group>

            <el-empty v-if="availableSkills.length === 0" description="暂无可用技能" :image-size="100" />
          </div>
        </el-card>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitConfig" :disabled="selectedSkills.length === 0">
            <el-icon><i-ep-check /></el-icon>
            <span>保存配置</span>
          </el-button>
          <el-button @click="closeConfigDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 视频详情对话框 -->
    <el-dialog v-model="viewDialog.visible" :title="`视频详情 - ${viewData.videoId}`" width="900px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="视频ID">{{ viewData.videoId }}</el-descriptions-item>
        <el-descriptions-item label="设备ID">{{ viewData.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="用户编号">{{ viewData.userNumber }}</el-descriptions-item>
        <el-descriptions-item label="责任人">{{ viewData.principal }}</el-descriptions-item>
        <el-descriptions-item label="视频时长">{{ viewData.duration }}</el-descriptions-item>
        <el-descriptions-item label="拍摄时间">{{ viewData.captureTime }}</el-descriptions-item>
        <el-descriptions-item label="上传时间" :span="2">{{ viewData.uploadTime }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">已配置的AI识别技能</el-divider>
      <el-card shadow="never" style="background-color: #f5f7fa">
        <div v-if="viewData.configuredSkills && viewData.configuredSkills.length > 0">
          <el-row :gutter="12">
            <el-col :span="12" v-for="skill in viewData.configuredSkills" :key="skill.skillId">
              <el-card shadow="hover" style="margin-bottom: 12px">
                <div style="display: flex; align-items: center; gap: 12px">
                  <el-icon :size="32" :color="skill.color">
                    <component :is="skill.icon" />
                  </el-icon>
                  <div style="flex: 1">
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px">{{ skill.skillName }}</div>
                    <div style="font-size: 12px; color: #909399">{{ skill.description }}</div>
                  </div>
                  <div>
                    <el-tag :type="skill.category === '安全监控' ? 'danger' : 'primary'" size="small">
                      {{ skill.category }}
                    </el-tag>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        <el-empty v-else description="该视频尚未配置任何技能" :image-size="100" />
      </el-card>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" icon="Setting" @click="handleConfigFromView">配置技能</el-button>
          <el-button type="success" icon="VideoPlay" @click="handlePreviewFromView">播放视频</el-button>
          <el-button @click="viewDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 视频预览对话框 -->
    <el-dialog v-model="previewDialog.visible" :title="`视频预览 - ${previewData.videoId}`" width="800px" append-to-body>
      <div class="video-preview-container">
        <video v-if="previewData.videoUrl" :src="previewData.videoUrl" controls style="width: 100%; max-height: 500px; border-radius: 8px">
          您的浏览器不支持视频播放
        </video>
        <el-empty v-else description="暂无视频" :image-size="100" />
      </div>

      <el-divider content-position="left">视频信息</el-divider>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="视频ID">{{ previewData.videoId }}</el-descriptions-item>
        <el-descriptions-item label="设备ID">{{ previewData.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="责任人">{{ previewData.principal }}</el-descriptions-item>
        <el-descriptions-item label="时长">{{ previewData.duration }}</el-descriptions-item>
        <el-descriptions-item label="拍摄时间" :span="2">{{ previewData.captureTime }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="previewDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="VideoSkillConfiguration" lang="ts">
import { formatDateTime, exportToJSON } from '@/utils/copper-mine-utils';
import { AI_SKILLS } from '@/utils/copper-mine-constants';
import localVideo from '@/assets/video/202111230846.mov';

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
  configuredSkills?: SkillInfo[];
}

interface SkillInfo {
  skillId: string;
  skillName: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  status: 'enabled' | 'disabled';
}

interface VideoQuery {
  pageNum: number;
  pageSize: number;
  videoId?: string;
  deviceId?: string;
  principal?: string;
  skillConfigured?: string;
}

// 静态数据 - 视频列表（从 video-management 模块）
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
    configuredSkills: [
      {
        skillId: 'skill_helmet_detection',
        skillName: '安全帽佩戴识别',
        description: '识别作业人员是否正确佩戴安全帽',
        category: '安全监控',
        icon: 'Camera',
        color: '#F56C6C',
        status: 'enabled'
      },
      {
        skillId: 'skill_welding_detection',
        skillName: '焊割作业规范识别',
        description: '识别焊割作业中的违规行为',
        category: '专项作业',
        icon: 'VideoCameraFilled',
        color: '#E6A23C',
        status: 'enabled'
      }
    ]
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
    configuredSkills: [
      {
        skillId: 'skill_lifting_detection',
        skillName: '吊装作业安全识别',
        description: '识别吊装作业中的违规操作',
        category: '专项作业',
        icon: 'Warning',
        color: '#409EFF',
        status: 'enabled'
      }
    ]
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
    configuredSkills: []
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
    configuredSkills: [
      {
        skillId: 'skill_helmet_detection',
        skillName: '安全帽佩戴识别',
        description: '识别作业人员是否正确佩戴安全帽',
        category: '安全监控',
        icon: 'Camera',
        color: '#F56C6C',
        status: 'enabled'
      }
    ]
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
    configuredSkills: []
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
    configuredSkills: []
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
    configuredSkills: [
      {
        skillId: 'skill_welding_detection',
        skillName: '焊割作业规范识别',
        description: '识别焊割作业中的违规行为',
        category: '专项作业',
        icon: 'VideoCameraFilled',
        color: '#E6A23C',
        status: 'enabled'
      },
      {
        skillId: 'skill_lifting_detection',
        skillName: '吊装作业安全识别',
        description: '识别吊装作业中的违规操作',
        category: '专项作业',
        icon: 'Warning',
        color: '#409EFF',
        status: 'enabled'
      },
      {
        skillId: 'skill_helmet_detection',
        skillName: '安全帽佩戴识别',
        description: '识别作业人员是否正确佩戴安全帽',
        category: '安全监控',
        icon: 'Camera',
        color: '#F56C6C',
        status: 'enabled'
      }
    ]
  }
];

// 可用的AI技能列表（从常量映射）
const availableSkills = AI_SKILLS.map((skill) => ({
  skillId: skill.id,
  skillName: skill.name,
  description: skill.description,
  category: skill.category,
  icon: skill.icon,
  color: skill.color,
  status: 'enabled' as 'enabled' | 'disabled',
  workTypes: skill.workTypes
}));

const videoList = ref<VideoVO[]>([]);
const allVideoList = ref<VideoVO[]>([...staticVideoData]);
const loading = ref(false);
const showSearch = ref(true);
const selectedIds = ref<Array<string>>([]);
const multiple = ref(true);
const total = ref(0);
const selectedSkills = ref<string[]>([]);

const queryFormRef = ref<ElFormInstance>();

const configDialog = reactive<DialogOption & { isBatch: boolean }>({
  visible: false,
  title: '',
  isBatch: false
});

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const previewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    videoId: '',
    deviceId: '',
    principal: '',
    skillConfigured: ''
  } as VideoQuery,
  currentVideo: {} as VideoVO,
  viewData: {} as VideoVO,
  previewData: {} as VideoVO
});

const { queryParams, currentVideo, viewData, previewData } = toRefs(data);

// 计算统计数据
const configuredVideoCount = computed(() => {
  return allVideoList.value.filter((video) => video.configuredSkills && video.configuredSkills.length > 0).length;
});

const unconfiguredVideoCount = computed(() => {
  return allVideoList.value.filter((video) => !video.configuredSkills || video.configuredSkills.length === 0).length;
});

const totalSkillUsage = computed(() => {
  return allVideoList.value.reduce((sum, video) => sum + (video.configuredSkills?.length || 0), 0);
});

/** 查询视频列表 */
const getList = () => {
  loading.value = true;

  setTimeout(() => {
    const filteredData = allVideoList.value.filter((video) => {
      let match = true;
      if (queryParams.value.videoId && !video.videoId.includes(queryParams.value.videoId)) {
        match = false;
      }
      if (queryParams.value.deviceId && !video.deviceId.includes(queryParams.value.deviceId)) {
        match = false;
      }
      if (queryParams.value.principal && !video.principal.includes(queryParams.value.principal)) {
        match = false;
      }
      if (queryParams.value.skillConfigured !== '' && queryParams.value.skillConfigured !== undefined) {
        const isConfigured = queryParams.value.skillConfigured === 'true';
        const hasSkills = video.configuredSkills && video.configuredSkills.length > 0;
        if (isConfigured !== hasSkills) {
          match = false;
        }
      }
      return match;
    });

    total.value = filteredData.length;

    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
    const end = start + queryParams.value.pageSize;
    videoList.value = filteredData.slice(start, end);

    loading.value = false;
  }, 300);
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 查看视频详情 */
const handleView = (row: VideoVO) => {
  viewData.value = { ...row };
  viewDialog.visible = true;
};

/** 从详情配置技能 */
const handleConfigFromView = () => {
  viewDialog.visible = false;
  handleConfigSkills(viewData.value);
};

/** 从详情播放视频 */
const handlePreviewFromView = () => {
  viewDialog.visible = false;
  handlePreview(viewData.value);
};

/** 配置技能 */
const handleConfigSkills = (row: VideoVO) => {
  currentVideo.value = { ...row };
  selectedSkills.value = row.configuredSkills ? row.configuredSkills.map((s) => s.skillId) : [];
  configDialog.visible = true;
  configDialog.title = `配置技能 - ${row.videoId}`;
  configDialog.isBatch = false;
};

/** 批量配置技能 */
const handleBatchConfig = () => {
  if (selectedIds.value.length === 0) {
    proxy?.$modal.msgWarning('请至少选择一个视频');
    return;
  }

  currentVideo.value = {} as VideoVO;
  selectedSkills.value = [];
  configDialog.visible = true;
  configDialog.title = `批量配置技能 (${selectedIds.value.length} 个视频)`;
  configDialog.isBatch = true;
};

/** 全选技能 */
const handleSelectAllSkills = () => {
  selectedSkills.value = availableSkills.filter((s) => s.status === 'enabled').map((s) => s.skillId);
};

/** 清空技能 */
const handleClearAllSkills = () => {
  selectedSkills.value = [];
};

/** 提交配置 */
const submitConfig = () => {
  if (selectedSkills.value.length === 0) {
    proxy?.$modal.msgWarning('请至少选择一个技能');
    return;
  }

  // 构建技能信息
  const skillsToConfig: SkillInfo[] = availableSkills
    .filter((skill) => selectedSkills.value.includes(skill.skillId))
    .map((skill) => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      description: skill.description,
      category: skill.category,
      icon: skill.icon,
      color: skill.color,
      status: skill.status
    }));

  if (configDialog.isBatch) {
    // 批量配置
    selectedIds.value.forEach((videoId) => {
      const index = allVideoList.value.findIndex((item) => item.videoId === videoId);
      if (index !== -1) {
        allVideoList.value[index].configuredSkills = [...skillsToConfig];
      }
    });
    proxy?.$modal.msgSuccess(`批量配置成功，已为 ${selectedIds.value.length} 个视频配置技能`);
  } else {
    // 单个配置
    const index = allVideoList.value.findIndex((item) => item.videoId === currentVideo.value.videoId);
    if (index !== -1) {
      allVideoList.value[index].configuredSkills = [...skillsToConfig];
    }
    proxy?.$modal.msgSuccess('技能配置成功');
  }

  configDialog.visible = false;
  getList();
};

/** 预览视频 */
const handlePreview = (row: VideoVO) => {
  previewData.value = { ...row };
  previewDialog.visible = true;
};

/** 导出配置 */
const handleExport = () => {
  const exportData = allVideoList.value.map((item) => ({
    视频ID: item.videoId,
    设备ID: item.deviceId,
    用户编号: item.userNumber,
    责任人: item.principal,
    视频时长: item.duration,
    拍摄时间: item.captureTime,
    已配置技能: item.configuredSkills ? item.configuredSkills.map((s) => s.skillName).join('、') : '未配置',
    技能数量: item.configuredSkills ? item.configuredSkills.length : 0
  }));

  exportToJSON(exportData, `视频技能配置_${formatDateTime(new Date(), 'date')}.json`);
  proxy?.$modal.msgSuccess('导出成功');
};

/** 选择条数 */
const handleSelectionChange = (selection: VideoVO[]) => {
  selectedIds.value = selection.map((item) => item.videoId);
  multiple.value = !selection.length;
};

/** 关闭配置对话框 */
const closeConfigDialog = () => {
  configDialog.visible = false;
  selectedSkills.value = [];
  currentVideo.value = {} as VideoVO;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.stat-card {
  height: 100%;
  border-radius: 10px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1.2;
        margin-bottom: 6px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.skill-checkbox-card {
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    border-color: #409eff;
    background-color: #f5f7fa;
  }

  &.is-checked {
    border-color: #409eff;
    background-color: #ecf5ff;
  }

  :deep(.el-checkbox) {
    width: 100%;

    .el-checkbox__label {
      width: 100%;
    }
  }

  .skill-checkbox-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .skill-checkbox-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .skill-info {
    flex: 1;

    .skill-name {
      font-weight: bold;
      font-size: 14px;
      color: #303133;
      margin-bottom: 4px;
    }

    .skill-desc {
      font-size: 12px;
      color: #909399;
      line-height: 1.4;
    }
  }

  .skill-checkbox-right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
}

.video-preview-container {
  width: 100%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.config-dialog-content {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.skill-selection-area {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}
</style>
