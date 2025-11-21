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
            <el-form-item label="配置状态" prop="configured">
              <el-select v-model="queryParams.configured" placeholder="请选择状态" clearable style="width: 120px">
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

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增配置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport">导出配置</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="40" color="#409EFF"><i-ep-document /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ allPromptList.length }}</div>
                <div class="stat-label">总配置数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="40" color="#67C23A"><i-ep-circle-check /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ configuredCount }}</div>
                <div class="stat-label">已配置</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="40" color="#E6A23C"><i-ep-warning /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ unconfiguredCount }}</div>
                <div class="stat-label">待配置</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="40" color="#909399"><i-ep-sort /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ totalVersions }}</div>
                <div class="stat-label">版本总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-table v-loading="loading" border :data="promptList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
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
        <el-table-column label="配置状态" align="center" prop="configured" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.configured ? 'success' : 'warning'" size="small">
              {{ scope.row.configured ? '已配置' : '待配置' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前版本" align="center" prop="currentVersion" width="100">
          <template #default="scope">
            <el-tag type="primary" size="small">v{{ scope.row.currentVersion }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="版本数" align="center" prop="versionCount" width="80">
          <template #default="scope">
            <span :style="{ color: scope.row.versionCount > 1 ? '#409EFF' : '#909399' }">
              {{ scope.row.versionCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="系统提示词" align="left" prop="systemPrompt" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <span v-if="scope.row.systemPrompt" class="prompt-preview">
              {{ truncateText(scope.row.systemPrompt, 50) }}
            </span>
            <span v-else style="color: #909399">未配置</span>
          </template>
        </el-table-column>
        <el-table-column label="用户提示词" align="left" prop="userPrompt" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <span v-if="scope.row.userPrompt" class="prompt-preview">
              {{ truncateText(scope.row.userPrompt, 50) }}
            </span>
            <span v-else style="color: #909399">未配置</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />

        <el-table-column label="操作" fixed="right" width="300" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="编辑配置" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="版本管理" placement="top">
              <el-button link type="primary" icon="FolderOpened" @click="handleVersions(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="测试提示词" placement="top">
              <el-button link type="success" icon="CircleCheck" @click="handleTest(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新增/编辑提示词配置对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="900px" append-to-body @close="closeDialog">
      <el-form ref="promptFormRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="技能名称" prop="skillId">
              <el-select v-model="form.skillId" placeholder="请选择技能" style="width: 100%" :disabled="!!form.promptId" @change="handleSkillChange">
                <el-option v-for="skill in enabledSkills" :key="skill.id" :label="skill.name" :value="skill.id">
                  <div class="skill-option">
                    <el-icon :color="skill.color">
                      <component :is="skill.icon" />
                    </el-icon>
                    <span style="margin-left: 8px">{{ skill.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="form.version" placeholder="如：1.0" maxlength="20" />
              <div class="form-tip">修改配置将自动创建新版本</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="系统提示词" prop="systemPrompt">
          <el-input
            v-model="form.systemPrompt"
            type="textarea"
            :rows="6"
            placeholder="定义模型的整体行为和角色，如：你是一个铜矿安全监控AI助手，专门识别井下作业中的违规行为..."
            maxlength="2000"
            show-word-limit
          />
          <div class="form-tip">
            <el-icon><i-ep-info-filled /></el-icon>
            系统提示词用于定义AI的角色、能力和行为准则
          </div>
        </el-form-item>

        <el-form-item label="用户提示词" prop="userPrompt">
          <el-input
            v-model="form.userPrompt"
            type="textarea"
            :rows="8"
            placeholder="详细描述识别任务，如：请分析视频中的作业人员是否佩戴了安全帽、安全带等防护装备，如发现违规请指出..."
            maxlength="2000"
            show-word-limit
          />
          <div class="form-tip">
            <el-icon><i-ep-info-filled /></el-icon>
            用户提示词用于具体的识别任务描述和要求
          </div>
        </el-form-item>

        <el-form-item label="配置说明">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="本次配置的说明或变更内容" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">保 存</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 提示词详情对话框 -->
    <el-dialog v-model="viewDialog.visible" :title="`${viewData.skillName} - 提示词配置详情`" width="900px" append-to-body>
      <el-descriptions :column="2" border>
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
        <el-descriptions-item label="配置状态">
          <el-tag :type="viewData.configured ? 'success' : 'warning'" size="small">
            {{ viewData.configured ? '已配置' : '待配置' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前版本">
          <el-tag type="primary" size="small">v{{ viewData.currentVersion }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="版本数量">{{ viewData.versionCount }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ viewData.updateTime }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">系统提示词（System Prompt）</el-divider>
      <el-card shadow="never" class="prompt-card">
        <pre class="prompt-content">{{ viewData.systemPrompt || '暂无配置' }}</pre>
      </el-card>

      <el-divider content-position="left">用户提示词（User Prompt）</el-divider>
      <el-card shadow="never" class="prompt-card">
        <pre class="prompt-content">{{ viewData.userPrompt || '暂无配置' }}</pre>
      </el-card>

      <el-divider content-position="left" v-if="viewData.description">配置说明</el-divider>
      <el-alert v-if="viewData.description" :title="viewData.description" type="info" :closable="false" />

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" icon="Edit" @click="handleEditFromView">编辑配置</el-button>
          <el-button type="success" icon="CircleCheck" @click="handleTestFromView">测试提示词</el-button>
          <el-button @click="viewDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 版本管理对话框 -->
    <el-dialog v-model="versionDialog.visible" :title="`${currentSkillName} - 版本管理`" width="1000px" append-to-body>
      <el-table :data="versionList" border>
        <el-table-column label="版本号" prop="version" width="100">
          <template #default="scope">
            <el-tag type="primary" size="small">v{{ scope.row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="isCurrent" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isCurrent" type="success" size="small">当前版本</el-tag>
            <el-tag v-else type="info" size="small">历史版本</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="系统提示词" prop="systemPrompt" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <span class="prompt-preview">{{ truncateText(scope.row.systemPrompt, 60) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户提示词" prop="userPrompt" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <span class="prompt-preview">{{ truncateText(scope.row.userPrompt, 60) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="配置说明" prop="description" :show-overflow-tooltip="true" width="150" />
        <el-table-column label="创建时间" prop="createTime" width="160" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleViewVersion(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="切换到此版本" placement="top" v-if="!scope.row.isCurrent">
              <el-button link type="success" icon="Select" @click="handleSwitchVersion(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="对比版本" placement="top">
              <el-button link type="primary" icon="Operation" @click="handleCompareVersion(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="versionDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 测试提示词对话框 -->
    <el-dialog v-model="testDialog.visible" :title="`测试提示词 - ${testData.skillName}`" width="900px" append-to-body>
      <el-alert title="提示词测试功能" type="info" :closable="false" style="margin-bottom: 16px">
        <p>此功能用于预览和测试配置的提示词效果，实际项目中可对接大模型API进行真实测试。</p>
      </el-alert>

      <el-form label-width="120px">
        <el-form-item label="测试场景">
          <el-select v-model="testData.scenario" placeholder="请选择测试场景" style="width: 100%">
            <el-option label="未佩戴安全帽" value="no_helmet" />
            <el-option label="未系安全带" value="no_safety_belt" />
            <el-option label="违规操作设备" value="improper_operation" />
            <el-option label="禁止区域作业" value="restricted_area" />
          </el-select>
        </el-form-item>

        <el-form-item label="测试输入">
          <el-input
            v-model="testData.input"
            type="textarea"
            :rows="4"
            placeholder="输入测试数据，如：视频中作业人员未佩戴安全帽..."
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="VideoPlay" @click="runTest" :loading="testData.testing">
            {{ testData.testing ? '测试中...' : '运行测试' }}
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider content-position="left">测试结果</el-divider>
      <el-card v-if="testData.result" shadow="never" class="test-result-card">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="识别结果">
            <el-tag :type="testData.result.detected ? 'danger' : 'success'" size="small">
              {{ testData.result.detected ? '检测到违规' : '未检测到违规' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="违规类型" v-if="testData.result.detected">
            {{ testData.result.violationType }}
          </el-descriptions-item>
          <el-descriptions-item label="置信度">{{ (testData.result.confidence * 100).toFixed(2) }}%</el-descriptions-item>
          <el-descriptions-item label="详细描述">{{ testData.result.description }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-empty v-else description="暂无测试结果" :image-size="100" />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="testDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PromptConfiguration" lang="ts">
import { AI_SKILLS } from '@/utils/copper-mine-constants';
import { formatDateTime, truncateText, exportToJSON } from '@/utils/copper-mine-utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 提示词配置数据接口
interface PromptConfigVO {
  promptId: string;
  skillId: string;
  skillName: string;
  category: string;
  icon: string;
  color: string;
  systemPrompt: string;
  userPrompt: string;
  configured: boolean;
  currentVersion: string;
  versionCount: number;
  description?: string;
  createTime: string;
  updateTime: string;
}

interface PromptVersion {
  versionId: string;
  promptId: string;
  version: string;
  systemPrompt: string;
  userPrompt: string;
  description?: string;
  isCurrent: boolean;
  createTime: string;
}

interface PromptForm {
  promptId?: string;
  skillId: string;
  systemPrompt: string;
  userPrompt: string;
  version: string;
  description?: string;
}

interface PromptQuery {
  pageNum: number;
  pageSize: number;
  skillName?: string;
  category?: string;
  configured?: string;
}

// 获取已启用的技能列表
const enabledSkills = AI_SKILLS.filter((skill, index) => index < 6); // 假设前6个是启用的

// 静态数据 - 提示词配置
const staticPromptData: PromptConfigVO[] = AI_SKILLS.map((skill, index) => {
  const isConfigured = index < 4; // 前4个已配置
  return {
    promptId: `PROMPT_${skill.id.toUpperCase()}`,
    skillId: skill.id,
    skillName: skill.name,
    category: skill.category,
    icon: skill.icon,
    color: skill.color,
    systemPrompt: isConfigured
      ? `你是一个专业的铜矿安全监控AI助手，专门负责${skill.name}。你需要严格按照安全规范进行识别，确保作业人员的安全。你的识别结果将直接影响安全管理决策，因此必须准确、客观、及时。`
      : '',
    userPrompt: isConfigured
      ? `请仔细分析视频画面中的${skill.workTypes.join('、')}场景。重点关注：\n1. 作业人员是否按规范操作\n2. 是否存在违规行为\n3. 安全防护措施是否到位\n4. 作业环境是否符合安全要求\n\n如发现违规，请详细描述违规行为、位置和严重程度。`
      : '',
    configured: isConfigured,
    currentVersion: isConfigured ? `${index + 1}.0` : '0.0',
    versionCount: isConfigured ? Math.floor(Math.random() * 3) + 1 : 0,
    description: isConfigured ? `${skill.name}的提示词配置，优化识别准确率` : undefined,
    createTime: '2024-01-10 09:00:00',
    updateTime: formatDateTime()
  };
});

// 模拟版本历史数据
const staticVersionData: Record<string, PromptVersion[]> = {
  violation_detection: [
    {
      versionId: 'VER_001_003',
      promptId: 'PROMPT_VIOLATION_DETECTION',
      version: '3.0',
      systemPrompt: '你是一个专业的铜矿安全监控AI助手，专门负责违规行为识别。',
      userPrompt: '请分析视频中的违规行为...',
      description: '优化识别逻辑，提升准确率',
      isCurrent: true,
      createTime: '2024-11-20 14:30:00'
    },
    {
      versionId: 'VER_001_002',
      promptId: 'PROMPT_VIOLATION_DETECTION',
      version: '2.0',
      systemPrompt: '你是一个铜矿安全监控AI助手...',
      userPrompt: '请识别视频中的违规...',
      description: '增加更多识别场景',
      isCurrent: false,
      createTime: '2024-10-15 10:00:00'
    },
    {
      versionId: 'VER_001_001',
      promptId: 'PROMPT_VIOLATION_DETECTION',
      version: '1.0',
      systemPrompt: '你是一个AI助手...',
      userPrompt: '请分析视频...',
      description: '初始版本',
      isCurrent: false,
      createTime: '2024-09-01 09:00:00'
    }
  ]
};

const promptList = ref<PromptConfigVO[]>([]);
const allPromptList = ref<PromptConfigVO[]>([...staticPromptData]);
const versionList = ref<PromptVersion[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string>>([]);
const single = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const promptFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const versionDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const testDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PromptForm = {
  promptId: undefined,
  skillId: '',
  systemPrompt: '',
  userPrompt: '',
  version: '1.0',
  description: ''
};

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    skillName: '',
    category: '',
    configured: ''
  } as PromptQuery,
  form: { ...initFormData },
  rules: {
    skillId: [{ required: true, message: '请选择技能', trigger: 'change' }],
    systemPrompt: [{ required: true, message: '系统提示词不能为空', trigger: 'blur' }],
    userPrompt: [{ required: true, message: '用户提示词不能为空', trigger: 'blur' }],
    version: [{ required: true, message: '版本号不能为空', trigger: 'blur' }]
  },
  viewData: {} as PromptConfigVO,
  currentSkillName: '',
  testData: {
    skillName: '',
    scenario: '',
    input: '',
    testing: false,
    result: null as any
  }
});

const { queryParams, form, rules, viewData, currentSkillName, testData } = toRefs(data);

// 计算统计数据
const configuredCount = computed(() => {
  return allPromptList.value.filter((prompt) => prompt.configured).length;
});

const unconfiguredCount = computed(() => {
  return allPromptList.value.filter((prompt) => !prompt.configured).length;
});

const totalVersions = computed(() => {
  return allPromptList.value.reduce((sum, prompt) => sum + prompt.versionCount, 0);
});

/** 查询提示词配置列表 */
const getList = () => {
  loading.value = true;

  setTimeout(() => {
    const filteredData = allPromptList.value.filter((prompt) => {
      let match = true;
      if (queryParams.value.skillName && !prompt.skillName.includes(queryParams.value.skillName)) {
        match = false;
      }
      if (queryParams.value.category && prompt.category !== queryParams.value.category) {
        match = false;
      }
      if (queryParams.value.configured !== '' && queryParams.value.configured !== undefined) {
        const isConfigured = queryParams.value.configured === 'true';
        if (prompt.configured !== isConfigured) {
          match = false;
        }
      }
      return match;
    });

    total.value = filteredData.length;

    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
    const end = start + queryParams.value.pageSize;
    promptList.value = filteredData.slice(start, end);

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

/** 查看详情 */
const handleView = (row: PromptConfigVO) => {
  viewData.value = { ...row };
  viewDialog.visible = true;
};

/** 从详情编辑 */
const handleEditFromView = () => {
  viewDialog.visible = false;
  handleUpdate(viewData.value);
};

/** 从详情测试 */
const handleTestFromView = () => {
  viewDialog.visible = false;
  handleTest(viewData.value);
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增提示词配置';
};

/** 修改按钮操作 */
const handleUpdate = (row?: PromptConfigVO) => {
  reset();
  const prompt = row || allPromptList.value.find((item) => item.promptId === ids.value[0]);
  if (prompt) {
    dialog.visible = true;
    dialog.title = '修改提示词配置';
    form.value = {
      promptId: prompt.promptId,
      skillId: prompt.skillId,
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      version: String(parseFloat(prompt.currentVersion) + 0.1),
      description: ''
    };
  }
};

/** 技能选择变化 */
const handleSkillChange = (skillId: string) => {
  const skill = AI_SKILLS.find((s) => s.id === skillId);
  if (skill && !form.value.promptId) {
    // 新增时提供模板
    form.value.systemPrompt = `你是一个专业的铜矿安全监控AI助手，专门负责${skill.name}。`;
    form.value.userPrompt = `请分析视频中的${skill.workTypes.join('、')}场景...`;
  }
};

/** 提交表单 */
const submitForm = () => {
  promptFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const currentTime = formatDateTime();

      if (form.value.promptId) {
        // 更新配置
        const index = allPromptList.value.findIndex((item) => item.promptId === form.value.promptId);
        if (index !== -1) {
          allPromptList.value[index].systemPrompt = form.value.systemPrompt;
          allPromptList.value[index].userPrompt = form.value.userPrompt;
          allPromptList.value[index].currentVersion = form.value.version;
          allPromptList.value[index].versionCount += 1;
          allPromptList.value[index].configured = true;
          allPromptList.value[index].description = form.value.description;
          allPromptList.value[index].updateTime = currentTime;
        }
        proxy?.$modal.msgSuccess('修改成功，已生成新版本');
      } else {
        // 新增配置
        const skill = AI_SKILLS.find((s) => s.id === form.value.skillId);
        if (skill) {
          const newPrompt: PromptConfigVO = {
            promptId: `PROMPT_${form.value.skillId.toUpperCase()}`,
            skillId: form.value.skillId,
            skillName: skill.name,
            category: skill.category,
            icon: skill.icon,
            color: skill.color,
            systemPrompt: form.value.systemPrompt,
            userPrompt: form.value.userPrompt,
            configured: true,
            currentVersion: form.value.version,
            versionCount: 1,
            description: form.value.description,
            createTime: currentTime,
            updateTime: currentTime
          };

          // 更新或添加
          const existIndex = allPromptList.value.findIndex((item) => item.skillId === form.value.skillId);
          if (existIndex !== -1) {
            allPromptList.value[existIndex] = newPrompt;
          } else {
            allPromptList.value.push(newPrompt);
          }
        }
        proxy?.$modal.msgSuccess('新增成功');
      }
      dialog.visible = false;
      await getList();
    }
  });
};

/** 版本管理 */
const handleVersions = (row: PromptConfigVO) => {
  currentSkillName.value = row.skillName;
  // 获取该技能的版本历史（模拟）
  versionList.value = staticVersionData[row.skillId] || [
    {
      versionId: `VER_${row.promptId}_001`,
      promptId: row.promptId,
      version: row.currentVersion,
      systemPrompt: row.systemPrompt,
      userPrompt: row.userPrompt,
      description: row.description,
      isCurrent: true,
      createTime: row.updateTime
    }
  ];
  versionDialog.visible = true;
};

/** 查看版本详情 */
const handleViewVersion = (version: PromptVersion) => {
  const prompt = allPromptList.value.find((p) => p.promptId === version.promptId);
  if (prompt) {
    viewData.value = {
      ...prompt,
      systemPrompt: version.systemPrompt,
      userPrompt: version.userPrompt,
      currentVersion: version.version,
      description: version.description
    };
    viewDialog.visible = true;
  }
};

/** 切换版本 */
const handleSwitchVersion = (version: PromptVersion) => {
  proxy?.$modal
    .confirm(`确认切换到版本 v${version.version} 吗？`)
    .then(() => {
      const index = allPromptList.value.findIndex((item) => item.promptId === version.promptId);
      if (index !== -1) {
        allPromptList.value[index].systemPrompt = version.systemPrompt;
        allPromptList.value[index].userPrompt = version.userPrompt;
        allPromptList.value[index].currentVersion = version.version;
        allPromptList.value[index].updateTime = formatDateTime();
      }

      // 更新版本列表中的当前版本标记
      versionList.value.forEach((v) => {
        v.isCurrent = v.versionId === version.versionId;
      });

      proxy?.$modal.msgSuccess('版本切换成功');
      getList();
    })
    .catch(() => {});
};

/** 对比版本 */
const handleCompareVersion = (version: PromptVersion) => {
  proxy?.$modal.msgSuccess('版本对比功能开发中...');
};

/** 测试提示词 */
const handleTest = (row: PromptConfigVO) => {
  if (!row.configured) {
    proxy?.$modal.msgWarning('该技能尚未配置提示词，无法测试');
    return;
  }

  testData.value = {
    skillName: row.skillName,
    scenario: '',
    input: '',
    testing: false,
    result: null
  };
  testDialog.visible = true;
};

/** 运行测试 */
const runTest = () => {
  if (!testData.value.scenario) {
    proxy?.$modal.msgWarning('请选择测试场景');
    return;
  }
  if (!testData.value.input) {
    proxy?.$modal.msgWarning('请输入测试数据');
    return;
  }

  testData.value.testing = true;

  // 模拟API调用
  setTimeout(() => {
    testData.value.result = {
      detected: Math.random() > 0.3,
      violationType: '未佩戴安全帽',
      confidence: 0.85 + Math.random() * 0.15,
      description: '检测到作业人员在井下作业时未佩戴安全帽，违反安全作业规定。建议立即停止作业并要求佩戴安全帽。'
    };
    testData.value.testing = false;
    proxy?.$modal.msgSuccess('测试完成');
  }, 2000);
};

/** 导出配置 */
const handleExport = () => {
  const exportData = allPromptList.value.map((item) => ({
    技能名称: item.skillName,
    技能类别: item.category,
    配置状态: item.configured ? '已配置' : '待配置',
    当前版本: item.currentVersion,
    系统提示词: item.systemPrompt,
    用户提示词: item.userPrompt,
    配置说明: item.description || '',
    更新时间: item.updateTime
  }));

  exportToJSON(exportData, `提示词配置_${formatDateTime(new Date(), 'date')}.json`);
  proxy?.$modal.msgSuccess('导出成功');
};

/** 选择条数 */
const handleSelectionChange = (selection: PromptConfigVO[]) => {
  ids.value = selection.map((item) => item.promptId);
  single.value = selection.length != 1;
};

/** 重置表单 */
const reset = () => {
  form.value = { ...initFormData };
  promptFormRef.value?.resetFields();
};

/** 取消 */
const cancel = () => {
  dialog.visible = false;
  reset();
};

/** 关闭对话框 */
const closeDialog = () => {
  dialog.visible = false;
  reset();
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

.skill-option {
  display: flex;
  align-items: center;
}

.prompt-preview {
  color: #606266;
  font-size: 13px;
}

.prompt-card {
  background-color: #f5f7fa;
  margin-bottom: 16px;

  .prompt-content {
    margin: 0;
    padding: 16px;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #303133;
  }
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.test-result-card {
  background-color: #f0f9ff;
}
</style>

