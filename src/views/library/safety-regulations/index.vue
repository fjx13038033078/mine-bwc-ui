<template>
  <div class="p-2">
    <transition
      :enter-active-class="proxy?.animate.searchAnimate.enter"
      :leave-active-class="proxy?.animate.searchAnimate.leave"
    >
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="规范ID" prop="regulationId">
              <el-input v-model="queryParams.regulationId" placeholder="请输入规范ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="作业类型" prop="workType">
              <el-select v-model="queryParams.workType" placeholder="请选择作业类型" clearable>
                <el-option label="焊割作业" value="焊割作业" />
                <el-option label="吊装作业" value="吊装作业" />
                <el-option label="高处作业" value="高处作业" />
                <el-option label="动火作业" value="动火作业" />
                <el-option label="受限空间作业" value="受限空间作业" />
                <el-option label="爆破作业" value="爆破作业" />
                <el-option label="盲板抽堵作业" value="盲板抽堵作业" />
                <el-option label="设备检修作业" value="设备检修作业" />
              </el-select>
            </el-form-item>
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryParams.keyword" placeholder="请输入关键词搜索" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增规范</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="regulationList">
        <el-table-column label="规范ID" align="center" prop="regulationId" width="120" />
        <el-table-column label="作业类型" align="center" prop="workType" width="140">
          <template #default="scope">
            <el-tag :type="getWorkTypeColor(scope.row.workType)" size="small">{{ scope.row.workType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="规范要求" align="left" prop="standards" min-width="300" show-overflow-tooltip>
          <template #default="scope">
            <div class="standards-content">
              <el-icon color="#67C23A" style="margin-right: 5px"><i-ep-check /></el-icon>
              <span>{{ scope.row.standards }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="违规行为" align="left" prop="violations" min-width="300" show-overflow-tooltip>
          <template #default="scope">
            <div class="violations-content">
              <el-icon color="#F56C6C" style="margin-right: 5px"><i-ep-close /></el-icon>
              <span>{{ scope.row.violations }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />

        <el-table-column label="操作" fixed="right" width="180" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
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

    <!-- 新增/编辑规范对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="700px" append-to-body @close="closeDialog">
      <el-form ref="regulationFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="作业类型" prop="workType">
          <el-select v-model="form.workType" placeholder="请选择作业类型" style="width: 100%">
            <el-option label="焊割作业" value="焊割作业" />
            <el-option label="吊装作业" value="吊装作业" />
            <el-option label="高处作业" value="高处作业" />
            <el-option label="动火作业" value="动火作业" />
            <el-option label="受限空间作业" value="受限空间作业" />
            <el-option label="爆破作业" value="爆破作业" />
            <el-option label="盲板抽堵作业" value="盲板抽堵作业" />
            <el-option label="设备检修作业" value="设备检修作业" />
          </el-select>
        </el-form-item>
        <el-form-item label="规范要求" prop="standards">
          <el-input
            v-model="form.standards"
            type="textarea"
            :rows="4"
            placeholder="请输入作业规范要求，多条规范请用分号（；）分隔"
            maxlength="500"
            show-word-limit
          />
          <div class="form-tip">
            <el-icon color="#E6A23C"><i-ep-warning-filled /></el-icon>
            <span>示例：乙炔瓶不得平置；禁止氧气瓶与乙炔瓶混放运输</span>
          </div>
        </el-form-item>
        <el-form-item label="违规行为" prop="violations">
          <el-input
            v-model="form.violations"
            type="textarea"
            :rows="4"
            placeholder="请输入对应的违规行为，多条违规行为请用分号（；）分隔"
            maxlength="500"
            show-word-limit
          />
          <div class="form-tip">
            <el-icon color="#E6A23C"><i-ep-warning-filled /></el-icon>
            <span>示例：乙炔瓶平放；气瓶混放</span>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialog.visible" title="安全作业规范详情" width="700px" append-to-body>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="规范ID">{{ viewData.regulationId }}</el-descriptions-item>
        <el-descriptions-item label="作业类型">
          <el-tag :type="getWorkTypeColor(viewData.workType)" size="small">{{ viewData.workType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="规范要求">
          <div class="detail-content">
            <div v-for="(standard, index) in splitText(viewData.standards)" :key="index" class="detail-item">
              <el-icon color="#67C23A"><i-ep-check /></el-icon>
              <span>{{ standard }}</span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="违规行为">
          <div class="detail-content">
            <div v-for="(violation, index) in splitText(viewData.violations)" :key="index" class="detail-item">
              <el-icon color="#F56C6C"><i-ep-close /></el-icon>
              <span>{{ violation }}</span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ viewData.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" v-if="viewData.remark">{{ viewData.remark }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="viewDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SafetyRegulations" lang="ts">
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 规范数据接口
interface RegulationVO {
  regulationId: string;
  workType: string;
  standards: string;
  violations: string;
  remark?: string;
  createTime: string;
  updateTime: string;
}

interface RegulationForm {
  regulationId?: string;
  workType: string;
  standards: string;
  violations: string;
  remark?: string;
}

interface RegulationQuery {
  pageNum: number;
  pageSize: number;
  regulationId?: string;
  workType?: string;
  keyword?: string;
}

// 静态数据 - 模拟规范数据
const staticRegulationData: RegulationVO[] = [
  {
    regulationId: 'REG001',
    workType: '焊割作业',
    standards: '乙炔瓶不得平置；禁止氧气瓶与乙炔瓶混放运输；作业现场必须配备灭火器',
    violations: '乙炔瓶平放；气瓶混放；未配备灭火器',
    remark: '焊割作业基本安全规范',
    createTime: '2024-01-10 09:00:00',
    updateTime: '2024-01-10 09:00:00'
  },
  {
    regulationId: 'REG002',
    workType: '吊装作业',
    standards: '吊物高度超过腰部时不得手扶；吊物下方严禁站人；必须使用合格的吊具和索具',
    violations: '吊装过程中手扶吊物；吊物下方有人；使用不合格吊具',
    remark: '吊装作业安全要求',
    createTime: '2024-01-10 10:30:00',
    updateTime: '2024-01-10 10:30:00'
  },
  {
    regulationId: 'REG003',
    workType: '高处作业',
    standards: '必须系好安全带；高处作业必须戴安全帽；严禁往下抛掷物品',
    violations: '未系安全带；未戴安全帽；向下抛掷工具',
    remark: '高处作业基础规范',
    createTime: '2024-01-11 08:45:00',
    updateTime: '2024-01-11 08:45:00'
  },
  {
    regulationId: 'REG004',
    workType: '动火作业',
    standards: '动火前必须办理动火证；动火现场10米内不得存放易燃易爆物品；必须配备监护人员',
    violations: '未办理动火证；动火现场有易燃物；无监护人员',
    remark: '动火作业管理规定',
    createTime: '2024-01-11 14:20:00',
    updateTime: '2024-01-11 14:20:00'
  },
  {
    regulationId: 'REG005',
    workType: '受限空间作业',
    standards: '进入前必须进行气体检测；必须配备通风设备；至少两人作业，一人监护',
    violations: '未进行气体检测；无通风设备；单人作业',
    remark: '受限空间作业安全规程',
    createTime: '2024-01-12 09:15:00',
    updateTime: '2024-01-12 09:15:00'
  },
  {
    regulationId: 'REG006',
    workType: '爆破作业',
    standards: '必须持证上岗；爆破前必须设置警戒线；爆破后必须检查哑炮',
    violations: '无证作业；未设置警戒线；未检查哑炮',
    remark: '爆破作业专项规范',
    createTime: '2024-01-12 15:30:00',
    updateTime: '2024-01-12 15:30:00'
  },
  {
    regulationId: 'REG007',
    workType: '焊割作业',
    standards: '焊割前必须检查设备；作业中必须穿戴防护用品；作业后必须清理现场',
    violations: '未检查设备；未穿戴防护用品；未清理现场',
    remark: '焊割作业补充要求',
    createTime: '2024-01-13 10:00:00',
    updateTime: '2024-01-13 10:00:00'
  },
  {
    regulationId: 'REG008',
    workType: '设备检修作业',
    standards: '检修前必须断电挂牌；必须释放系统压力；必须使用专用工具',
    violations: '未断电挂牌；未释放压力；使用非专用工具',
    remark: '设备检修安全规范',
    createTime: '2024-01-13 16:45:00',
    updateTime: '2024-01-13 16:45:00'
  },
  {
    regulationId: 'REG009',
    workType: '盲板抽堵作业',
    standards: '作业前必须确认介质性质；必须泄压置换；必须佩戴防护面罩',
    violations: '未确认介质；未泄压置换；未佩戴防护面罩',
    remark: '盲板抽堵作业要求',
    createTime: '2024-01-14 11:20:00',
    updateTime: '2024-01-14 11:20:00'
  },
  {
    regulationId: 'REG010',
    workType: '吊装作业',
    standards: '吊装指挥必须持证；起吊前必须试吊；吊装路径必须清理障碍物',
    violations: '指挥无证；未试吊；路径有障碍物',
    remark: '吊装作业细则',
    createTime: '2024-01-14 14:50:00',
    updateTime: '2024-01-14 14:50:00'
  }
];

const regulationList = ref<RegulationVO[]>([]);
const allRegulationList = ref<RegulationVO[]>([...staticRegulationData]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const regulationFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: RegulationForm = {
  regulationId: undefined,
  workType: '',
  standards: '',
  violations: '',
  remark: ''
};

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    regulationId: '',
    workType: '',
    keyword: ''
  } as RegulationQuery,
  form: { ...initFormData },
  rules: {
    workType: [{ required: true, message: '作业类型不能为空', trigger: 'change' }],
    standards: [{ required: true, message: '规范要求不能为空', trigger: 'blur' }],
    violations: [{ required: true, message: '违规行为不能为空', trigger: 'blur' }]
  },
  viewData: {} as RegulationVO
});

const { queryParams, form, rules, viewData } = toRefs(data);

/** 获取作业类型颜色 */
const getWorkTypeColor = (workType: string) => {
  const colorMap: Record<string, string> = {
    焊割作业: 'danger',
    吊装作业: 'warning',
    高处作业: 'primary',
    动火作业: 'danger',
    受限空间作业: 'info',
    爆破作业: 'danger',
    盲板抽堵作业: 'warning',
    设备检修作业: 'success'
  };
  return colorMap[workType] || 'info';
};

/** 分割文本为数组 */
const splitText = (text: string): string[] => {
  if (!text) return [];
  return text.split(/[；;]/).filter((item) => item.trim());
};

/** 查询规范列表 */
const getList = () => {
  loading.value = true;

  setTimeout(() => {
    const filteredData = allRegulationList.value.filter((regulation) => {
      let match = true;
      if (queryParams.value.regulationId && !regulation.regulationId.includes(queryParams.value.regulationId)) {
        match = false;
      }
      if (queryParams.value.workType && regulation.workType !== queryParams.value.workType) {
        match = false;
      }
      if (queryParams.value.keyword) {
        const keyword = queryParams.value.keyword.toLowerCase();
        const searchText =
          `${regulation.regulationId}${regulation.workType}${regulation.standards}${regulation.violations}`.toLowerCase();
        if (!searchText.includes(keyword)) {
          match = false;
        }
      }
      return match;
    });

    total.value = filteredData.length;

    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
    const end = start + queryParams.value.pageSize;
    regulationList.value = filteredData.slice(start, end);

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

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增安全作业规范';
};

/** 查看详情 */
const handleView = (row: RegulationVO) => {
  viewDialog.visible = true;
  viewData.value = { ...row };
};

/** 修改按钮操作 */
const handleUpdate = (row: RegulationVO) => {
  reset();
  dialog.visible = true;
  dialog.title = '修改安全作业规范';
  form.value = {
    regulationId: row.regulationId,
    workType: row.workType,
    standards: row.standards,
    violations: row.violations,
    remark: row.remark || ''
  };
};

/** 删除按钮操作 */
const handleDelete = (row: RegulationVO) => {
  proxy?.$modal
    .confirm(`是否确认删除规范编号为 ${row.regulationId} 的数据项？`)
    .then(() => {
      allRegulationList.value = allRegulationList.value.filter((item) => item.regulationId !== row.regulationId);
      proxy?.$modal.msgSuccess('删除成功');
      getList();
    })
    .catch(() => {});
};

/** 提交按钮 */
const submitForm = () => {
  regulationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const currentTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      if (form.value.regulationId) {
        // 更新规范
        const index = allRegulationList.value.findIndex((item) => item.regulationId === form.value.regulationId);
        if (index !== -1) {
          allRegulationList.value[index] = {
            ...allRegulationList.value[index],
            workType: form.value.workType,
            standards: form.value.standards,
            violations: form.value.violations,
            remark: form.value.remark,
            updateTime: currentTime
          };
        }
        proxy?.$modal.msgSuccess('修改成功');
      } else {
        // 新增规范
        const newRegulation: RegulationVO = {
          regulationId: 'REG' + String(allRegulationList.value.length + 1).padStart(3, '0'),
          workType: form.value.workType,
          standards: form.value.standards,
          violations: form.value.violations,
          remark: form.value.remark,
          createTime: currentTime,
          updateTime: currentTime
        };
        allRegulationList.value.unshift(newRegulation);
        proxy?.$modal.msgSuccess('新增成功');
      }
      dialog.visible = false;
      await getList();
    }
  });
};

/** 重置操作表单 */
const reset = () => {
  form.value = { ...initFormData };
  regulationFormRef.value?.resetFields();
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
.standards-content,
.violations-content {
  display: flex;
  align-items: center;
}

.form-tip {
  display: flex;
  align-items: center;
  margin-top: 5px;
  color: #e6a23c;
  font-size: 12px;

  .el-icon {
    margin-right: 5px;
  }
}

.detail-content {
  .detail-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }

    .el-icon {
      margin-top: 3px;
      margin-right: 8px;
      flex-shrink: 0;
    }

    span {
      flex: 1;
    }
  }
}
</style>

