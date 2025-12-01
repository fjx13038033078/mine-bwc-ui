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

    <!-- 统计概览 -->
    <el-row :gutter="15" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="28"><i-ep-cpu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ allSkillList.length }}</div>
              <div class="stat-label">技能总数</div>
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
              <div class="stat-value">{{ configuredCount }}</div>
              <div class="stat-label">已配置提示词</div>
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
              <div class="stat-value">{{ unconfiguredCount }}</div>
              <div class="stat-label">待配置提示词</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon :size="28"><i-ep-monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ enabledCount }}</div>
              <div class="stat-label">已启用技能</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增技能</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport">导出配置</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="skillList">
        <el-table-column label="技能ID" align="center" prop="skillId" width="150" />
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
        <el-table-column label="适用作业" align="center" prop="workTypes" width="140" :show-overflow-tooltip="true">
          <template #default="scope">
            <span>{{ scope.row.workTypes.join('、') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="技能状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ scope.row.status === 'enabled' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提示词配置" align="center" prop="configured" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.configured ? 'success' : 'warning'" size="small">
              {{ scope.row.configured ? '已配置' : '待配置' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />

        <el-table-column label="操作" fixed="right" width="280">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
            <el-button link type="success" icon="Setting" @click="handleConfigPrompt(scope.row)">配置提示词</el-button>
            <el-button link type="warning" icon="Edit" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新增/编辑技能对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="700px" append-to-body @close="closeDialog">
      <el-form ref="skillFormRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="技能名称" prop="skillName">
              <el-input v-model="form.skillName" placeholder="请输入技能名称" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技能类别" prop="category">
              <el-select v-model="form.category" placeholder="请选择技能类别" style="width: 100%">
                <el-option label="安全监控" value="安全监控" />
                <el-option label="专项作业" value="专项作业" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图标" prop="icon">
              <el-select v-model="form.icon" placeholder="请选择图标" style="width: 100%">
                <el-option value="Camera">
                  <el-icon><i-ep-camera /></el-icon>
                  <span style="margin-left: 8px">Camera</span>
                </el-option>
                <el-option value="VideoCameraFilled">
                  <el-icon><i-ep-video-camera-filled /></el-icon>
                  <span style="margin-left: 8px">VideoCamera</span>
                </el-option>
                <el-option value="Warning">
                  <el-icon><i-ep-warning /></el-icon>
                  <span style="margin-left: 8px">Warning</span>
                </el-option>
                <el-option value="Medal">
                  <el-icon><i-ep-medal /></el-icon>
                  <span style="margin-left: 8px">Medal</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图标颜色" prop="color">
              <el-color-picker v-model="form.color" show-alpha />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="适用作业" prop="workTypes">
          <el-select v-model="form.workTypes" multiple placeholder="请选择适用作业类型" style="width: 100%">
            <el-option label="焊割作业" value="焊割作业" />
            <el-option label="吊装作业" value="吊装作业" />
            <el-option label="高处作业" value="高处作业" />
            <el-option label="动火作业" value="动火作业" />
            <el-option label="受限空间" value="受限空间" />
            <el-option label="爆破作业" value="爆破作业" />
            <el-option label="电气作业" value="电气作业" />
          </el-select>
        </el-form-item>
        <el-form-item label="技能描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入技能描述" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="技能状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">保 存</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 配置提示词对话框 -->
    <el-dialog v-model="promptDialog.visible" :title="`【${currentSkillName}】提示词配置`" width="1000px" append-to-body @close="closePromptDialog">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <template #title>
          <div style="display: flex; align-items: center; gap: 8px">
            <el-icon :size="18"><i-ep-info-filled /></el-icon>
            <span style="font-weight: bold">提示词配置说明</span>
          </div>
        </template>
        <p style="margin: 8px 0 0 0; line-height: 1.6">
          <strong>系统提示词</strong>：定义AI的角色、能力和行为准则。<br />
          <strong>用户提示词</strong>：具体的识别任务描述和要求。
        </p>
      </el-alert>

      <el-form ref="promptFormRef" :model="promptForm" :rules="promptRules" label-width="120px">
        <el-form-item label="系统提示词" prop="systemPrompt">
          <el-input
            v-model="promptForm.systemPrompt"
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
            v-model="promptForm.userPrompt"
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
          <el-input v-model="promptForm.description" type="textarea" :rows="3" placeholder="本次配置的说明或变更内容" maxlength="500" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitPrompt">保 存</el-button>
          <el-button type="success" icon="CircleCheck" @click="handleTestPrompt">测试提示词</el-button>
          <el-button @click="closePromptDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 技能详情对话框 -->
    <el-dialog v-model="viewDialog.visible" :title="`${viewData.skillName} - 技能详情`" width="900px" append-to-body>
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
        <el-descriptions-item label="配置状态">
          <el-tag :type="viewData.configured ? 'success' : 'warning'" size="small">
            {{ viewData.configured ? '已配置' : '待配置' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="适用作业" :span="2">
          {{ viewData.workTypes?.join('、') }}
        </el-descriptions-item>
        <el-descriptions-item label="技能描述" :span="2">
          {{ viewData.description }}
        </el-descriptions-item>
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

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" icon="Setting" @click="handleConfigPromptFromView">配置提示词</el-button>
          <el-button type="warning" icon="Edit" @click="handleEditFromView">编辑技能</el-button>
          <el-button @click="viewDialog.visible = false">关 闭</el-button>
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
          <el-input v-model="testData.input" type="textarea" :rows="4" placeholder="输入测试数据，如：视频中作业人员未佩戴安全帽..." />
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
import { formatDateTime, truncateText, exportToJSON } from '@/utils/copper-mine-utils';

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
  systemPrompt: string;
  userPrompt: string;
  configured: boolean;
  createTime: string;
  updateTime: string;
}

interface SkillForm {
  skillId?: string;
  skillName: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  status: 'enabled' | 'disabled';
  workTypes: string[];
}

interface PromptForm {
  skillId: string;
  systemPrompt: string;
  userPrompt: string;
  description?: string;
}

interface SkillQuery {
  pageNum: number;
  pageSize: number;
  skillName?: string;
  category?: string;
  configured?: string;
}

// 静态数据 - 技能列表（包含提示词配置）
const staticSkillData: AISkillVO[] = [
  {
    skillId: 'skill_helmet_detection',
    skillName: '安全帽佩戴识别',
    description: '识别作业人员是否正确佩戴安全帽',
    category: '安全监控',
    icon: 'Camera',
    color: '#F56C6C',
    status: 'enabled',
    workTypes: ['焊割作业', '吊装作业', '高处作业'],
    systemPrompt: '你是一个专业的铜矿安全监控AI助手，专门负责安全帽佩戴识别。你需要严格按照安全规范进行识别，确保作业人员的安全。',
    userPrompt: '请仔细分析视频画面中的作业场景。重点关注作业人员是否正确佩戴安全帽，包括佩戴位置是否正确、是否系好帽带等。如发现未佩戴或佩戴不规范，请详细描述违规情况。',
    configured: true,
    createTime: '2024-01-10 09:00:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    skillId: 'skill_welding_detection',
    skillName: '焊割作业规范识别',
    description: '识别焊割作业中的违规行为，包括气瓶使用、防护装备等',
    category: '专项作业',
    icon: 'VideoCameraFilled',
    color: '#E6A23C',
    status: 'enabled',
    workTypes: ['焊割作业'],
    systemPrompt: '你是焊割作业安全识别专家，熟悉气瓶安全管理规定和焊割作业安全规范。',
    userPrompt: '请分析焊割作业场景，重点检查：1. 乙炔瓶是否直立使用；2. 气瓶是否混放；3. 作业人员防护装备是否齐全；4. 动火作业是否有监护人。',
    configured: true,
    createTime: '2024-01-10 10:00:00',
    updateTime: '2024-01-15 11:00:00'
  },
  {
    skillId: 'skill_lifting_detection',
    skillName: '吊装作业安全识别',
    description: '识别吊装作业中的违规操作和安全隐患',
    category: '专项作业',
    icon: 'Warning',
    color: '#409EFF',
    status: 'enabled',
    workTypes: ['吊装作业'],
    systemPrompt: '你是吊装作业安全监控AI，专门识别吊装作业中的违规行为和安全隐患。',
    userPrompt: '请分析吊装作业场景，检查：1. 吊物下方是否有人；2. 是否设置警戒区域；3. 指挥人员是否到位；4. 吊装设备是否符合安全要求。',
    configured: true,
    createTime: '2024-01-10 11:00:00',
    updateTime: '2024-01-15 12:00:00'
  },
  {
    skillId: 'skill_height_detection',
    skillName: '高处作业安全识别',
    description: '识别高处作业中的安全带使用等违规行为',
    category: '安全监控',
    icon: 'Medal',
    color: '#67C23A',
    status: 'enabled',
    workTypes: ['高处作业'],
    systemPrompt: '',
    userPrompt: '',
    configured: false,
    createTime: '2024-01-10 12:00:00',
    updateTime: '2024-01-10 12:00:00'
  },
  {
    skillId: 'skill_fire_detection',
    skillName: '动火作业违规识别',
    description: '识别动火作业中的违规行为和安全隐患',
    category: '专项作业',
    icon: 'Warning',
    color: '#F56C6C',
    status: 'disabled',
    workTypes: ['动火作业'],
    systemPrompt: '',
    userPrompt: '',
    configured: false,
    createTime: '2024-01-10 13:00:00',
    updateTime: '2024-01-10 13:00:00'
  }
];

const skillList = ref<AISkillVO[]>([]);
const allSkillList = ref<AISkillVO[]>([...staticSkillData]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const currentSkillName = ref('');

const queryFormRef = ref<ElFormInstance>();
const skillFormRef = ref<ElFormInstance>();
const promptFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const promptDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const testDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: SkillForm = {
  skillId: undefined,
  skillName: '',
  description: '',
  category: '安全监控',
  icon: 'Camera',
  color: '#409EFF',
  status: 'enabled',
  workTypes: []
};

const initPromptForm: PromptForm = {
  skillId: '',
  systemPrompt: '',
  userPrompt: '',
  description: ''
};

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    skillName: '',
    category: '',
    configured: ''
  } as SkillQuery,
  form: { ...initFormData },
  promptForm: { ...initPromptForm },
  rules: {
    skillName: [{ required: true, message: '技能名称不能为空', trigger: 'blur' }],
    category: [{ required: true, message: '技能类别不能为空', trigger: 'change' }],
    icon: [{ required: true, message: '请选择图标', trigger: 'change' }],
    color: [{ required: true, message: '请选择颜色', trigger: 'change' }],
    workTypes: [{ required: true, message: '请选择适用作业', trigger: 'change' }],
    description: [{ required: true, message: '技能描述不能为空', trigger: 'blur' }]
  },
  promptRules: {
    systemPrompt: [{ required: true, message: '系统提示词不能为空', trigger: 'blur' }],
    userPrompt: [{ required: true, message: '用户提示词不能为空', trigger: 'blur' }]
  },
  viewData: {} as AISkillVO,
  testData: {
    skillName: '',
    scenario: '',
    input: '',
    testing: false,
    result: null as any
  }
});

const { queryParams, form, promptForm, rules, promptRules, viewData, testData } = toRefs(data);

// 计算统计数据
const configuredCount = computed(() => {
  return allSkillList.value.filter((skill) => skill.configured).length;
});

const unconfiguredCount = computed(() => {
  return allSkillList.value.filter((skill) => !skill.configured).length;
});

const enabledCount = computed(() => {
  return allSkillList.value.filter((skill) => skill.status === 'enabled').length;
});

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
      if (queryParams.value.configured !== '' && queryParams.value.configured !== undefined) {
        const isConfigured = queryParams.value.configured === 'true';
        if (skill.configured !== isConfigured) {
          match = false;
        }
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

/** 查看详情 */
const handleView = (row: AISkillVO) => {
  viewData.value = { ...row };
  viewDialog.visible = true;
};

/** 从详情编辑技能 */
const handleEditFromView = () => {
  viewDialog.visible = false;
  handleUpdate(viewData.value);
};

/** 从详情配置提示词 */
const handleConfigPromptFromView = () => {
  viewDialog.visible = false;
  handleConfigPrompt(viewData.value);
};

/** 新增技能 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增技能';
};

/** 编辑技能 */
const handleUpdate = (row: AISkillVO) => {
  reset();
  dialog.visible = true;
  dialog.title = '编辑技能';
  form.value = {
    skillId: row.skillId,
    skillName: row.skillName,
    description: row.description,
    category: row.category,
    icon: row.icon,
    color: row.color,
    status: row.status,
    workTypes: [...row.workTypes]
  };
};

/** 提交技能表单 */
const submitForm = () => {
  skillFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const currentTime = formatDateTime();

      if (form.value.skillId) {
        // 更新技能
        const index = allSkillList.value.findIndex((item) => item.skillId === form.value.skillId);
        if (index !== -1) {
          allSkillList.value[index].skillName = form.value.skillName;
          allSkillList.value[index].description = form.value.description;
          allSkillList.value[index].category = form.value.category;
          allSkillList.value[index].icon = form.value.icon;
          allSkillList.value[index].color = form.value.color;
          allSkillList.value[index].status = form.value.status;
          allSkillList.value[index].workTypes = form.value.workTypes;
          allSkillList.value[index].updateTime = currentTime;
        }
        proxy?.$modal.msgSuccess('修改成功');
      } else {
        // 新增技能
        const newSkill: AISkillVO = {
          skillId: 'skill_' + Date.now(),
          skillName: form.value.skillName,
          description: form.value.description,
          category: form.value.category,
          icon: form.value.icon,
          color: form.value.color,
          status: form.value.status,
          workTypes: form.value.workTypes,
          systemPrompt: '',
          userPrompt: '',
          configured: false,
          createTime: currentTime,
          updateTime: currentTime
        };
        allSkillList.value.unshift(newSkill);
        proxy?.$modal.msgSuccess('新增成功');
      }
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除技能 */
const handleDelete = (row: AISkillVO) => {
  proxy?.$modal
    .confirm(`是否确认删除技能【${row.skillName}】？删除后相关配置将一并删除。`)
    .then(() => {
      allSkillList.value = allSkillList.value.filter((item) => item.skillId !== row.skillId);
      proxy?.$modal.msgSuccess('删除成功');
      getList();
    })
    .catch(() => {});
};

/** 配置提示词 */
const handleConfigPrompt = (row: AISkillVO) => {
  currentSkillName.value = row.skillName;
  promptForm.value = {
    skillId: row.skillId,
    systemPrompt: row.systemPrompt,
    userPrompt: row.userPrompt,
    description: ''
  };
  promptDialog.visible = true;
};

/** 提交提示词配置 */
const submitPrompt = () => {
  promptFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const currentTime = formatDateTime();
      const index = allSkillList.value.findIndex((item) => item.skillId === promptForm.value.skillId);
      if (index !== -1) {
        allSkillList.value[index].systemPrompt = promptForm.value.systemPrompt;
        allSkillList.value[index].userPrompt = promptForm.value.userPrompt;
        allSkillList.value[index].configured = true;
        allSkillList.value[index].updateTime = currentTime;
      }
      proxy?.$modal.msgSuccess('提示词配置成功');
      promptDialog.visible = false;
      await getList();
    }
  });
};

/** 测试提示词 */
const handleTestPrompt = () => {
  if (!promptForm.value.systemPrompt || !promptForm.value.userPrompt) {
    proxy?.$modal.msgWarning('请先配置系统提示词和用户提示词');
    return;
  }

  testData.value = {
    skillName: currentSkillName.value,
    scenario: '',
    input: '',
    testing: false,
    result: null
  };
  promptDialog.visible = false;
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
  const exportData = allSkillList.value.map((item) => ({
    技能ID: item.skillId,
    技能名称: item.skillName,
    技能类别: item.category,
    适用作业: item.workTypes.join('、'),
    技能状态: item.status === 'enabled' ? '启用' : '停用',
    配置状态: item.configured ? '已配置' : '待配置',
    系统提示词: item.systemPrompt,
    用户提示词: item.userPrompt,
    技能描述: item.description,
    更新时间: item.updateTime
  }));

  exportToJSON(exportData, `技能配置_${formatDateTime(new Date(), 'date')}.json`);
  proxy?.$modal.msgSuccess('导出成功');
};

/** 重置表单 */
const reset = () => {
  form.value = { ...initFormData };
  skillFormRef.value?.resetFields();
};

/** 重置提示词表单 */
const resetPrompt = () => {
  promptForm.value = { ...initPromptForm };
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

/** 关闭提示词对话框 */
const closePromptDialog = () => {
  promptDialog.visible = false;
  resetPrompt();
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

.skill-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .skill-name {
    flex: 1;
    font-weight: 500;
  }
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
