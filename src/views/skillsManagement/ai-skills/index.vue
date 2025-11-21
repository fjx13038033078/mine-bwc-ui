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

    <!-- 关联知识库对话框 -->
    <el-dialog v-model="knowledgeDialog.visible" title="关联知识库" width="900px" append-to-body>
      <el-alert title="知识库关联说明" type="info" :closable="false" style="margin-bottom: 16px">
        <p>该技能关联了以下安全规范和处理知识，AI识别时将参考这些知识进行判定和处理建议。</p>
      </el-alert>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="安全作业规范" name="regulations">
          <el-table :data="relatedRegulations" border style="margin-top: 16px">
            <el-table-column label="规范ID" prop="regulationId" width="120" />
            <el-table-column label="作业类型" prop="workType" width="120">
              <template #default="scope">
                <el-tag size="small">{{ scope.row.workType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="规范要求" prop="standards" show-overflow-tooltip />
            <el-table-column label="常见违规" prop="violations" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="违规处理知识" name="handling">
          <el-table :data="relatedHandling" border style="margin-top: 16px">
            <el-table-column label="知识ID" prop="knowledgeId" width="120" />
            <el-table-column label="违规行为" prop="violationName" width="150" />
            <el-table-column label="严重等级" prop="severity" width="100">
              <template #default="scope">
                <el-tag :type="getSeverityType(scope.row.severity)" size="small">
                  {{ scope.row.severity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="立即处理措施" prop="immediateAction" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-footer">
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
  relatedDevices: [] as any[]
});

const { queryParams, viewData, currentSkillName, activeTab, relatedRegulations, relatedHandling, relatedDevices } = toRefs(data);

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
</style>

