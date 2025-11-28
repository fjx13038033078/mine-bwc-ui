<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="技能名称" prop="skillName">
              <el-input v-model="queryParams.skillName" placeholder="请输入技能名称" clearable @keyup.enter="handleQuery" style="width: 200px" />
            </el-form-item>
            <el-form-item label="技能类别" prop="category">
              <el-select v-model="queryParams.category" placeholder="请选择类别" clearable style="width: 150px">
                <el-option label="安全监控" value="安全监控" />
                <el-option label="专项作业" value="专项作业" />
              </el-select>
            </el-form-item>
            <el-form-item label="技能状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
                <el-option label="启用" value="enabled" />
                <el-option label="停用" value="disabled" />
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
          <el-col :span="1.5">
            <el-button type="success" plain icon="CircleCheck" :disabled="multiple" @click="handleBatchEnable">批量启用</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="CircleClose" :disabled="multiple" @click="handleBatchDisable">批量停用</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="40" color="#409EFF"><i-ep-cpu /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ allSkillList.length }}</div>
                <div class="stat-label">技能总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="40" color="#67C23A"><i-ep-circle-check /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ enabledCount }}</div>
                <div class="stat-label">已启用</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="40" color="#909399"><i-ep-circle-close /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ disabledCount }}</div>
                <div class="stat-label">已停用</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="40" color="#E6A23C"><i-ep-connection /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ totalDeviceUsage }}</div>
                <div class="stat-label">设备使用次数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-table v-loading="loading" border :data="skillList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="技能ID" align="center" prop="skillId" width="180" />
        <el-table-column label="技能名称" align="left" prop="skillName" min-width="180">
          <template #default="scope">
            <div class="skill-name-cell">
              <el-icon :size="20" :color="scope.row.color">
                <component :is="scope.row.icon" />
              </el-icon>
              <span class="skill-name">{{ scope.row.skillName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="技能类别" align="center" prop="category" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.category === '安全监控' ? 'danger' : 'primary'" size="small">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ scope.row.status === 'enabled' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="设备使用数" align="center" prop="deviceUsageCount" width="110">
          <template #default="scope">
            <el-tag type="warning" size="small" v-if="scope.row.deviceUsageCount > 0">
              {{ scope.row.deviceUsageCount }} 台
            </el-tag>
            <span v-else style="color: #909399">0 台</span>
          </template>
        </el-table-column>
        <el-table-column label="识别次数" align="center" prop="detectionCount" width="100">
          <template #default="scope">
            <span :style="{ color: scope.row.detectionCount > 0 ? '#409EFF' : '#909399', fontWeight: scope.row.detectionCount > 0 ? 'bold' : 'normal' }">
              {{ scope.row.detectionCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="违规识别数" align="center" prop="violationCount" width="110">
          <template #default="scope">
            <span :style="{ color: scope.row.violationCount > 0 ? '#F56C6C' : '#909399', fontWeight: scope.row.violationCount > 0 ? 'bold' : 'normal' }">
              {{ scope.row.violationCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="适用作业" align="center" prop="workTypes" width="140" :show-overflow-tooltip="true">
          <template #default="scope">
            <span>{{ scope.row.workTypes.join('、') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />

        <el-table-column label="操作" fixed="right" width="260" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip :content="scope.row.status === 'enabled' ? '停用' : '启用'" placement="top">
              <el-button
                link
                :type="scope.row.status === 'enabled' ? 'warning' : 'success'"
                :icon="scope.row.status === 'enabled' ? 'VideoPause' : 'VideoPlay'"
                @click="handleToggleStatus(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="关联知识库" placement="top">
              <el-button link type="primary" icon="Document" @click="handleViewKnowledge(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="使用设备" placement="top">
              <el-button link type="primary" icon="Monitor" @click="handleViewDevices(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 技能详情对话框 -->
    <el-dialog v-model="viewDialog.visible" title="技能详情" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="技能ID">{{ viewData.skillId }}</el-descriptions-item>
        <el-descriptions-item label="技能状态">
          <el-tag :type="viewData.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ viewData.status === 'enabled' ? '启用' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="技能名称" :span="2">
          <div class="skill-name-cell">
            <el-icon :size="20" :color="viewData.color">
              <component :is="viewData.icon" />
            </el-icon>
            <span class="skill-name">{{ viewData.skillName }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="技能类别">
          <el-tag :type="viewData.category === '安全监控' ? 'danger' : 'primary'" size="small">
            {{ viewData.category }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="适用作业">
          {{ viewData.workTypes?.join('、') }}
        </el-descriptions-item>
        <el-descriptions-item label="设备使用数">
          <el-tag type="warning" size="small">{{ viewData.deviceUsageCount }} 台</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="识别次数">
          <el-tag type="primary" size="small">{{ viewData.detectionCount }} 次</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="违规识别数" :span="2">
          <el-tag type="danger" size="small">{{ viewData.violationCount }} 次</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="技能描述" :span="2">
          {{ viewData.description }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ viewData.updateTime }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">技能详细说明</el-divider>
      <el-alert :title="`${viewData.skillName} - 使用说明`" type="info" :closable="false" style="margin-bottom: 16px">
        <p style="line-height: 1.8">{{ viewData.description }}</p>
      </el-alert>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            :type="viewData.status === 'enabled' ? 'warning' : 'success'"
            :icon="viewData.status === 'enabled' ? 'VideoPause' : 'VideoPlay'"
            @click="handleToggleStatusInDialog"
          >
            {{ viewData.status === 'enabled' ? '停用技能' : '启用技能' }}
          </el-button>
          <el-button @click="viewDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 关联文档库对话框 -->
    <el-dialog v-model="knowledgeDialog.visible" :title="`【${currentSkillName}】关联文档库`" width="1100px" append-to-body>
      <!-- 顶部说明 -->
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <template #title>
          <div style="display: flex; align-items: center; gap: 8px">
            <el-icon :size="18"><i-ep-info-filled /></el-icon>
            <span style="font-weight: bold">文档关联说明</span>
          </div>
        </template>
        <p style="margin: 8px 0 0 0; line-height: 1.6">
          选择文档分类，系统将显示该分类下的所有文档。AI识别时将参考这些文档知识进行判定和处理。
          支持同时选择多个分类，便于综合管理相关文档资料。
        </p>
      </el-alert>

      <!-- 统计概览 -->
      <el-row :gutter="15" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-mini-card">
            <div class="stat-mini-content">
              <div class="stat-mini-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                <el-icon :size="24"><i-ep-folder /></el-icon>
              </div>
              <div class="stat-mini-info">
                <div class="stat-mini-value">{{ documentCategories.length }}</div>
                <div class="stat-mini-label">可选分类</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-mini-card">
            <div class="stat-mini-content">
              <div class="stat-mini-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                <el-icon :size="24"><i-ep-select /></el-icon>
              </div>
              <div class="stat-mini-info">
                <div class="stat-mini-value">{{ selectedCategories.length }}</div>
                <div class="stat-mini-label">已选分类</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-mini-card">
            <div class="stat-mini-content">
              <div class="stat-mini-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                <el-icon :size="24"><i-ep-document /></el-icon>
              </div>
              <div class="stat-mini-info">
                <div class="stat-mini-value">{{ allDocuments.length }}</div>
                <div class="stat-mini-label">文档总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-mini-card">
            <div class="stat-mini-content">
              <div class="stat-mini-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
                <el-icon :size="24"><i-ep-files /></el-icon>
              </div>
              <div class="stat-mini-info">
                <div class="stat-mini-value">{{ filteredDocuments.length }}</div>
                <div class="stat-mini-label">关联文档</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 文档分类选择 -->
      <el-card shadow="hover" style="margin-bottom: 20px">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-icon :size="18" color="#409EFF"><i-ep-folder-opened /></el-icon>
              <span style="font-weight: bold; font-size: 15px">知识库分类选择</span>
            </div>
            <div style="display: flex; gap: 8px">
              <el-button size="small" @click="handleSelectAll">全选</el-button>
              <el-button size="small" @click="handleClearAll">清空</el-button>
            </div>
          </div>
        </template>
        <el-checkbox-group v-model="selectedCategories" @change="handleCategoryChange">
          <el-row :gutter="12">
            <el-col :span="6" v-for="category in documentCategories" :key="category">
              <div class="category-checkbox-wrapper">
                <el-checkbox :label="category">
                  <div style="display: flex; align-items: center; gap: 6px">
                    <el-tag size="small" :type="getCategoryTagType(category)">{{ category }}</el-tag>
                    <span style="color: #909399; font-size: 12px">({{ getCategoryDocCount(category) }})</span>
                  </div>
                </el-checkbox>
              </div>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </el-card>

      <!-- 关联文档列表 -->
      <el-card shadow="hover">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-icon :size="18" color="#67C23A"><i-ep-document-copy /></el-icon>
              <span style="font-weight: bold; font-size: 15px">关联文档列表</span>
              <el-tag v-if="filteredDocuments.length > 0" size="small" type="success">
                {{ filteredDocuments.length }} 份文档
              </el-tag>
            </div>
          </div>
        </template>

        <el-table :data="filteredDocuments" border max-height="350" v-if="filteredDocuments.length > 0">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="文档ID" prop="documentId" width="110" align="center" />
          <el-table-column label="文档名称" prop="fileName" min-width="180" show-overflow-tooltip>
            <template #default="scope">
              <div style="display: flex; align-items: center; gap: 6px">
                <el-icon color="#409EFF"><i-ep-document /></el-icon>
                <span>{{ scope.row.fileName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="文件分类" prop="category" width="180" align="center">
            <template #default="scope">
              <el-tag :type="getDocCategoryColor(scope.row.category)" size="small">
                {{ scope.row.category }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="文件类型" prop="fileType" width="100" align="center">
            <template #default="scope">
              <el-tag size="small" effect="plain">{{ scope.row.fileType.toUpperCase() }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="文件大小" prop="fileSize" width="100" align="center" />
          <el-table-column label="上传时间" prop="uploadTime" width="160" align="center" />
        </el-table>

        <el-empty v-else description="请选择文档分类查看相关文档" :image-size="120">
          <template #image>
            <el-icon :size="80" color="#C0C4CC"><i-ep-folder-opened /></el-icon>
          </template>
        </el-empty>
      </el-card>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="knowledgeDialog.visible = false">
            <el-icon><i-ep-check /></el-icon>
            <span>确 定</span>
          </el-button>
          <el-button @click="knowledgeDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 使用设备列表对话框 -->
    <el-dialog v-model="devicesDialog.visible" :title="`使用【${currentSkillName}】技能的设备`" width="900px" append-to-body>
      <el-table :data="relatedDevices" border>
        <el-table-column label="设备ID" prop="deviceId" width="120" />
        <el-table-column label="序列号" prop="serialNumber" width="140" />
        <el-table-column label="型号" prop="model" width="120" />
        <el-table-column label="归属部门" prop="department" width="100" />
        <el-table-column label="责任人" prop="principal" width="100" />
        <el-table-column label="设备状态" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="getDeviceStatusInfo(scope.row.status).type" size="small">
              {{ getDeviceStatusInfo(scope.row.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="视频数" prop="videoCount" width="80" />
        <el-table-column label="违规数" prop="violationCount" width="80">
          <template #default="scope">
            <span :style="{ color: scope.row.violationCount > 0 ? '#F56C6C' : '', fontWeight: scope.row.violationCount > 0 ? 'bold' : 'normal' }">
              {{ scope.row.violationCount }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="devicesDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AISkillsManagement" lang="ts">
import { AI_SKILLS } from '@/utils/copper-mine-constants';
import { formatDateTime, getDeviceStatusInfo } from '@/utils/copper-mine-utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 技能数据接口
interface AISkillVO {
  skillId: string;
  skillName: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  status: 'enabled' | 'disabled';
  workTypes: string[];
  deviceUsageCount: number;
  detectionCount: number;
  violationCount: number;
  createTime: string;
  updateTime: string;
}

interface SkillQuery {
  pageNum: number;
  pageSize: number;
  skillName?: string;
  category?: string;
  status?: string;
}

// 静态数据 - 基于常量初始化技能数据
const staticSkillData: AISkillVO[] = AI_SKILLS.map((skill, index) => ({
  skillId: skill.id,
  skillName: skill.name,
  description: skill.description,
  category: skill.category,
  icon: skill.icon,
  color: skill.color,
  status: index < 6 ? 'enabled' : 'disabled', // 前6个启用，后2个停用
  workTypes: skill.workTypes,
  deviceUsageCount: index < 6 ? Math.floor(Math.random() * 15) + 5 : 0, // 启用的有使用数据
  detectionCount: index < 6 ? Math.floor(Math.random() * 500) + 100 : 0,
  violationCount: index < 6 ? Math.floor(Math.random() * 50) + 10 : 0,
  createTime: '2024-01-10 09:00:00',
  updateTime: formatDateTime()
}));

const skillList = ref<AISkillVO[]>([]);
const allSkillList = ref<AISkillVO[]>([...staticSkillData]);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string>>([]);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const knowledgeDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const devicesDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    skillName: '',
    category: '',
    status: ''
  } as SkillQuery,
  viewData: {} as AISkillVO,
  currentSkillName: '',
  activeTab: 'regulations',
  relatedRegulations: [] as any[],
  relatedHandling: [] as any[],
  relatedDevices: [] as any[],
  // 文档相关数据
  selectedCategories: [] as string[],
  allDocuments: [] as any[]
});

const { queryParams, viewData, currentSkillName, activeTab, relatedRegulations, relatedHandling, relatedDevices, selectedCategories, allDocuments } = toRefs(data);

// 计算统计数据
const enabledCount = computed(() => {
  return allSkillList.value.filter((skill) => skill.status === 'enabled').length;
});

const disabledCount = computed(() => {
  return allSkillList.value.filter((skill) => skill.status === 'disabled').length;
});

const totalDeviceUsage = computed(() => {
  return allSkillList.value.reduce((sum, skill) => sum + skill.deviceUsageCount, 0);
});

// 文档分类列表
const documentCategories = ref([
  '管理制度',
  '操作规程',
  '处罚条例',
  '应急预案',
  '铜矿安全作业规范库',
  '铜矿不安全作业行为处理知识库',
  '培训教材',
  '事故案例',
  '安全检查表',
  '风险评估报告',
  '其他文件'
]);

// 根据选中的分类过滤文档
const filteredDocuments = computed(() => {
  if (selectedCategories.value.length === 0) {
    return [];
  }
  return allDocuments.value.filter((doc) => selectedCategories.value.includes(doc.category));
});

/** 获取严重等级类型 */
const getSeverityType = (severity: string): 'success' | 'info' | 'warning' | 'danger' => {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    一般: 'info',
    较重: 'warning',
    严重: 'danger',
    特别严重: 'danger'
  };
  return map[severity] || 'info';
};

/** 获取分类标签类型 */
const getCategoryTagType = (category: string): 'success' | 'info' | 'warning' | 'danger' | 'primary' => {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'primary'> = {
    管理制度: 'primary',
    操作规程: 'success',
    处罚条例: 'danger',
    应急预案: 'warning',
    铜矿安全作业规范库: 'success',
    铜矿不安全作业行为处理知识库: 'warning',
    培训教材: 'info',
    事故案例: 'danger',
    安全检查表: 'success',
    风险评估报告: 'warning',
    其他文件: 'info'
  };
  return map[category] || 'info';
};

/** 获取文档分类颜色 */
const getDocCategoryColor = (category: string): 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const colorMap: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    管理制度: 'primary',
    操作规程: 'success',
    处罚条例: 'danger',
    应急预案: 'warning',
    铜矿安全作业规范库: 'success',
    铜矿不安全作业行为处理知识库: 'warning',
    其他文件: 'info'
  };
  return colorMap[category] || 'info';
};

/** 处理分类变化 */
const handleCategoryChange = (value: string[]) => {
  console.log('选中的分类：', value);
};

/** 全选分类 */
const handleSelectAll = () => {
  selectedCategories.value = [...documentCategories.value];
};

/** 清空分类 */
const handleClearAll = () => {
  selectedCategories.value = [];
};

/** 获取分类下的文档数量 */
const getCategoryDocCount = (category: string) => {
  return allDocuments.value.filter((doc) => doc.category === category).length;
};

/** 查询技能列表 */
const getList = () => {
  loading.value = true;

  setTimeout(() => {
    const filteredData = allSkillList.value.filter((skill) => {
      let match = true;
      if (queryParams.value.skillName && !skill.skillName.includes(queryParams.value.skillName)) {
        match = false;
      }
      if (queryParams.value.category && skill.category !== queryParams.value.category) {
        match = false;
      }
      if (queryParams.value.status && skill.status !== queryParams.value.status) {
        match = false;
      }
      return match;
    });

    total.value = filteredData.length;

    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
    const end = start + queryParams.value.pageSize;
    skillList.value = filteredData.slice(start, end);

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

/** 查看技能详情 */
const handleView = (row: AISkillVO) => {
  viewData.value = { ...row };
  viewDialog.visible = true;
};

/** 切换技能状态 */
const handleToggleStatus = (row: AISkillVO) => {
  const action = row.status === 'enabled' ? '停用' : '启用';
  const tip = row.status === 'enabled' ? '停用后，设备将无法配置此技能，已配置的设备不受影响。' : '启用后，设备可以配置此技能进行AI识别。';

  proxy?.$modal
    .confirm(`确认${action}【${row.skillName}】技能吗？${tip}`)
    .then(() => {
      const index = allSkillList.value.findIndex((item) => item.skillId === row.skillId);
      if (index !== -1) {
        allSkillList.value[index].status = row.status === 'enabled' ? 'disabled' : 'enabled';
        allSkillList.value[index].updateTime = formatDateTime();

        // 如果停用，清空使用数据
        if (allSkillList.value[index].status === 'disabled') {
          allSkillList.value[index].deviceUsageCount = 0;
          allSkillList.value[index].detectionCount = 0;
          allSkillList.value[index].violationCount = 0;
        }
      }
      proxy?.$modal.msgSuccess(`${action}成功`);
      getList();
    })
    .catch(() => {});
};

/** 在详情对话框中切换状态 */
const handleToggleStatusInDialog = () => {
  handleToggleStatus(viewData.value);
  viewDialog.visible = false;
};

/** 批量启用 */
const handleBatchEnable = () => {
  const skillNames = ids.value
    .map((id) => allSkillList.value.find((skill) => skill.skillId === id)?.skillName)
    .filter(Boolean)
    .join('、');

  proxy?.$modal
    .confirm(`确认批量启用【${skillNames}】技能吗？`)
    .then(() => {
      ids.value.forEach((id) => {
        const index = allSkillList.value.findIndex((item) => item.skillId === id);
        if (index !== -1 && allSkillList.value[index].status === 'disabled') {
          allSkillList.value[index].status = 'enabled';
          allSkillList.value[index].updateTime = formatDateTime();
          // 启用后初始化使用数据
          allSkillList.value[index].deviceUsageCount = Math.floor(Math.random() * 5) + 1;
        }
      });
      proxy?.$modal.msgSuccess('批量启用成功');
      getList();
    })
    .catch(() => {});
};

/** 批量停用 */
const handleBatchDisable = () => {
  const skillNames = ids.value
    .map((id) => allSkillList.value.find((skill) => skill.skillId === id)?.skillName)
    .filter(Boolean)
    .join('、');

  proxy?.$modal
    .confirm(`确认批量停用【${skillNames}】技能吗？停用后，设备将无法配置这些技能。`)
    .then(() => {
      ids.value.forEach((id) => {
        const index = allSkillList.value.findIndex((item) => item.skillId === id);
        if (index !== -1 && allSkillList.value[index].status === 'enabled') {
          allSkillList.value[index].status = 'disabled';
          allSkillList.value[index].updateTime = formatDateTime();
          allSkillList.value[index].deviceUsageCount = 0;
          allSkillList.value[index].detectionCount = 0;
          allSkillList.value[index].violationCount = 0;
        }
      });
      proxy?.$modal.msgSuccess('批量停用成功');
      getList();
    })
    .catch(() => {});
};

/** 查看关联知识库 */
const handleViewKnowledge = (row: AISkillVO) => {
  currentSkillName.value = row.skillName;

  // 模拟关联的规范数据
  relatedRegulations.value = [
    {
      regulationId: 'REG001',
      workType: row.workTypes[0],
      standards: '作业人员必须佩戴安全帽、安全带等个人防护装备；作业前必须进行安全检查',
      violations: '未佩戴安全帽；未系安全带；无安全检查记录'
    },
    {
      regulationId: 'REG002',
      workType: row.workTypes[0],
      standards: '作业区域必须设置警示标志；配备灭火器材；保持通风良好',
      violations: '无警示标志；无灭火器；通风不良'
    }
  ];

  // 模拟关联的处理知识数据
  relatedHandling.value = [
    {
      knowledgeId: 'KNW001',
      violationName: '未佩戴安全帽',
      severity: '较重',
      immediateAction: '立即停止作业，要求作业人员佩戴安全帽'
    },
    {
      knowledgeId: 'KNW002',
      violationName: '未系安全带',
      severity: '严重',
      immediateAction: '立即停止高处作业，检查安全带并正确佩戴'
    }
  ];

  // 模拟文档库数据
  allDocuments.value = [
    {
      documentId: 'DOC001',
      fileName: '矿井安全管理制度.pdf',
      category: '管理制度',
      fileType: 'pdf',
      fileSize: '2.3 MB',
      uploadTime: '2024-01-10 09:00:00'
    },
    {
      documentId: 'DOC002',
      fileName: '焊割作业操作规程.pdf',
      category: '操作规程',
      fileType: 'pdf',
      fileSize: '1.8 MB',
      uploadTime: '2024-01-11 10:30:00'
    },
    {
      documentId: 'DOC003',
      fileName: '安全生产违章处罚条例.docx',
      category: '处罚条例',
      fileType: 'docx',
      fileSize: '856 KB',
      uploadTime: '2024-01-12 14:15:00'
    },
    {
      documentId: 'DOC004',
      fileName: '矿井火灾事故应急预案.docx',
      category: '应急预案',
      fileType: 'docx',
      fileSize: '3.2 MB',
      uploadTime: '2024-01-11 14:20:00'
    },
    {
      documentId: 'DOC005',
      fileName: '铜矿吊装作业安全规范汇编.pdf',
      category: '铜矿安全作业规范库',
      fileType: 'pdf',
      fileSize: '4.5 MB',
      uploadTime: '2024-01-12 09:15:00'
    },
    {
      documentId: 'DOC006',
      fileName: '铜矿高处作业违规行为处理指南.pdf',
      category: '铜矿不安全作业行为处理知识库',
      fileType: 'pdf',
      fileSize: '5.8 MB',
      uploadTime: '2024-01-12 15:30:00'
    },
    {
      documentId: 'DOC007',
      fileName: '个人防护用品使用规范.docx',
      category: '操作规程',
      fileType: 'docx',
      fileSize: '1.2 MB',
      uploadTime: '2024-01-13 10:00:00'
    },
    {
      documentId: 'DOC008',
      fileName: '铜矿焊割作业安全规范手册.pdf',
      category: '铜矿安全作业规范库',
      fileType: 'pdf',
      fileSize: '8.3 MB',
      uploadTime: '2024-01-13 16:45:00'
    },
    {
      documentId: 'DOC009',
      fileName: '安全生产培训教材.pdf',
      category: '培训教材',
      fileType: 'pdf',
      fileSize: '12.5 MB',
      uploadTime: '2024-01-14 09:00:00'
    },
    {
      documentId: 'DOC010',
      fileName: '典型事故案例分析.pdf',
      category: '事故案例',
      fileType: 'pdf',
      fileSize: '6.7 MB',
      uploadTime: '2024-01-15 11:20:00'
    },
    {
      documentId: 'DOC011',
      fileName: '安全检查表（焊割作业）.xlsx',
      category: '安全检查表',
      fileType: 'xlsx',
      fileSize: '245 KB',
      uploadTime: '2024-01-16 08:30:00'
    },
    {
      documentId: 'DOC012',
      fileName: '风险评估报告-铜矿采掘.pdf',
      category: '风险评估报告',
      fileType: 'pdf',
      fileSize: '4.2 MB',
      uploadTime: '2024-01-17 14:00:00'
    }
  ];

  // 默认选中与技能相关的分类
  selectedCategories.value = ['铜矿安全作业规范库', '铜矿不安全作业行为处理知识库'];

  knowledgeDialog.visible = true;
};

/** 查看使用设备 */
const handleViewDevices = (row: AISkillVO) => {
  currentSkillName.value = row.skillName;

  // 模拟使用该技能的设备数据
  relatedDevices.value = [
    {
      deviceId: 'DEV001',
      serialNumber: 'SN2024001',
      model: 'AI-CAM-V3',
      department: '采矿部',
      principal: '张三',
      status: 'online',
      videoCount: 245,
      violationCount: 12
    },
    {
      deviceId: 'DEV002',
      serialNumber: 'SN2024002',
      model: 'AI-CAM-V3',
      department: '采矿部',
      principal: '李四',
      status: 'online',
      videoCount: 198,
      violationCount: 8
    },
    {
      deviceId: 'DEV003',
      serialNumber: 'SN2024003',
      model: 'AI-CAM-V2',
      department: '安全部',
      principal: '王五',
      status: 'online',
      videoCount: 312,
      violationCount: 15
    }
  ];

  devicesDialog.visible = true;
};

/** 选择条数  */
const handleSelectionChange = (selection: AISkillVO[]) => {
  ids.value = selection.map((item) => item.skillId);
  multiple.value = !selection.length;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-text {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.skill-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .skill-name {
    flex: 1;
    font-weight: 500;
  }
}

.stat-mini-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-card__body) {
    padding: 16px;
  }

  .stat-mini-content {
    display: flex;
    align-items: center;
    gap: 12px;

    .stat-mini-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }

    .stat-mini-info {
      flex: 1;

      .stat-mini-value {
        font-size: 22px;
        font-weight: bold;
        color: #303133;
        line-height: 1.2;
        margin-bottom: 4px;
      }

      .stat-mini-label {
        font-size: 13px;
        color: #909399;
      }
    }
  }
}

.category-checkbox-wrapper {
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s;
  margin-bottom: 8px;

  &:hover {
    background-color: #f5f7fa;
  }

  :deep(.el-checkbox) {
    width: 100%;

    .el-checkbox__label {
      width: 100%;
    }
  }
}
</style>

