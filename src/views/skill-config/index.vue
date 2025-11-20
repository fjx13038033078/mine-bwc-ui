<template>
  <div class="p-2">
    <transition
      :enter-active-class="proxy?.animate.searchAnimate.enter"
      :leave-active-class="proxy?.animate.searchAnimate.leave"
    >
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="设备ID" prop="deviceId">
              <el-input v-model="queryParams.deviceId" placeholder="请输入设备ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="序列号" prop="serialNumber">
              <el-input v-model="queryParams.serialNumber" placeholder="请输入序列号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="归属部门" prop="department">
              <el-select v-model="queryParams.department" placeholder="请选择归属部门" clearable>
                <el-option label="采矿部" value="采矿部" />
                <el-option label="安全部" value="安全部" />
                <el-option label="技术部" value="技术部" />
                <el-option label="设备部" value="设备部" />
                <el-option label="后勤部" value="后勤部" />
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
            <el-button type="primary" plain icon="Setting" @click="handleBatchConfig">批量配置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Check" @click="handleBatchEnable">批量启用</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleBatchDisable">批量停用</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="deviceList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="设备ID" align="center" prop="deviceId" width="100" />
        <el-table-column label="序列号" align="center" prop="serialNumber" width="150" :show-overflow-tooltip="true" />
        <el-table-column label="型号" align="center" prop="model" width="120" :show-overflow-tooltip="true" />
        <el-table-column label="归属部门" align="center" prop="department" width="120" />
        <el-table-column label="责任人" align="center" prop="principal" width="100" />
        <el-table-column label="已配置技能" align="center" prop="skills" min-width="300">
          <template #default="scope">
            <el-tag
              v-for="skill in scope.row.enabledSkills"
              :key="skill"
              type="success"
              size="small"
              style="margin: 2px"
            >
              {{ getSkillName(skill) }}
            </el-tag>
            <el-tag v-if="scope.row.enabledSkills.length === 0" type="info" size="small">暂未配置</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="配置状态" align="center" prop="configStatus" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enabledSkills.length > 0 ? 'success' : 'info'" size="small">
              {{ scope.row.enabledSkills.length > 0 ? '已配置' : '未配置' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />

        <el-table-column label="操作" fixed="right" width="150" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="配置技能" placement="top">
              <el-button link type="primary" icon="Setting" @click="handleConfig(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <!-- 技能配置对话框 -->
    <el-dialog v-model="configDialog.visible" :title="configDialog.title" width="700px" append-to-body @close="closeConfigDialog">
      <el-form ref="configFormRef" :model="configForm" label-width="100px">
        <el-form-item label="设备信息">
          <div class="device-info">
            <p><strong>设备ID：</strong>{{ configForm.deviceId }}</p>
            <p><strong>序列号：</strong>{{ configForm.serialNumber }}</p>
            <p><strong>型号：</strong>{{ configForm.model }}</p>
          </div>
        </el-form-item>
        <el-divider />
        <el-form-item label="选择技能">
          <el-checkbox-group v-model="configForm.selectedSkills">
            <el-row :gutter="20">
              <el-col
                v-for="skill in availableSkills"
                :key="skill.id"
                :span="12"
                style="margin-bottom: 15px"
              >
                <el-card shadow="hover" class="skill-card">
                  <el-checkbox :value="skill.id" :label="skill.id">
                    <div class="skill-content">
                      <div class="skill-header">
                        <el-icon :size="20" :color="skill.color">
                          <component :is="skill.icon" />
                        </el-icon>
                        <span class="skill-name">{{ skill.name }}</span>
                      </div>
                      <p class="skill-desc">{{ skill.description }}</p>
                      <el-tag :type="skill.tagType" size="small">{{ skill.category }}</el-tag>
                    </div>
                  </el-checkbox>
                </el-card>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
        <el-divider />
        <el-form-item label="配置说明">
          <el-alert
            title="提示"
            type="info"
            :closable="false"
            description="选择的技能将应用于该设备的AI识别功能，设备将根据配置的技能进行实时监控和违规行为识别。"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitConfig">确认配置</el-button>
          <el-button @click="closeConfigDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialog.visible" title="技能配置详情" width="600px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备ID">{{ viewData.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="序列号">{{ viewData.serialNumber }}</el-descriptions-item>
        <el-descriptions-item label="型号">{{ viewData.model }}</el-descriptions-item>
        <el-descriptions-item label="归属部门">{{ viewData.department }}</el-descriptions-item>
        <el-descriptions-item label="责任人">{{ viewData.principal }}</el-descriptions-item>
        <el-descriptions-item label="配置状态">
          <el-tag :type="viewData.enabledSkills?.length > 0 ? 'success' : 'info'" size="small">
            {{ viewData.enabledSkills?.length > 0 ? '已配置' : '未配置' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="已配置技能" :span="2">
          <div v-if="viewData.enabledSkills?.length > 0">
            <el-tag
              v-for="skill in viewData.enabledSkills"
              :key="skill"
              type="success"
              size="small"
              style="margin: 2px"
            >
              {{ getSkillName(skill) }}
            </el-tag>
          </div>
          <el-tag v-else type="info" size="small">暂未配置</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ viewData.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="viewDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量配置对话框 -->
    <el-dialog v-model="batchDialog.visible" title="批量配置技能" width="700px" append-to-body @close="closeBatchDialog">
      <el-alert
        :title="`已选择 ${selectedDevices.length} 个设备`"
        type="warning"
        :closable="false"
        style="margin-bottom: 15px"
      />
      <el-form ref="batchFormRef" :model="batchForm" label-width="100px">
        <el-form-item label="选择技能">
          <el-checkbox-group v-model="batchForm.selectedSkills">
            <el-row :gutter="20">
              <el-col
                v-for="skill in availableSkills"
                :key="skill.id"
                :span="12"
                style="margin-bottom: 15px"
              >
                <el-card shadow="hover" class="skill-card">
                  <el-checkbox :value="skill.id" :label="skill.id">
                    <div class="skill-content">
                      <div class="skill-header">
                        <el-icon :size="20" :color="skill.color">
                          <component :is="skill.icon" />
                        </el-icon>
                        <span class="skill-name">{{ skill.name }}</span>
                      </div>
                      <p class="skill-desc">{{ skill.description }}</p>
                      <el-tag :type="skill.tagType" size="small">{{ skill.category }}</el-tag>
                    </div>
                  </el-checkbox>
                </el-card>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitBatchConfig">确认配置</el-button>
          <el-button @click="closeBatchDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SkillConfig" lang="ts">
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 设备技能配置接口
interface DeviceSkillVO {
  deviceId: string;
  serialNumber: string;
  model: string;
  department: string;
  principal: string;
  enabledSkills: string[];
  updateTime: string;
}

interface SkillConfigForm {
  deviceId: string;
  serialNumber: string;
  model: string;
  selectedSkills: string[];
}

interface BatchConfigForm {
  selectedSkills: string[];
}

interface DeviceQuery {
  pageNum: number;
  pageSize: number;
  deviceId?: string;
  serialNumber?: string;
  department?: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  tagType: string;
}

// 可用技能列表
const availableSkills: Skill[] = [
  {
    id: 'violation_detection',
    name: '违规行为识别',
    description: '检测矿工违规操作、未佩戴安全装备等行为',
    category: '安全监控',
    icon: 'WarningFilled',
    color: '#F56C6C',
    tagType: 'danger'
  },
  {
    id: 'welding_standard',
    name: '焊割作业规范识别',
    description: '监控焊割作业是否符合安全规范要求',
    category: '作业规范',
    icon: 'SetUp',
    color: '#E6A23C',
    tagType: 'warning'
  },
  {
    id: 'lifting_standard',
    name: '吊装作业规范识别',
    description: '识别吊装作业的规范性和安全性',
    category: '作业规范',
    icon: 'Upload',
    color: '#409EFF',
    tagType: 'primary'
  },
  {
    id: 'safety_equipment',
    name: '安全装备佩戴检测',
    description: '检测安全帽、防护服等装备佩戴情况',
    category: '安全监控',
    icon: 'Avatar',
    color: '#67C23A',
    tagType: 'success'
  },
  {
    id: 'fire_detection',
    name: '火灾隐患识别',
    description: '识别火源、烟雾等火灾隐患',
    category: '安全监控',
    icon: 'Smoking',
    color: '#F56C6C',
    tagType: 'danger'
  },
  {
    id: 'personnel_tracking',
    name: '人员行为追踪',
    description: '跟踪记录人员活动轨迹和行为模式',
    category: '监控管理',
    icon: 'Location',
    color: '#909399',
    tagType: 'info'
  },
  {
    id: 'area_intrusion',
    name: '危险区域入侵检测',
    description: '检测人员进入危险禁区的行为',
    category: '安全监控',
    icon: 'Place',
    color: '#F56C6C',
    tagType: 'danger'
  },
  {
    id: 'equipment_operation',
    name: '设备操作规范识别',
    description: '监控设备操作是否符合规范流程',
    category: '作业规范',
    icon: 'Tools',
    color: '#409EFF',
    tagType: 'primary'
  }
];

// 静态数据 - 模拟设备数据
const staticDeviceData: DeviceSkillVO[] = [
  {
    deviceId: 'DEV001',
    serialNumber: 'SN2023001',
    model: 'AI-CAM-V1',
    department: '采矿部',
    principal: '张三',
    enabledSkills: ['violation_detection', 'safety_equipment', 'area_intrusion'],
    updateTime: '2024-01-15 10:30:00'
  },
  {
    deviceId: 'DEV002',
    serialNumber: 'SN2023002',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '李四',
    enabledSkills: ['welding_standard', 'fire_detection'],
    updateTime: '2024-01-16 11:20:00'
  },
  {
    deviceId: 'DEV003',
    serialNumber: 'SN2023003',
    model: 'AI-CAM-V1',
    department: '安全部',
    principal: '王五',
    enabledSkills: ['violation_detection', 'personnel_tracking', 'area_intrusion'],
    updateTime: '2024-01-17 09:15:00'
  },
  {
    deviceId: 'DEV004',
    serialNumber: 'SN2023004',
    model: 'AI-CAM-V3',
    department: '技术部',
    principal: '赵六',
    enabledSkills: ['lifting_standard', 'equipment_operation'],
    updateTime: '2024-01-18 14:45:00'
  },
  {
    deviceId: 'DEV005',
    serialNumber: 'SN2023005',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '孙七',
    enabledSkills: [],
    updateTime: '2024-01-19 08:00:00'
  },
  {
    deviceId: 'DEV006',
    serialNumber: 'SN2023006',
    model: 'AI-CAM-V1',
    department: '设备部',
    principal: '周八',
    enabledSkills: ['equipment_operation', 'safety_equipment'],
    updateTime: '2024-01-20 16:30:00'
  },
  {
    deviceId: 'DEV007',
    serialNumber: 'SN2023007',
    model: 'AI-CAM-V3',
    department: '安全部',
    principal: '吴九',
    enabledSkills: ['violation_detection', 'fire_detection', 'area_intrusion'],
    updateTime: '2024-01-21 10:00:00'
  },
  {
    deviceId: 'DEV008',
    serialNumber: 'SN2023008',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '郑十',
    enabledSkills: ['welding_standard', 'lifting_standard'],
    updateTime: '2024-01-22 13:20:00'
  },
  {
    deviceId: 'DEV009',
    serialNumber: 'SN2023009',
    model: 'AI-CAM-V1',
    department: '后勤部',
    principal: '冯十一',
    enabledSkills: ['personnel_tracking'],
    updateTime: '2024-01-23 09:45:00'
  },
  {
    deviceId: 'DEV010',
    serialNumber: 'SN2023010',
    model: 'AI-CAM-V3',
    department: '技术部',
    principal: '陈十二',
    enabledSkills: ['violation_detection', 'safety_equipment', 'equipment_operation'],
    updateTime: '2024-01-24 15:10:00'
  },
  {
    deviceId: 'DEV011',
    serialNumber: 'SN2023011',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '张三',
    enabledSkills: [],
    updateTime: '2024-01-25 08:30:00'
  },
  {
    deviceId: 'DEV012',
    serialNumber: 'SN2023012',
    model: 'AI-CAM-V1',
    department: '安全部',
    principal: '李四',
    enabledSkills: ['fire_detection', 'area_intrusion'],
    updateTime: '2024-01-26 11:50:00'
  }
];

const deviceList = ref<DeviceSkillVO[]>([]);
const allDeviceList = ref<DeviceSkillVO[]>([...staticDeviceData]);
const loading = ref(false);
const showSearch = ref(true);
const selectedDevices = ref<DeviceSkillVO[]>([]);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const configFormRef = ref<ElFormInstance>();
const batchFormRef = ref<ElFormInstance>();

const configDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const batchDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceId: '',
    serialNumber: '',
    department: ''
  } as DeviceQuery,
  configForm: {
    deviceId: '',
    serialNumber: '',
    model: '',
    selectedSkills: []
  } as SkillConfigForm,
  batchForm: {
    selectedSkills: []
  } as BatchConfigForm,
  viewData: {} as DeviceSkillVO
});

const { queryParams, configForm, batchForm, viewData } = toRefs(data);

/** 获取技能名称 */
const getSkillName = (skillId: string): string => {
  const skill = availableSkills.find((s) => s.id === skillId);
  return skill ? skill.name : skillId;
};

/** 查询设备列表 */
const getList = () => {
  loading.value = true;

  setTimeout(() => {
    const filteredData = allDeviceList.value.filter((device) => {
      let match = true;
      if (queryParams.value.deviceId && !device.deviceId.includes(queryParams.value.deviceId)) {
        match = false;
      }
      if (queryParams.value.serialNumber && !device.serialNumber.includes(queryParams.value.serialNumber)) {
        match = false;
      }
      if (queryParams.value.department && device.department !== queryParams.value.department) {
        match = false;
      }
      return match;
    });

    total.value = filteredData.length;

    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
    const end = start + queryParams.value.pageSize;
    deviceList.value = filteredData.slice(start, end);

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

/** 选择条数 */
const handleSelectionChange = (selection: DeviceSkillVO[]) => {
  selectedDevices.value = selection;
};

/** 配置技能 */
const handleConfig = (row: DeviceSkillVO) => {
  configDialog.visible = true;
  configDialog.title = '配置设备技能';
  configForm.value = {
    deviceId: row.deviceId,
    serialNumber: row.serialNumber,
    model: row.model,
    selectedSkills: [...row.enabledSkills]
  };
};

/** 查看详情 */
const handleView = (row: DeviceSkillVO) => {
  viewDialog.visible = true;
  viewData.value = { ...row };
};

/** 批量配置 */
const handleBatchConfig = () => {
  if (selectedDevices.value.length === 0) {
    proxy?.$modal.msgWarning('请至少选择一个设备');
    return;
  }
  batchDialog.visible = true;
  batchForm.value.selectedSkills = [];
};

/** 批量启用 */
const handleBatchEnable = () => {
  if (selectedDevices.value.length === 0) {
    proxy?.$modal.msgWarning('请至少选择一个设备');
    return;
  }
  proxy?.$modal
    .confirm(`确认要启用所选 ${selectedDevices.value.length} 个设备的技能配置吗？`)
    .then(() => {
      proxy?.$modal.msgSuccess('批量启用成功');
      getList();
    })
    .catch(() => {});
};

/** 批量停用 */
const handleBatchDisable = () => {
  if (selectedDevices.value.length === 0) {
    proxy?.$modal.msgWarning('请至少选择一个设备');
    return;
  }
  proxy?.$modal
    .confirm(`确认要停用所选 ${selectedDevices.value.length} 个设备的所有技能配置吗？`)
    .then(() => {
      selectedDevices.value.forEach((device) => {
        const index = allDeviceList.value.findIndex((d) => d.deviceId === device.deviceId);
        if (index !== -1) {
          allDeviceList.value[index].enabledSkills = [];
          allDeviceList.value[index].updateTime = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
        }
      });
      proxy?.$modal.msgSuccess('批量停用成功');
      getList();
    })
    .catch(() => {});
};

/** 提交配置 */
const submitConfig = () => {
  const index = allDeviceList.value.findIndex((d) => d.deviceId === configForm.value.deviceId);
  if (index !== -1) {
    allDeviceList.value[index].enabledSkills = [...configForm.value.selectedSkills];
    allDeviceList.value[index].updateTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  proxy?.$modal.msgSuccess('配置成功');
  configDialog.visible = false;
  getList();
};

/** 提交批量配置 */
const submitBatchConfig = () => {
  if (batchForm.value.selectedSkills.length === 0) {
    proxy?.$modal.msgWarning('请至少选择一个技能');
    return;
  }

  selectedDevices.value.forEach((device) => {
    const index = allDeviceList.value.findIndex((d) => d.deviceId === device.deviceId);
    if (index !== -1) {
      allDeviceList.value[index].enabledSkills = [...batchForm.value.selectedSkills];
      allDeviceList.value[index].updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  });

  proxy?.$modal.msgSuccess(`已为 ${selectedDevices.value.length} 个设备配置技能`);
  batchDialog.visible = false;
  getList();
};

/** 关闭配置对话框 */
const closeConfigDialog = () => {
  configDialog.visible = false;
  configForm.value.selectedSkills = [];
};

/** 关闭批量配置对话框 */
const closeBatchDialog = () => {
  batchDialog.visible = false;
  batchForm.value.selectedSkills = [];
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.device-info {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;

  p {
    margin: 5px 0;
    color: #606266;
  }
}

.skill-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :deep(.el-card__body) {
    padding: 12px;
  }
}

.skill-content {
  margin-left: 5px;

  .skill-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .skill-name {
      margin-left: 8px;
      font-weight: 600;
      font-size: 14px;
      color: #303133;
    }
  }

  .skill-desc {
    margin: 8px 0;
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
  }
}

:deep(.el-checkbox) {
  width: 100%;
  height: auto;
  display: block;

  .el-checkbox__label {
    width: 100%;
    white-space: normal;
    padding-left: 8px;
  }
}

:deep(.el-checkbox-group) {
  width: 100%;
}
</style>

