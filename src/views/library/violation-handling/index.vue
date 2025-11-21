<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="知识ID" prop="knowledgeId">
              <el-input v-model="queryParams.knowledgeId" placeholder="请输入知识ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="违规类型" prop="violationType">
              <el-select v-model="queryParams.violationType" placeholder="请选择违规类型" clearable>
                <el-option label="未佩戴安全装备" value="未佩戴安全装备" />
                <el-option label="违规操作设备" value="违规操作设备" />
                <el-option label="危险区域入侵" value="危险区域入侵" />
                <el-option label="违规吸烟/动火" value="违规吸烟/动火" />
                <el-option label="违规存放物品" value="违规存放物品" />
                <el-option label="高处作业违规" value="高处作业违规" />
                <el-option label="其他违规行为" value="其他违规行为" />
              </el-select>
            </el-form-item>
            <el-form-item label="严重程度" prop="severity">
              <el-select v-model="queryParams.severity" placeholder="请选择严重程度" clearable>
                <el-option label="严重" value="严重" />
                <el-option label="较重" value="较重" />
                <el-option label="一般" value="一般" />
                <el-option label="轻微" value="轻微" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增知识</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="knowledgeList">
        <el-table-column label="知识ID" align="center" prop="knowledgeId" width="120" />
        <el-table-column label="违规行为" align="center" prop="violationName" min-width="200" show-overflow-tooltip />
        <el-table-column label="违规类型" align="center" prop="violationType" width="140">
          <template #default="scope">
            <el-tag :type="getViolationTypeColor(scope.row.violationType)" size="small">
              {{ scope.row.violationType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="严重程度" align="center" prop="severity" width="100">
          <template #default="scope">
            <el-tag :type="getSeverityColor(scope.row.severity)" size="small">{{ scope.row.severity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="处理措施" align="left" prop="handlingMeasures" min-width="300" show-overflow-tooltip />
        <el-table-column label="创建时间" align="center" prop="createTime" width="160" />

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

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新增/编辑知识对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="800px" append-to-body @close="closeDialog">
      <el-form ref="knowledgeFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="违规行为" prop="violationName">
              <el-input v-model="form.violationName" placeholder="请输入违规行为名称" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="违规类型" prop="violationType">
              <el-select v-model="form.violationType" placeholder="请选择违规类型" style="width: 100%">
                <el-option label="未佩戴安全装备" value="未佩戴安全装备" />
                <el-option label="违规操作设备" value="违规操作设备" />
                <el-option label="危险区域入侵" value="危险区域入侵" />
                <el-option label="违规吸烟/动火" value="违规吸烟/动火" />
                <el-option label="违规存放物品" value="违规存放物品" />
                <el-option label="高处作业违规" value="高处作业违规" />
                <el-option label="其他违规行为" value="其他违规行为" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="严重程度" prop="severity">
              <el-select v-model="form.severity" placeholder="请选择严重程度" style="width: 100%">
                <el-option label="严重" value="严重" />
                <el-option label="较重" value="较重" />
                <el-option label="一般" value="一般" />
                <el-option label="轻微" value="轻微" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="处罚等级" prop="penaltyLevel">
              <el-select v-model="form.penaltyLevel" placeholder="请选择处罚等级" style="width: 100%">
                <el-option label="一级处罚" value="一级处罚" />
                <el-option label="二级处罚" value="二级处罚" />
                <el-option label="三级处罚" value="三级处罚" />
                <el-option label="警告教育" value="警告教育" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="处理措施" prop="handlingMeasures">
          <el-input
            v-model="form.handlingMeasures"
            type="textarea"
            :rows="4"
            placeholder="请输入具体的处理措施和建议"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="法律依据" prop="legalBasis">
          <el-input v-model="form.legalBasis" type="textarea" :rows="3" placeholder="请输入相关法律法规依据" maxlength="300" show-word-limit />
        </el-form-item>
        <el-form-item label="预防措施" prop="preventiveMeasures">
          <el-input
            v-model="form.preventiveMeasures"
            type="textarea"
            :rows="3"
            placeholder="请输入预防该违规行为的措施建议"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="典型案例" prop="typicalCase">
          <el-input v-model="form.typicalCase" type="textarea" :rows="3" placeholder="请输入典型案例描述（可选）" maxlength="300" />
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
    <el-dialog v-model="viewDialog.visible" title="违规行为处理知识详情" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="知识ID">{{ viewData.knowledgeId }}</el-descriptions-item>
        <el-descriptions-item label="违规行为">{{ viewData.violationName }}</el-descriptions-item>
        <el-descriptions-item label="违规类型">
          <el-tag :type="getViolationTypeColor(viewData.violationType)" size="small">
            {{ viewData.violationType }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="严重程度">
          <el-tag :type="getSeverityColor(viewData.severity)" size="small">{{ viewData.severity }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处罚等级">
          <el-tag size="small">{{ viewData.penaltyLevel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="处理措施" :span="2">
          <div class="detail-text">{{ viewData.handlingMeasures }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="法律依据" :span="2">
          <div class="detail-text">{{ viewData.legalBasis }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="预防措施" :span="2">
          <div class="detail-text">{{ viewData.preventiveMeasures }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="典型案例" :span="2" v-if="viewData.typicalCase">
          <div class="detail-text">{{ viewData.typicalCase }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2" v-if="viewData.remark">
          <div class="detail-text">{{ viewData.remark }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ viewData.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="viewDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ViolationHandling" lang="ts">
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 知识数据接口
interface KnowledgeVO {
  knowledgeId: string;
  violationName: string;
  violationType: string;
  severity: string;
  penaltyLevel: string;
  handlingMeasures: string;
  legalBasis: string;
  preventiveMeasures: string;
  typicalCase?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
}

interface KnowledgeForm {
  knowledgeId?: string;
  violationName: string;
  violationType: string;
  severity: string;
  penaltyLevel: string;
  handlingMeasures: string;
  legalBasis: string;
  preventiveMeasures: string;
  typicalCase?: string;
  remark?: string;
}

interface KnowledgeQuery {
  pageNum: number;
  pageSize: number;
  knowledgeId?: string;
  violationType?: string;
  severity?: string;
  keyword?: string;
}

// 静态数据 - 模拟知识库数据
const staticKnowledgeData: KnowledgeVO[] = [
  {
    knowledgeId: 'KN001',
    violationName: '未佩戴安全帽进入作业区',
    violationType: '未佩戴安全装备',
    severity: '严重',
    penaltyLevel: '一级处罚',
    handlingMeasures: '1. 立即责令停止作业；2. 对责任人处以200-500元罚款；3. 要求接受安全教育培训；4. 情节严重者调离岗位',
    legalBasis:
      '《安全生产法》第五十四条：从业人员在作业过程中，应当严格遵守本单位的安全生产规章制度和操作规程，服从管理，正确佩戴和使用劳动防护用品',
    preventiveMeasures: '1. 加强入口检查，设置安全帽佩戴检查点；2. 定期开展安全教育培训；3. 在显著位置设置安全警示标识；4. 建立安全员巡查制度',
    typicalCase: '2023年某铜矿发生一起高空坠物事故，作业人员因未佩戴安全帽造成头部重伤',
    createTime: '2024-01-10 09:00:00',
    updateTime: '2024-01-10 09:00:00'
  },
  {
    knowledgeId: 'KN002',
    violationName: '井下违规吸烟',
    violationType: '违规吸烟/动火',
    severity: '严重',
    penaltyLevel: '一级处罚',
    handlingMeasures: '1. 立即制止并没收烟具；2. 对责任人处以500-1000元罚款；3. 通报批评并记入个人安全档案；4. 停工接受不少于3天的安全教育',
    legalBasis: '《煤矿安全规程》明确规定：严禁在井下吸烟、使用明火。违者按重大违章处理',
    preventiveMeasures: '1. 井口设置烟火检查站；2. 加强日常巡查；3. 利用AI视频监控识别吸烟行为；4. 建立举报奖励机制',
    typicalCase: '某矿井因作业人员违规吸烟引发瓦斯爆炸，造成重大人员伤亡和财产损失',
    createTime: '2024-01-10 10:30:00',
    updateTime: '2024-01-10 10:30:00'
  },
  {
    knowledgeId: 'KN003',
    violationName: '乙炔瓶平放使用',
    violationType: '违规操作设备',
    severity: '较重',
    penaltyLevel: '二级处罚',
    handlingMeasures: '1. 立即纠正违规操作；2. 对责任人处以100-300元罚款；3. 要求重新学习焊割作业安全规程；4. 暂停焊割作业资格7天',
    legalBasis: '《气瓶安全监察规程》规定：乙炔气瓶必须直立使用，严禁卧放',
    preventiveMeasures: '1. 在气瓶存放区设置明显标识；2. 定期检查气瓶使用情况；3. 加强焊工安全培训；4. 使用专用气瓶固定架',
    typicalCase: '某工地因乙炔瓶卧放使用导致丙酮外溢，引发安全事故',
    createTime: '2024-01-11 08:45:00',
    updateTime: '2024-01-11 08:45:00'
  },
  {
    knowledgeId: 'KN004',
    violationName: '未经授权进入危险作业区',
    violationType: '危险区域入侵',
    severity: '严重',
    penaltyLevel: '一级处罚',
    handlingMeasures: '1. 立即清退违规人员；2. 处以300-800元罚款；3. 通报批评并扣除当月安全奖；4. 组织观看安全警示教育片',
    legalBasis: '《安全生产法》第二十七条：生产经营单位的特种作业人员必须按照国家有关规定经专门的安全作业培训，取得相应资格',
    preventiveMeasures: '1. 设置物理隔离设施和警示标识；2. 安装门禁系统进行权限管理；3. 利用AI视频监控识别入侵行为；4. 加强巡查频次',
    typicalCase: '某铜矿非授权人员误入爆破作业区，险些造成群死群伤事故',
    createTime: '2024-01-11 14:20:00',
    updateTime: '2024-01-11 14:20:00'
  },
  {
    knowledgeId: 'KN005',
    violationName: '高处作业未系安全带',
    violationType: '高处作业违规',
    severity: '严重',
    penaltyLevel: '一级处罚',
    handlingMeasures: '1. 立即停止高处作业；2. 对责任人处以200-500元罚款；3. 暂停高处作业资格；4. 重新进行高处作业安全培训并考核合格后方可上岗',
    legalBasis: '《高处作业安全规范》规定：凡在坠落高度基准面2米以上（含2米）有可能坠落的高处进行作业，必须系好安全带',
    preventiveMeasures: '1. 配备合格的安全带并定期检查；2. 设置安全监护人；3. 使用AI视频监控识别未系安全带行为；4. 建立高处作业审批制度',
    typicalCase: '某矿山维修工因未系安全带从3米高处坠落，造成腰椎骨折',
    createTime: '2024-01-12 09:15:00',
    updateTime: '2024-01-12 09:15:00'
  },
  {
    knowledgeId: 'KN006',
    violationName: '吊装作业时站在吊物下方',
    violationType: '违规操作设备',
    severity: '严重',
    penaltyLevel: '一级处罚',
    handlingMeasures: '1. 立即停止吊装作业；2. 对责任人处以300-600元罚款；3. 暂停吊装作业资格15天；4. 接受专项安全教育并考核合格',
    legalBasis: '《起重机械安全规程》明确规定：吊装作业时，吊物下方严禁站人',
    preventiveMeasures: '1. 设置吊装作业警戒区域；2. 配备专职指挥人员；3. 加强吊装作业培训；4. 制作安全操作流程图并张贴',
    typicalCase: '某工地因作业人员站在吊物下方，吊物脱落造成死亡事故',
    createTime: '2024-01-12 15:30:00',
    updateTime: '2024-01-12 15:30:00'
  },
  {
    knowledgeId: 'KN007',
    violationName: '气瓶混放运输',
    violationType: '违规存放物品',
    severity: '较重',
    penaltyLevel: '二级处罚',
    handlingMeasures: '1. 立即分开存放；2. 对责任人处以100-300元罚款；3. 学习气瓶安全管理规定；4. 加强现场管理',
    legalBasis: '《气瓶安全监察规程》规定：氧气瓶与乙炔瓶不得混放运输，间距应大于5米',
    preventiveMeasures: '1. 配置专用气瓶运输车；2. 在存放区划分明确区域；3. 设置警示标识；4. 建立气瓶管理台账',
    createTime: '2024-01-13 10:00:00',
    updateTime: '2024-01-13 10:00:00'
  },
  {
    knowledgeId: 'KN008',
    violationName: '未穿戴防护服进行焊割作业',
    violationType: '未佩戴安全装备',
    severity: '较重',
    penaltyLevel: '二级处罚',
    handlingMeasures: '1. 停止作业并穿戴防护装备；2. 对责任人处以100-300元罚款；3. 进行安全警示教育；4. 加强劳保用品管理',
    legalBasis: '《劳动防护用品监督管理规定》：用人单位必须为劳动者提供符合国家标准的劳动防护用品，并监督其正确使用',
    preventiveMeasures: '1. 配发合格的防护用品；2. 建立领用登记制度；3. 加强现场检查；4. 开展安全教育',
    createTime: '2024-01-13 16:45:00',
    updateTime: '2024-01-13 16:45:00'
  }
];

const knowledgeList = ref<KnowledgeVO[]>([]);
const allKnowledgeList = ref<KnowledgeVO[]>([...staticKnowledgeData]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const knowledgeFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: KnowledgeForm = {
  knowledgeId: undefined,
  violationName: '',
  violationType: '',
  severity: '',
  penaltyLevel: '',
  handlingMeasures: '',
  legalBasis: '',
  preventiveMeasures: '',
  typicalCase: '',
  remark: ''
};

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    knowledgeId: '',
    violationType: '',
    severity: '',
    keyword: ''
  } as KnowledgeQuery,
  form: { ...initFormData },
  rules: {
    violationName: [{ required: true, message: '违规行为名称不能为空', trigger: 'blur' }],
    violationType: [{ required: true, message: '违规类型不能为空', trigger: 'change' }],
    severity: [{ required: true, message: '严重程度不能为空', trigger: 'change' }],
    penaltyLevel: [{ required: true, message: '处罚等级不能为空', trigger: 'change' }],
    handlingMeasures: [{ required: true, message: '处理措施不能为空', trigger: 'blur' }],
    legalBasis: [{ required: true, message: '法律依据不能为空', trigger: 'blur' }],
    preventiveMeasures: [{ required: true, message: '预防措施不能为空', trigger: 'blur' }]
  },
  viewData: {} as KnowledgeVO
});

const { queryParams, form, rules, viewData } = toRefs(data);

/** 获取违规类型颜色 */
const getViolationTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    未佩戴安全装备: 'danger',
    违规操作设备: 'warning',
    危险区域入侵: 'danger',
    '违规吸烟/动火': 'danger',
    违规存放物品: 'warning',
    高处作业违规: 'warning',
    其他违规行为: 'info'
  };
  return colorMap[type] || 'info';
};

/** 获取严重程度颜色 */
const getSeverityColor = (severity: string) => {
  const colorMap: Record<string, string> = {
    严重: 'danger',
    较重: 'warning',
    一般: 'primary',
    轻微: 'info'
  };
  return colorMap[severity] || 'info';
};

/** 查询知识列表 */
const getList = () => {
  loading.value = true;

  setTimeout(() => {
    const filteredData = allKnowledgeList.value.filter((knowledge) => {
      let match = true;
      if (queryParams.value.knowledgeId && !knowledge.knowledgeId.includes(queryParams.value.knowledgeId)) {
        match = false;
      }
      if (queryParams.value.violationType && knowledge.violationType !== queryParams.value.violationType) {
        match = false;
      }
      if (queryParams.value.severity && knowledge.severity !== queryParams.value.severity) {
        match = false;
      }
      if (queryParams.value.keyword) {
        const keyword = queryParams.value.keyword.toLowerCase();
        const searchText = `${knowledge.knowledgeId}${knowledge.violationName}${knowledge.handlingMeasures}${knowledge.legalBasis}`.toLowerCase();
        if (!searchText.includes(keyword)) {
          match = false;
        }
      }
      return match;
    });

    total.value = filteredData.length;

    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
    const end = start + queryParams.value.pageSize;
    knowledgeList.value = filteredData.slice(start, end);

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
  dialog.title = '新增违规处理知识';
};

/** 查看详情 */
const handleView = (row: KnowledgeVO) => {
  viewDialog.visible = true;
  viewData.value = { ...row };
};

/** 修改按钮操作 */
const handleUpdate = (row: KnowledgeVO) => {
  reset();
  dialog.visible = true;
  dialog.title = '修改违规处理知识';
  form.value = {
    knowledgeId: row.knowledgeId,
    violationName: row.violationName,
    violationType: row.violationType,
    severity: row.severity,
    penaltyLevel: row.penaltyLevel,
    handlingMeasures: row.handlingMeasures,
    legalBasis: row.legalBasis,
    preventiveMeasures: row.preventiveMeasures,
    typicalCase: row.typicalCase || '',
    remark: row.remark || ''
  };
};

/** 删除按钮操作 */
const handleDelete = (row: KnowledgeVO) => {
  proxy?.$modal
    .confirm(`是否确认删除知识编号为 ${row.knowledgeId} 的数据项？`)
    .then(() => {
      allKnowledgeList.value = allKnowledgeList.value.filter((item) => item.knowledgeId !== row.knowledgeId);
      proxy?.$modal.msgSuccess('删除成功');
      getList();
    })
    .catch(() => {});
};

/** 提交按钮 */
const submitForm = () => {
  knowledgeFormRef.value?.validate(async (valid: boolean) => {
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

      if (form.value.knowledgeId) {
        // 更新知识
        const index = allKnowledgeList.value.findIndex((item) => item.knowledgeId === form.value.knowledgeId);
        if (index !== -1) {
          allKnowledgeList.value[index] = {
            ...allKnowledgeList.value[index],
            violationName: form.value.violationName,
            violationType: form.value.violationType,
            severity: form.value.severity,
            penaltyLevel: form.value.penaltyLevel,
            handlingMeasures: form.value.handlingMeasures,
            legalBasis: form.value.legalBasis,
            preventiveMeasures: form.value.preventiveMeasures,
            typicalCase: form.value.typicalCase,
            remark: form.value.remark,
            updateTime: currentTime
          };
        }
        proxy?.$modal.msgSuccess('修改成功');
      } else {
        // 新增知识
        const newKnowledge: KnowledgeVO = {
          knowledgeId: 'KN' + String(allKnowledgeList.value.length + 1).padStart(3, '0'),
          violationName: form.value.violationName,
          violationType: form.value.violationType,
          severity: form.value.severity,
          penaltyLevel: form.value.penaltyLevel,
          handlingMeasures: form.value.handlingMeasures,
          legalBasis: form.value.legalBasis,
          preventiveMeasures: form.value.preventiveMeasures,
          typicalCase: form.value.typicalCase,
          remark: form.value.remark,
          createTime: currentTime,
          updateTime: currentTime
        };
        allKnowledgeList.value.unshift(newKnowledge);
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
  knowledgeFormRef.value?.resetFields();
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
.detail-text {
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}
</style>
