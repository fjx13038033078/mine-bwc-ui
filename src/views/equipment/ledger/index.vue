<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="用户编号" prop="userNumber">
              <el-input v-model="queryParams.userNumber" placeholder="请输入用户编号" clearable @keyup.enter="handleQuery" style="width: 150px" />
            </el-form-item>
            <el-form-item label="序列号" prop="serialNumber">
              <el-input v-model="queryParams.serialNumber" placeholder="请输入序列号" clearable @keyup.enter="handleQuery" style="width: 150px" />
            </el-form-item>
            <el-form-item label="型号" prop="model">
              <el-input v-model="queryParams.model" placeholder="请输入设备型号" clearable @keyup.enter="handleQuery" style="width: 150px" />
            </el-form-item>
            <el-form-item label="归属部门" prop="department">
              <el-select v-model="queryParams.department" placeholder="请选择归属部门" clearable style="width: 120px">
                <el-option v-for="dept in DEPARTMENTS" :key="dept.value" :label="dept.label" :value="dept.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="设备状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
                <el-option v-for="status in DEVICE_STATUS_OPTIONS" :key="status.value" :label="status.label" :value="status.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="责任人" prop="principal">
              <el-input v-model="queryParams.principal" placeholder="请输入责任人" clearable @keyup.enter="handleQuery" style="width: 120px" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增设备</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport">导出数据</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="deviceList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="设备ID" align="center" prop="deviceId" min-width="120" />
        <el-table-column label="序列号" align="center" prop="serialNumber" min-width="140" :show-overflow-tooltip="true" />
        <el-table-column label="型号" align="center" prop="model" min-width="120" :show-overflow-tooltip="true" />
        <el-table-column label="设备状态" align="center" prop="status" min-width="100">
          <template #default="scope">
            <el-tag :type="getDeviceStatusInfo(scope.row.status).type" size="small">
              {{ getDeviceStatusInfo(scope.row.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="归属部门" align="center" prop="department" min-width="100" />
        <el-table-column label="责任人" align="center" prop="principal" min-width="100" />
        <el-table-column label="视频数" align="center" prop="videoCount" min-width="80" />
        <el-table-column label="违规数" align="center" prop="violationCount" min-width="80">
          <template #default="scope">
            <span :style="{ color: scope.row.violationCount > 0 ? '#F56C6C' : '', fontWeight: scope.row.violationCount > 0 ? 'bold' : 'normal' }">
              {{ scope.row.violationCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" min-width="160" />

        <el-table-column label="操作" fixed="right" width="200" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
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

    <!-- 添加或修改设备对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="600px" append-to-body @close="closeDialog">
      <el-form ref="deviceFormRef" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户编号" prop="userNumber">
              <el-input v-model="form.userNumber" placeholder="请输入用户编号" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位编号" prop="unitNumber">
              <el-input v-model="form.unitNumber" placeholder="请输入单位编号" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="序列号" prop="serialNumber">
              <el-input v-model="form.serialNumber" placeholder="请输入设备序列号" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="型号" prop="model">
              <el-input v-model="form.model" placeholder="请输入设备型号" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="department">
              <el-select v-model="form.department" placeholder="请选择归属部门" style="width: 100%">
                <el-option v-for="dept in DEPARTMENTS" :key="dept.value" :label="dept.label" :value="dept.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任人" prop="principal">
              <el-input v-model="form.principal" placeholder="请输入责任人" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择设备状态" style="width: 100%">
                <el-option v-for="status in DEVICE_STATUS_OPTIONS" :key="status.value" :label="status.label" :value="status.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" :rows="3" maxlength="500"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设备详情对话框 -->
    <el-dialog v-model="viewDialog.visible" title="设备详情" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备ID">{{ viewData.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="设备状态">
          <el-tag :type="getDeviceStatusInfo(viewData.status).type" size="small">
            {{ getDeviceStatusInfo(viewData.status).text }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户编号">{{ viewData.userNumber }}</el-descriptions-item>
        <el-descriptions-item label="单位编号">{{ viewData.unitNumber }}</el-descriptions-item>
        <el-descriptions-item label="设备序列号">{{ viewData.serialNumber }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ viewData.model }}</el-descriptions-item>
        <el-descriptions-item label="归属部门">{{ viewData.department }}</el-descriptions-item>
        <el-descriptions-item label="责任人">{{ viewData.principal }}</el-descriptions-item>
        <el-descriptions-item label="采集视频数">
          <el-tag type="primary" size="small">{{ viewData.videoCount }} 个</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="识别违规数">
          <el-tag :type="viewData.violationCount > 0 ? 'danger' : 'success'" size="small"> {{ viewData.violationCount }} 次 </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ viewData.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ viewData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="EquipmentLedger" lang="ts">
import { DEPARTMENTS, DEVICE_STATUS_OPTIONS } from '@/utils/copper-mine-constants';
import { generateId, formatDateTime, getDeviceStatusInfo, exportToCSV } from '@/utils/copper-mine-utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 设备数据接口
interface DeviceVO {
  deviceId: string;
  userNumber: string;
  unitNumber: string;
  serialNumber: string;
  model: string;
  department: string;
  principal: string;
  status: 'online' | 'offline' | 'maintenance' | 'fault';
  videoCount: number;
  violationCount: number;
  remark: string;
  createTime: string;
  updateTime: string;
}

interface DeviceForm {
  deviceId?: string;
  userNumber: string;
  unitNumber: string;
  serialNumber: string;
  model: string;
  department: string;
  principal: string;
  status: 'online' | 'offline' | 'maintenance' | 'fault';
  remark: string;
}

interface DeviceQuery {
  pageNum: number;
  pageSize: number;
  userNumber?: string;
  unitNumber?: string;
  serialNumber?: string;
  model?: string;
  department?: string;
  principal?: string;
  status?: string;
}

// 静态数据 - 模拟30条设备数据（包含状态和统计信息）
const staticDeviceData: DeviceVO[] = [
  {
    deviceId: 'DEV001',
    userNumber: 'USER001',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2024001',
    model: 'AI-CAM-V3',
    department: '采矿部',
    principal: '张三',
    status: 'online',
    videoCount: 245,
    violationCount: 12,
    remark: 'AI识别摄像头，用于井下安全监控',
    createTime: '2024-01-15 08:30:00',
    updateTime: '2024-11-21 10:00:00'
  },
  {
    deviceId: 'DEV002',
    userNumber: 'USER002',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2024002',
    model: 'AI-CAM-V3',
    department: '采矿部',
    principal: '李四',
    status: 'online',
    videoCount: 198,
    violationCount: 8,
    remark: 'AI识别摄像头，支持夜视功能',
    createTime: '2024-01-16 09:00:00',
    updateTime: '2024-11-21 09:30:00'
  },
  {
    deviceId: 'DEV003',
    userNumber: 'USER003',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2024003',
    model: 'AI-CAM-V2',
    department: '安全部',
    principal: '王五',
    status: 'online',
    videoCount: 312,
    violationCount: 15,
    remark: '安装在主通道入口',
    createTime: '2024-01-17 10:15:00',
    updateTime: '2024-11-21 08:45:00'
  },
  {
    deviceId: 'DEV004',
    userNumber: 'USER004',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2024004',
    model: 'AI-CAM-V3',
    department: '技术部',
    principal: '赵六',
    status: 'maintenance',
    videoCount: 156,
    violationCount: 4,
    remark: '高清AI识别设备，支持多目标跟踪',
    createTime: '2024-01-18 14:20:00',
    updateTime: '2024-11-20 16:00:00'
  },
  {
    deviceId: 'DEV005',
    userNumber: 'USER005',
    unitNumber: 'UNIT003',
    serialNumber: 'SN2024005',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '孙七',
    status: 'online',
    videoCount: 287,
    violationCount: 19,
    remark: '工作面监控设备',
    createTime: '2024-01-19 11:00:00',
    updateTime: '2024-11-21 11:15:00'
  },
  {
    deviceId: 'DEV006',
    userNumber: 'USER006',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2024006',
    model: 'AI-CAM-V1',
    department: '设备部',
    principal: '周八',
    status: 'offline',
    videoCount: 89,
    violationCount: 2,
    remark: '设备维护区监控',
    createTime: '2024-01-20 13:45:00',
    updateTime: '2024-11-19 14:30:00'
  },
  {
    deviceId: 'DEV007',
    userNumber: 'USER007',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2024007',
    model: 'AI-CAM-V3',
    department: '安全部',
    principal: '吴九',
    status: 'online',
    videoCount: 421,
    violationCount: 23,
    remark: '紧急出口监控设备',
    createTime: '2024-01-21 08:00:00',
    updateTime: '2024-11-21 07:20:00'
  },
  {
    deviceId: 'DEV008',
    userNumber: 'USER008',
    unitNumber: 'UNIT004',
    serialNumber: 'SN2024008',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '郑十',
    status: 'online',
    videoCount: 334,
    violationCount: 11,
    remark: '二号工作面AI识别',
    createTime: '2024-01-22 09:30:00',
    updateTime: '2024-11-21 10:45:00'
  },
  {
    deviceId: 'DEV009',
    userNumber: 'USER009',
    unitNumber: 'UNIT003',
    serialNumber: 'SN2024009',
    model: 'AI-CAM-V1',
    department: '机电部',
    principal: '冯十一',
    status: 'online',
    videoCount: 178,
    violationCount: 6,
    remark: '物资存储区监控',
    createTime: '2024-01-23 10:00:00',
    updateTime: '2024-11-21 09:00:00'
  },
  {
    deviceId: 'DEV010',
    userNumber: 'USER010',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2024010',
    model: 'AI-CAM-V3',
    department: '技术部',
    principal: '陈十二',
    status: 'fault',
    videoCount: 67,
    violationCount: 1,
    remark: '技术测试设备，需要维修',
    createTime: '2024-01-24 15:30:00',
    updateTime: '2024-11-18 13:20:00'
  },
  {
    deviceId: 'DEV011',
    userNumber: 'USER011',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2024011',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '张三',
    status: 'online',
    videoCount: 256,
    violationCount: 14,
    remark: '三号井口监控',
    createTime: '2024-01-25 08:15:00',
    updateTime: '2024-11-21 08:30:00'
  },
  {
    deviceId: 'DEV012',
    userNumber: 'USER012',
    unitNumber: 'UNIT005',
    serialNumber: 'SN2024012',
    model: 'AI-CAM-V1',
    department: '安全部',
    principal: '李四',
    status: 'online',
    videoCount: 189,
    violationCount: 7,
    remark: '地下通风口监控',
    createTime: '2024-01-26 09:45:00',
    updateTime: '2024-11-21 11:00:00'
  },
  {
    deviceId: 'DEV013',
    userNumber: 'USER013',
    unitNumber: 'UNIT003',
    serialNumber: 'SN2024013',
    model: 'AI-CAM-V3',
    department: '采矿部',
    principal: '王五',
    status: 'online',
    videoCount: 398,
    violationCount: 21,
    remark: '采掘面监控设备',
    createTime: '2024-01-27 11:20:00',
    updateTime: '2024-11-21 10:15:00'
  },
  {
    deviceId: 'DEV014',
    userNumber: 'USER014',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2024014',
    model: 'AI-CAM-V2',
    department: '设备部',
    principal: '赵六',
    status: 'online',
    videoCount: 223,
    violationCount: 9,
    remark: '机电设备区监控',
    createTime: '2024-01-28 14:00:00',
    updateTime: '2024-11-21 09:45:00'
  },
  {
    deviceId: 'DEV015',
    userNumber: 'USER015',
    unitNumber: 'UNIT004',
    serialNumber: 'SN2024015',
    model: 'AI-CAM-V1',
    department: '技术部',
    principal: '孙七',
    status: 'maintenance',
    videoCount: 134,
    violationCount: 3,
    remark: '实验区域监控，定期维护中',
    createTime: '2024-01-29 10:30:00',
    updateTime: '2024-11-20 15:30:00'
  },
  {
    deviceId: 'DEV016',
    userNumber: 'USER016',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2024016',
    model: 'AI-CAM-V3',
    department: '安全部',
    principal: '周八',
    status: 'online',
    videoCount: 456,
    violationCount: 27,
    remark: '主井提升监控',
    createTime: '2024-01-30 08:45:00',
    updateTime: '2024-11-21 07:45:00'
  },
  {
    deviceId: 'DEV017',
    userNumber: 'USER017',
    unitNumber: 'UNIT005',
    serialNumber: 'SN2024017',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '吴九',
    status: 'online',
    videoCount: 301,
    violationCount: 16,
    remark: '运输巷道监控',
    createTime: '2024-01-31 13:15:00',
    updateTime: '2024-11-21 10:30:00'
  },
  {
    deviceId: 'DEV018',
    userNumber: 'USER018',
    unitNumber: 'UNIT003',
    serialNumber: 'SN2024018',
    model: 'AI-CAM-V1',
    department: '机电部',
    principal: '郑十',
    status: 'online',
    videoCount: 167,
    violationCount: 5,
    remark: '休息区监控设备',
    createTime: '2024-02-01 09:00:00',
    updateTime: '2024-11-21 08:00:00'
  },
  {
    deviceId: 'DEV019',
    userNumber: 'USER019',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2024019',
    model: 'AI-CAM-V3',
    department: '技术部',
    principal: '冯十一',
    status: 'online',
    videoCount: 212,
    violationCount: 10,
    remark: '数据采集设备',
    createTime: '2024-02-02 10:45:00',
    updateTime: '2024-11-21 09:15:00'
  },
  {
    deviceId: 'DEV020',
    userNumber: 'USER020',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2024020',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '陈十二',
    status: 'online',
    videoCount: 278,
    violationCount: 13,
    remark: '四号工作面监控',
    createTime: '2024-02-03 14:30:00',
    updateTime: '2024-11-21 11:30:00'
  }
];

const deviceList = ref<DeviceVO[]>([]);
const allDeviceList = ref<DeviceVO[]>([...staticDeviceData]);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const deviceFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DeviceForm = {
  deviceId: undefined,
  userNumber: '',
  unitNumber: '',
  serialNumber: '',
  model: '',
  department: '',
  principal: '',
  status: 'online',
  remark: ''
};

const data = reactive({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userNumber: '',
    unitNumber: '',
    serialNumber: '',
    model: '',
    department: '',
    principal: '',
    status: ''
  } as DeviceQuery,
  rules: {
    userNumber: [{ required: true, message: '用户编号不能为空', trigger: 'blur' }],
    unitNumber: [{ required: true, message: '单位编号不能为空', trigger: 'blur' }],
    serialNumber: [{ required: true, message: '设备序列号不能为空', trigger: 'blur' }],
    model: [{ required: true, message: '设备型号不能为空', trigger: 'blur' }],
    department: [{ required: true, message: '归属部门不能为空', trigger: 'change' }],
    principal: [{ required: true, message: '责任人不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '设备状态不能为空', trigger: 'change' }]
  },
  viewData: {} as DeviceVO
});

const { queryParams, form, rules, viewData } = toRefs(data);

/** 查询设备列表 */
const getList = () => {
  loading.value = true;

  setTimeout(() => {
    const filteredData = allDeviceList.value.filter((device) => {
      let match = true;
      if (queryParams.value.userNumber && !device.userNumber.includes(queryParams.value.userNumber)) {
        match = false;
      }
      if (queryParams.value.unitNumber && !device.unitNumber.includes(queryParams.value.unitNumber)) {
        match = false;
      }
      if (queryParams.value.serialNumber && !device.serialNumber.includes(queryParams.value.serialNumber)) {
        match = false;
      }
      if (queryParams.value.model && !device.model.includes(queryParams.value.model)) {
        match = false;
      }
      if (queryParams.value.department && device.department !== queryParams.value.department) {
        match = false;
      }
      if (queryParams.value.status && device.status !== queryParams.value.status) {
        match = false;
      }
      if (queryParams.value.principal && !device.principal.includes(queryParams.value.principal)) {
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

/** 查看设备详情 */
const handleView = (row: DeviceVO) => {
  viewData.value = { ...row };
  viewDialog.visible = true;
};

/** 删除按钮操作 */
const handleDelete = (row?: DeviceVO) => {
  const deviceIds = row?.deviceId ? [row.deviceId] : ids.value;

  proxy?.$modal
    .confirm('是否确认删除设备编号为"' + deviceIds.join(',') + '"的数据项？')
    .then(() => {
      allDeviceList.value = allDeviceList.value.filter((device) => !deviceIds.includes(device.deviceId));
      getList();
      proxy?.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
};

/** 选择条数  */
const handleSelectionChange = (selection: DeviceVO[]) => {
  ids.value = selection.map((item) => item.deviceId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 导出按钮操作 */
const handleExport = () => {
  const exportData = allDeviceList.value.map((item) => ({
    设备ID: item.deviceId,
    用户编号: item.userNumber,
    单位编号: item.unitNumber,
    序列号: item.serialNumber,
    型号: item.model,
    归属部门: item.department,
    责任人: item.principal,
    设备状态: getDeviceStatusInfo(item.status).text,
    视频数量: item.videoCount,
    违规数量: item.violationCount,
    备注: item.remark,
    创建时间: item.createTime,
    更新时间: item.updateTime
  }));

  exportToCSV(exportData, `设备台账_${formatDateTime(new Date(), 'date')}.csv`);
  proxy?.$modal.msgSuccess('导出成功');
};

/** 重置操作表单 */
const reset = () => {
  form.value = { ...initFormData };
  deviceFormRef.value?.resetFields();
};

/** 取消按钮 */
const cancel = () => {
  dialog.visible = false;
  reset();
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加设备';
};

/** 修改按钮操作 */
const handleUpdate = (row?: DeviceVO) => {
  reset();
  const device = row || allDeviceList.value.find((item) => item.deviceId === ids.value[0]);
  if (device) {
    dialog.visible = true;
    dialog.title = '修改设备';
    form.value = {
      deviceId: device.deviceId,
      userNumber: device.userNumber,
      unitNumber: device.unitNumber,
      serialNumber: device.serialNumber,
      model: device.model,
      department: device.department,
      principal: device.principal,
      status: device.status,
      remark: device.remark
    };
  }
};

/** 提交按钮 */
const submitForm = () => {
  deviceFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const currentTime = formatDateTime();

      if (form.value.deviceId) {
        // 更新设备
        const index = allDeviceList.value.findIndex((item) => item.deviceId === form.value.deviceId);
        if (index !== -1) {
          allDeviceList.value[index] = {
            ...allDeviceList.value[index],
            ...form.value,
            updateTime: currentTime
          } as DeviceVO;
        }
        proxy?.$modal.msgSuccess('修改成功');
      } else {
        // 新增设备
        const newDevice: DeviceVO = {
          deviceId: generateId('DEV'),
          userNumber: form.value.userNumber,
          unitNumber: form.value.unitNumber,
          serialNumber: form.value.serialNumber,
          model: form.value.model,
          department: form.value.department,
          principal: form.value.principal,
          status: form.value.status,
          videoCount: 0,
          violationCount: 0,
          remark: form.value.remark,
          createTime: currentTime,
          updateTime: currentTime
        };
        allDeviceList.value.unshift(newDevice);
        proxy?.$modal.msgSuccess('新增成功');
      }
      dialog.visible = false;
      await getList();
    }
  });
};

/** 关闭设备弹窗 */
const closeDialog = () => {
  dialog.visible = false;
  reset();
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss"></style>
