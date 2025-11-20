<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="用户编号" prop="userNumber">
              <el-input v-model="queryParams.userNumber" placeholder="请输入用户编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="单位编号" prop="unitNumber">
              <el-input v-model="queryParams.unitNumber" placeholder="请输入单位编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="序列号" prop="serialNumber">
              <el-input v-model="queryParams.serialNumber" placeholder="请输入设备序列号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="型号" prop="model">
              <el-input v-model="queryParams.model" placeholder="请输入设备型号" clearable @keyup.enter="handleQuery" />
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
            <el-form-item label="责任人" prop="principal">
              <el-input v-model="queryParams.principal" placeholder="请输入责任人" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="deviceList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="设备ID" align="center" prop="deviceId" width="100" />
        <el-table-column label="用户编号" align="center" prop="userNumber" :show-overflow-tooltip="true" />
        <el-table-column label="单位编号" align="center" prop="unitNumber" :show-overflow-tooltip="true" />
        <el-table-column label="序列号" align="center" prop="serialNumber" :show-overflow-tooltip="true" />
        <el-table-column label="型号" align="center" prop="model" :show-overflow-tooltip="true" />
        <el-table-column label="归属部门" align="center" prop="department" width="120" />
        <el-table-column label="责任人" align="center" prop="principal" width="100" />
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="160" />

        <el-table-column label="操作" fixed="right" width="180" class-name="small-padding fixed-width">
          <template #default="scope">
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
              <el-select v-model="form.department" placeholder="请选择归属部门">
                <el-option label="采矿部" value="采矿部" />
                <el-option label="安全部" value="安全部" />
                <el-option label="技术部" value="技术部" />
                <el-option label="设备部" value="设备部" />
                <el-option label="后勤部" value="后勤部" />
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
  </div>
</template>

<script setup name="EquipmentLedger" lang="ts">
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
  remark: string;
  createTime: string;
}

interface DeviceForm {
  deviceId?: string;
  userNumber: string;
  unitNumber: string;
  serialNumber: string;
  model: string;
  department: string;
  principal: string;
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
}

// 静态数据 - 模拟100条设备数据
const staticDeviceData: DeviceVO[] = [
  {
    deviceId: 'DEV001',
    userNumber: 'USER001',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2023001',
    model: 'AI-CAM-V1',
    department: '采矿部',
    principal: '张三',
    remark: 'AI识别摄像头，用于井下安全监控',
    createTime: '2024-01-15 08:30:00'
  },
  {
    deviceId: 'DEV002',
    userNumber: 'USER002',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2023002',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '李四',
    remark: 'AI识别摄像头，支持夜视功能',
    createTime: '2024-01-16 09:00:00'
  },
  {
    deviceId: 'DEV003',
    userNumber: 'USER003',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2023003',
    model: 'AI-CAM-V1',
    department: '安全部',
    principal: '王五',
    remark: '安装在主通道入口',
    createTime: '2024-01-17 10:15:00'
  },
  {
    deviceId: 'DEV004',
    userNumber: 'USER004',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2023004',
    model: 'AI-CAM-V3',
    department: '技术部',
    principal: '赵六',
    remark: '高清AI识别设备，支持多目标跟踪',
    createTime: '2024-01-18 14:20:00'
  },
  {
    deviceId: 'DEV005',
    userNumber: 'USER005',
    unitNumber: 'UNIT003',
    serialNumber: 'SN2023005',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '孙七',
    remark: '工作面监控设备',
    createTime: '2024-01-19 11:00:00'
  },
  {
    deviceId: 'DEV006',
    userNumber: 'USER006',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2023006',
    model: 'AI-CAM-V1',
    department: '设备部',
    principal: '周八',
    remark: '设备维护区监控',
    createTime: '2024-01-20 13:45:00'
  },
  {
    deviceId: 'DEV007',
    userNumber: 'USER007',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2023007',
    model: 'AI-CAM-V3',
    department: '安全部',
    principal: '吴九',
    remark: '紧急出口监控设备',
    createTime: '2024-01-21 08:00:00'
  },
  {
    deviceId: 'DEV008',
    userNumber: 'USER008',
    unitNumber: 'UNIT004',
    serialNumber: 'SN2023008',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '郑十',
    remark: '二号工作面AI识别',
    createTime: '2024-01-22 09:30:00'
  },
  {
    deviceId: 'DEV009',
    userNumber: 'USER009',
    unitNumber: 'UNIT003',
    serialNumber: 'SN2023009',
    model: 'AI-CAM-V1',
    department: '后勤部',
    principal: '冯十一',
    remark: '物资存储区监控',
    createTime: '2024-01-23 10:00:00'
  },
  {
    deviceId: 'DEV010',
    userNumber: 'USER010',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2023010',
    model: 'AI-CAM-V3',
    department: '技术部',
    principal: '陈十二',
    remark: '技术测试设备',
    createTime: '2024-01-24 15:30:00'
  },
  {
    deviceId: 'DEV011',
    userNumber: 'USER011',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2023011',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '张三',
    remark: '三号井口监控',
    createTime: '2024-01-25 08:15:00'
  },
  {
    deviceId: 'DEV012',
    userNumber: 'USER012',
    unitNumber: 'UNIT005',
    serialNumber: 'SN2023012',
    model: 'AI-CAM-V1',
    department: '安全部',
    principal: '李四',
    remark: '地下通风口监控',
    createTime: '2024-01-26 09:45:00'
  },
  {
    deviceId: 'DEV013',
    userNumber: 'USER013',
    unitNumber: 'UNIT003',
    serialNumber: 'SN2023013',
    model: 'AI-CAM-V3',
    department: '采矿部',
    principal: '王五',
    remark: '采掘面监控设备',
    createTime: '2024-01-27 11:20:00'
  },
  {
    deviceId: 'DEV014',
    userNumber: 'USER014',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2023014',
    model: 'AI-CAM-V2',
    department: '设备部',
    principal: '赵六',
    remark: '机电设备区监控',
    createTime: '2024-01-28 14:00:00'
  },
  {
    deviceId: 'DEV015',
    userNumber: 'USER015',
    unitNumber: 'UNIT004',
    serialNumber: 'SN2023015',
    model: 'AI-CAM-V1',
    department: '技术部',
    principal: '孙七',
    remark: '实验区域监控',
    createTime: '2024-01-29 10:30:00'
  },
  {
    deviceId: 'DEV016',
    userNumber: 'USER016',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2023016',
    model: 'AI-CAM-V3',
    department: '安全部',
    principal: '周八',
    remark: '主井提升监控',
    createTime: '2024-01-30 08:45:00'
  },
  {
    deviceId: 'DEV017',
    userNumber: 'USER017',
    unitNumber: 'UNIT005',
    serialNumber: 'SN2023017',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '吴九',
    remark: '运输巷道监控',
    createTime: '2024-01-31 13:15:00'
  },
  {
    deviceId: 'DEV018',
    userNumber: 'USER018',
    unitNumber: 'UNIT003',
    serialNumber: 'SN2023018',
    model: 'AI-CAM-V1',
    department: '后勤部',
    principal: '郑十',
    remark: '休息区监控设备',
    createTime: '2024-02-01 09:00:00'
  },
  {
    deviceId: 'DEV019',
    userNumber: 'USER019',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2023019',
    model: 'AI-CAM-V3',
    department: '技术部',
    principal: '冯十一',
    remark: '数据采集设备',
    createTime: '2024-02-02 10:45:00'
  },
  {
    deviceId: 'DEV020',
    userNumber: 'USER020',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2023020',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '陈十二',
    remark: '四号工作面监控',
    createTime: '2024-02-03 14:30:00'
  },
  {
    deviceId: 'DEV021',
    userNumber: 'USER021',
    unitNumber: 'UNIT004',
    serialNumber: 'SN2023021',
    model: 'AI-CAM-V1',
    department: '安全部',
    principal: '张三',
    remark: '安全通道监控',
    createTime: '2024-02-04 08:20:00'
  },
  {
    deviceId: 'DEV022',
    userNumber: 'USER022',
    unitNumber: 'UNIT005',
    serialNumber: 'SN2023022',
    model: 'AI-CAM-V3',
    department: '设备部',
    principal: '李四',
    remark: '设备检修区监控',
    createTime: '2024-02-05 11:00:00'
  },
  {
    deviceId: 'DEV023',
    userNumber: 'USER023',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2023023',
    model: 'AI-CAM-V2',
    department: '采矿部',
    principal: '王五',
    remark: '爆破作业区监控',
    createTime: '2024-02-06 09:15:00'
  },
  {
    deviceId: 'DEV024',
    userNumber: 'USER024',
    unitNumber: 'UNIT003',
    serialNumber: 'SN2023024',
    model: 'AI-CAM-V1',
    department: '技术部',
    principal: '赵六',
    remark: '技术培训室监控',
    createTime: '2024-02-07 13:45:00'
  },
  {
    deviceId: 'DEV025',
    userNumber: 'USER025',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2023025',
    model: 'AI-CAM-V3',
    department: '后勤部',
    principal: '孙七',
    remark: '食堂区域监控',
    createTime: '2024-02-08 10:20:00'
  },
  {
    deviceId: 'DEV026',
    userNumber: 'USER026',
    unitNumber: 'UNIT004',
    serialNumber: 'SN2023026',
    model: 'AI-CAM-V2',
    department: '安全部',
    principal: '周八',
    remark: '消防设施监控',
    createTime: '2024-02-09 08:30:00'
  },
  {
    deviceId: 'DEV027',
    userNumber: 'USER027',
    unitNumber: 'UNIT005',
    serialNumber: 'SN2023027',
    model: 'AI-CAM-V1',
    department: '采矿部',
    principal: '吴九',
    remark: '矿石运输监控',
    createTime: '2024-02-10 14:15:00'
  },
  {
    deviceId: 'DEV028',
    userNumber: 'USER028',
    unitNumber: 'UNIT002',
    serialNumber: 'SN2023028',
    model: 'AI-CAM-V3',
    department: '设备部',
    principal: '郑十',
    remark: '动力设备监控',
    createTime: '2024-02-11 09:40:00'
  },
  {
    deviceId: 'DEV029',
    userNumber: 'USER029',
    unitNumber: 'UNIT003',
    serialNumber: 'SN2023029',
    model: 'AI-CAM-V2',
    department: '技术部',
    principal: '冯十一',
    remark: '地质勘探监控',
    createTime: '2024-02-12 11:25:00'
  },
  {
    deviceId: 'DEV030',
    userNumber: 'USER030',
    unitNumber: 'UNIT001',
    serialNumber: 'SN2023030',
    model: 'AI-CAM-V1',
    department: '采矿部',
    principal: '陈十二',
    remark: '五号巷道监控',
    createTime: '2024-02-13 15:00:00'
  }
];

const deviceList = ref<DeviceVO[]>([]);
const allDeviceList = ref<DeviceVO[]>([...staticDeviceData]); // 存储所有设备数据
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

const initFormData: DeviceForm = {
  deviceId: undefined,
  userNumber: '',
  unitNumber: '',
  serialNumber: '',
  model: '',
  department: '',
  principal: '',
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
    principal: ''
  } as DeviceQuery,
  rules: {
    userNumber: [{ required: true, message: '用户编号不能为空', trigger: 'blur' }],
    unitNumber: [{ required: true, message: '单位编号不能为空', trigger: 'blur' }],
    serialNumber: [{ required: true, message: '设备序列号不能为空', trigger: 'blur' }],
    model: [{ required: true, message: '设备型号不能为空', trigger: 'blur' }],
    department: [{ required: true, message: '归属部门不能为空', trigger: 'change' }],
    principal: [{ required: true, message: '责任人不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询设备列表 */
const getList = () => {
  loading.value = true;

  // 模拟异步加载
  setTimeout(() => {
    // 过滤数据
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
      if (queryParams.value.principal && !device.principal.includes(queryParams.value.principal)) {
        match = false;
      }
      return match;
    });

    total.value = filteredData.length;

    // 分页
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

/** 删除按钮操作 */
const handleDelete = (row?: DeviceVO) => {
  const deviceIds = row?.deviceId ? [row.deviceId] : ids.value;

  proxy?.$modal
    .confirm('是否确认删除设备编号为"' + deviceIds.join(',') + '"的数据项？')
    .then(() => {
      // 从静态数据中删除
      allDeviceList.value = allDeviceList.value.filter((device) => !deviceIds.includes(device.deviceId));
      getList();
      proxy?.$modal.msgSuccess('删除成功');
    })
    .catch(() => {
      // 用户取消删除
    });
};

/** 选择条数  */
const handleSelectionChange = (selection: DeviceVO[]) => {
  ids.value = selection.map((item) => item.deviceId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.$modal.msgSuccess('导出功能仅演示，实际项目中需要后端支持');
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
      remark: device.remark
    };
  }
};

/** 提交按钮 */
const submitForm = () => {
  deviceFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.deviceId) {
        // 更新设备
        const index = allDeviceList.value.findIndex((item) => item.deviceId === form.value.deviceId);
        if (index !== -1) {
          allDeviceList.value[index] = {
            ...allDeviceList.value[index],
            ...form.value
          } as DeviceVO;
        }
        proxy?.$modal.msgSuccess('修改成功');
      } else {
        // 新增设备
        const newDevice: DeviceVO = {
          deviceId: 'DEV' + String(allDeviceList.value.length + 1).padStart(3, '0'),
          userNumber: form.value.userNumber,
          unitNumber: form.value.unitNumber,
          serialNumber: form.value.serialNumber,
          model: form.value.model,
          department: form.value.department,
          principal: form.value.principal,
          remark: form.value.remark,
          createTime: new Date()
            .toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })
            .replace(/\//g, '-')
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
  getList(); // 初始化列表数据
});
</script>

<style scoped lang="scss"></style>
