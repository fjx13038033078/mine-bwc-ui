<template>
  <div class="app-container">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409EFF" :size="40">
              <i-ep-user />
            </el-icon>
            <div class="stat-text">
              <div class="stat-value">{{ overallStats.coveragePeople }}</div>
              <div class="stat-label">覆盖人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67C23A" :size="40">
              <i-ep-video-camera />
            </el-icon>
            <div class="stat-text">
              <div class="stat-value">{{ overallStats.totalRecorders }}</div>
              <div class="stat-label">视频记录仪数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#E6A23C" :size="40">
              <i-ep-warning />
            </el-icon>
            <div class="stat-text">
              <div class="stat-value">{{ overallStats.totalIssues }}</div>
              <div class="stat-label">问题总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#F56C6C" :size="40">
              <i-ep-document-checked />
            </el-icon>
            <div class="stat-text">
              <div class="stat-value">{{ overallStats.totalAssessments }}</div>
              <div class="stat-label">考核次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="统计周期">
          <el-select v-model="queryParams.period" placeholder="选择周期" clearable style="width: 150px">
            <el-option label="按日统计" value="daily" />
            <el-option label="按周统计" value="weekly" />
            <el-option label="按月统计" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="queryParams.department" placeholder="选择部门" clearable style="width: 150px">
            <el-option v-for="dept in departments" :key="dept.value" :label="dept.label" :value="dept.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button type="success" :icon="Download" @click="handleExport">导出报表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">报警档案列表</span>
          <div class="header-buttons">
            <el-button type="success" :icon="Download" @click="handleAutoGenerate"> 从已归档违规自动生成 </el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">手动新增档案</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="archiveList" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="archiveId" label="档案编号" width="160" align="center" />
        <el-table-column prop="period" label="统计周期" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getPeriodType(scope.row.period)">
              {{ getPeriodLabel(scope.row.period) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="statisticDate" label="统计日期" width="180" align="center" />
        <el-table-column prop="coveragePeople" label="覆盖人数" width="100" align="center" />
        <el-table-column prop="peopleRate" label="人员覆盖率" width="110" align="center">
          <template #default="scope">
            <el-progress :percentage="scope.row.peopleRate" :color="getProgressColor(scope.row.peopleRate)" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="checkRecorderCount" label="检查记录仪台次" width="140" align="center" />
        <el-table-column prop="activeRecorderCount" label="投入使用台数" width="120" align="center" />
        <el-table-column prop="totalRecorders" label="记录仪数量" width="110" align="center" />
        <el-table-column prop="recorderCheckRate" label="记录仪检查率" width="130" align="center">
          <template #default="scope">
            <el-progress :percentage="scope.row.recorderCheckRate" :color="getProgressColor(scope.row.recorderCheckRate)" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="coverageTime" label="检查覆盖时间(h)" width="150" align="center" />
        <el-table-column prop="timeRate" label="时间覆盖率" width="110" align="center">
          <template #default="scope">
            <el-progress :percentage="scope.row.timeRate" :color="getProgressColor(scope.row.timeRate)" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="issueCount" label="问题数量" width="100" align="center">
          <template #default="scope">
            <el-tag type="warning">{{ scope.row.issueCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="violationCount" label="违章数量" width="100" align="center">
          <template #default="scope">
            <el-tag type="danger">{{ scope.row.violationCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hazardCount" label="隐患数量" width="100" align="center">
          <template #default="scope">
            <el-tag type="danger">{{ scope.row.hazardCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assessmentCount" label="考核次数" width="100" align="center" />
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" :icon="View" @click="handleView(scope.row)">详情</el-button>
            <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="formDialog.visible" :title="formDialog.title" width="1000px" @close="handleFormClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="统计周期" prop="period">
              <el-select v-model="formData.period" placeholder="选择统计周期" style="width: 100%">
                <el-option label="按日统计" value="daily" />
                <el-option label="按周统计" value="weekly" />
                <el-option label="按月统计" value="monthly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统计日期" prop="statisticDate">
              <el-date-picker v-model="formData.statisticDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="覆盖人数" prop="coveragePeople">
              <el-input-number v-model="formData.coveragePeople" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人员覆盖率(%)" prop="peopleRate">
              <el-input-number v-model="formData.peopleRate" :min="0" :max="100" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检查记录仪台次" prop="checkRecorderCount">
              <el-input-number v-model="formData.checkRecorderCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="投入使用台数" prop="activeRecorderCount">
              <el-input-number v-model="formData.activeRecorderCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="视频记录仪数量" prop="totalRecorders">
              <el-input-number v-model="formData.totalRecorders" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="记录仪检查率(%)" prop="recorderCheckRate">
              <el-input-number v-model="formData.recorderCheckRate" :min="0" :max="100" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检查覆盖时间(h)" prop="coverageTime">
              <el-input-number v-model="formData.coverageTime" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间覆盖率(%)" prop="timeRate">
              <el-input-number v-model="formData.timeRate" :min="0" :max="100" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="问题数量" prop="issueCount">
              <el-input-number v-model="formData.issueCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="违章数量" prop="violationCount">
              <el-input-number v-model="formData.violationCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="隐患数量" prop="hazardCount">
              <el-input-number v-model="formData.hazardCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="考核次数" prop="assessmentCount">
              <el-input-number v-model="formData.assessmentCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="formData.department" placeholder="选择部门" style="width: 100%">
                <el-option v-for="dept in departments" :key="dept.value" :label="dept.label" :value="dept.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="4" placeholder="请输入备注信息" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="formDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="viewDialog.visible" title="档案详情" width="900px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="档案编号">
          {{ viewData.archiveId }}
        </el-descriptions-item>
        <el-descriptions-item label="统计周期">
          <el-tag :type="getPeriodType(viewData.period)">
            {{ getPeriodLabel(viewData.period) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="统计日期">
          {{ viewData.statisticDate }}
        </el-descriptions-item>
        <el-descriptions-item label="部门">
          {{ viewData.department || '全部' }}
        </el-descriptions-item>
        <el-descriptions-item label="覆盖人数">
          <el-tag type="info">{{ viewData.coveragePeople }} 人</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="人员覆盖率">
          <el-progress :percentage="viewData.peopleRate" :color="getProgressColor(viewData.peopleRate)" />
        </el-descriptions-item>
        <el-descriptions-item label="检查记录仪台次"> {{ viewData.checkRecorderCount }} 次 </el-descriptions-item>
        <el-descriptions-item label="投入使用台数"> {{ viewData.activeRecorderCount }} 台 </el-descriptions-item>
        <el-descriptions-item label="视频记录仪数量"> {{ viewData.totalRecorders }} 台 </el-descriptions-item>
        <el-descriptions-item label="记录仪检查率">
          <el-progress :percentage="viewData.recorderCheckRate" :color="getProgressColor(viewData.recorderCheckRate)" />
        </el-descriptions-item>
        <el-descriptions-item label="检查覆盖时间"> {{ viewData.coverageTime }} 小时 </el-descriptions-item>
        <el-descriptions-item label="时间覆盖率">
          <el-progress :percentage="viewData.timeRate" :color="getProgressColor(viewData.timeRate)" />
        </el-descriptions-item>
        <el-descriptions-item label="问题数量">
          <el-tag type="warning">{{ viewData.issueCount }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="违章数量">
          <el-tag type="danger">{{ viewData.violationCount }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="隐患数量">
          <el-tag type="danger">{{ viewData.hazardCount }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="考核次数"> {{ viewData.assessmentCount }} 次 </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ viewData.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ viewData.remark || '无' }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button type="primary" @click="viewDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, getCurrentInstance, watch } from 'vue';
import { Search, Refresh, Download, Plus, View, Edit, Delete } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { DEPARTMENTS } from '@/utils/copper-mine-constants';
import { generateId, formatDateTime, exportToCSV } from '@/utils/copper-mine-utils';

const { proxy } = getCurrentInstance() as any;

// ==================== 违规数据接口（从监控预警模块） ====================

interface ViolationVO {
  violationId: string;
  videoId: string;
  deviceId: string;
  captureTime: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  department: string;
  principal: string;
  status: 'pending' | 'processing' | 'handled' | 'archived' | 'false_alarm';
  reported: boolean;
  handler?: string;
  handleTime?: string;
  snapshotUrl?: string;
  videoUrl?: string;
  violationTimestamp?: string;
  confidence?: number;
}

// ==================== 接口定义 ====================

interface AlarmArchiveVO {
  archiveId: string;
  period: 'daily' | 'weekly' | 'monthly';
  statisticDate: string;
  department?: string;
  coveragePeople: number;
  peopleRate: number;
  checkRecorderCount: number;
  activeRecorderCount: number;
  totalRecorders: number;
  recorderCheckRate: number;
  coverageTime: number;
  timeRate: number;
  issueCount: number;
  violationCount: number;
  hazardCount: number;
  assessmentCount: number;
  remark?: string;
  createTime: string;
  updateTime: string;
}

interface AlarmArchiveForm {
  archiveId?: string;
  period: string;
  statisticDate: string;
  department?: string;
  coveragePeople: number;
  peopleRate: number;
  checkRecorderCount: number;
  activeRecorderCount: number;
  totalRecorders: number;
  recorderCheckRate: number;
  coverageTime: number;
  timeRate: number;
  issueCount: number;
  violationCount: number;
  hazardCount: number;
  assessmentCount: number;
  remark?: string;
}

// ==================== 状态管理 ====================

const loading = ref(false);
const departments = DEPARTMENTS;

// 查询参数
const queryParams = reactive({
  period: '',
  dateRange: [] as string[],
  department: '',
  pageNum: 1,
  pageSize: 10
});

// 档案数据
const archiveData = ref<AlarmArchiveVO[]>([]);

// 表单对话框
const formDialog = reactive({
  visible: false,
  title: '新增档案'
});

const formRef = ref<FormInstance>();
const formData = ref<AlarmArchiveForm>({
  period: 'daily',
  statisticDate: '',
  coveragePeople: 0,
  peopleRate: 0,
  checkRecorderCount: 0,
  activeRecorderCount: 0,
  totalRecorders: 0,
  recorderCheckRate: 0,
  coverageTime: 0,
  timeRate: 0,
  issueCount: 0,
  violationCount: 0,
  hazardCount: 0,
  assessmentCount: 0,
  remark: ''
});

const formRules: FormRules = {
  period: [{ required: true, message: '请选择统计周期', trigger: 'change' }],
  statisticDate: [{ required: true, message: '请选择统计日期', trigger: 'change' }],
  coveragePeople: [{ required: true, message: '请输入覆盖人数', trigger: 'blur' }],
  peopleRate: [{ required: true, message: '请输入人员覆盖率', trigger: 'blur' }],
  totalRecorders: [{ required: true, message: '请输入记录仪数量', trigger: 'blur' }]
};

// 详情对话框
const viewDialog = reactive({
  visible: false
});

const viewData = ref<Partial<AlarmArchiveVO>>({});

// ==================== 计算属性 ====================

// 筛选后的档案列表（用于计算总数）
const filteredArchiveList = computed(() => {
  let list = archiveData.value;

  // 筛选条件
  if (queryParams.period) {
    list = list.filter((item) => item.period === queryParams.period);
  }
  if (queryParams.department) {
    list = list.filter((item) => item.department === queryParams.department);
  }
  if (queryParams.dateRange && queryParams.dateRange.length === 2) {
    const [startDate, endDate] = queryParams.dateRange;
    list = list.filter((item) => {
      return item.statisticDate >= startDate && item.statisticDate <= endDate;
    });
  }

  return list;
});

// 总数
const total = computed(() => filteredArchiveList.value.length);

// 档案列表（分页）
const archiveList = computed(() => {
  const list = filteredArchiveList.value;

  // 分页
  const start = (queryParams.pageNum - 1) * queryParams.pageSize;
  const end = start + queryParams.pageSize;
  return list.slice(start, end);
});

// 总体统计
const overallStats = computed(() => {
  const list = archiveData.value;

  if (list.length === 0) {
    return {
      coveragePeople: 0,
      totalRecorders: 0,
      totalIssues: 0,
      totalAssessments: 0
    };
  }

  // 取最近一条记录的统计
  const latest = list[0];

  return {
    coveragePeople: latest.coveragePeople,
    totalRecorders: latest.totalRecorders,
    totalIssues: latest.issueCount + latest.violationCount + latest.hazardCount,
    totalAssessments: list.reduce((sum, item) => sum + item.assessmentCount, 0)
  };
});

// ==================== 工具方法 ====================

const getPeriodLabel = (period: string) => {
  const map: Record<string, string> = {
    daily: '日统计',
    weekly: '周统计',
    monthly: '月统计'
  };
  return map[period] || period;
};

const getPeriodType = (period: string) => {
  const map: Record<string, any> = {
    daily: 'success',
    weekly: 'warning',
    monthly: 'danger'
  };
  return map[period] || 'info';
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#67C23A';
  if (percentage >= 60) return '#E6A23C';
  return '#F56C6C';
};

// ==================== 数据操作 ====================

// 生成模拟违规数据（模拟从监控预警模块获取）
const generateMockViolations = (): ViolationVO[] => {
  const violations: ViolationVO[] = [];
  const today = new Date();
  const statusOptions: Array<'pending' | 'processing' | 'handled' | 'archived' | 'false_alarm'> = [
    'pending',
    'processing',
    'handled',
    'archived',
    'false_alarm'
  ];
  const violationTypes = [
    '未佩戴安全帽',
    '未系安全带',
    '违规操作设备',
    '气瓶平放',
    '气瓶混放',
    '无证上岗',
    '吊装违规',
    '动火违规',
    '高处抛物',
    '无监护人'
  ];
  const severityOptions: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
  const depts = ['采矿部', '安全部', '技术部', '设备部', '后勤部'];

  // 生成近30天的违规记录
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // 每天生成5-15条违规记录
    const dailyCount = 5 + Math.floor(Math.random() * 10);
    for (let j = 0; j < dailyCount; j++) {
      const severity = severityOptions[Math.floor(Math.random() * severityOptions.length)];
      const dept = depts[Math.floor(Math.random() * depts.length)];

      // 80%的记录设置为已归档，20%为其他状态
      const isArchived = Math.random() < 0.8;
      const status = isArchived ? 'archived' : statusOptions[Math.floor(Math.random() * statusOptions.length)];

      violations.push({
        violationId: generateId('VIO'),
        videoId: generateId('VID'),
        deviceId: generateId('DEV'),
        captureTime: `${dateStr} ${Math.floor(Math.random() * 24)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}`,
        violationType: violationTypes[Math.floor(Math.random() * violationTypes.length)],
        severity,
        description: '检测到违规操作',
        department: dept,
        principal: `员工${Math.floor(Math.random() * 100)}`,
        status,
        reported: isArchived,
        handler: isArchived ? `处理人${Math.floor(Math.random() * 10)}` : undefined,
        handleTime: isArchived ? formatDateTime() : undefined,
        snapshotUrl: '/assets/violation-snapshot.jpg',
        confidence: 0.85 + Math.random() * 0.15
      });
    }
  }

  return violations;
};

// 根据违规数据生成档案统计
const generateArchiveFromViolations = (violations: ViolationVO[], date: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): AlarmArchiveVO => {
  // 筛选该日期的已归档违规记录
  const archivedViolations = violations.filter((v) => v.status === 'archived' && v.captureTime.startsWith(date));

  // 统计问题分类
  const issueCount = archivedViolations.filter((v) => v.severity === 'low').length;
  const violationCount = archivedViolations.filter((v) => v.severity === 'medium' || v.severity === 'high').length;
  const hazardCount = archivedViolations.filter((v) => v.severity === 'critical').length;

  // 统计考核次数（已处理的记录数）
  const assessmentCount = archivedViolations.filter((v) => v.handler).length;

  // 统计覆盖的部门和人员（去重）
  const uniqueDepartments = new Set(archivedViolations.map((v) => v.department));
  const uniquePeople = new Set(archivedViolations.map((v) => v.principal));

  // 模拟设备和时间数据（实际应从设备台账获取）
  const totalRecorders = 100;
  const activeRecorderCount = 75 + Math.floor(Math.random() * 15);
  const checkRecorderCount = 80 + Math.floor(Math.random() * 20);
  const coverageTime = 160 + Math.floor(Math.random() * 40);

  // 计算覆盖率
  const coveragePeople = uniquePeople.size;
  const peopleRate = Math.min(95, 70 + Math.floor(Math.random() * 20));
  const recorderCheckRate = Math.round((checkRecorderCount / totalRecorders) * 100);
  const timeRate = Math.round((coverageTime / 240) * 100); // 假设总工作时长240小时

  return {
    archiveId: generateId('ARC'),
    period,
    statisticDate: date,
    department: uniqueDepartments.size > 1 ? undefined : Array.from(uniqueDepartments)[0],
    coveragePeople,
    peopleRate,
    checkRecorderCount,
    activeRecorderCount,
    totalRecorders,
    recorderCheckRate,
    coverageTime,
    timeRate,
    issueCount,
    violationCount,
    hazardCount,
    assessmentCount,
    remark: archivedViolations.length > 20 ? '本日违规数量较多，需加强管理' : archivedViolations.length < 5 ? '本日违规数量较少，情况良好' : '',
    createTime: formatDateTime(),
    updateTime: formatDateTime()
  };
};

// 初始化数据
const initData = () => {
  // 生成模拟违规数据（模拟从监控预警模块获取）
  const allViolations = generateMockViolations();

  // 根据违规数据生成档案
  const mockData: AlarmArchiveVO[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // 根据该日期的已归档违规记录生成档案
    const archive = generateArchiveFromViolations(allViolations, dateStr, 'daily');
    mockData.push(archive);
  }

  // 按日期倒序排列
  archiveData.value = mockData.sort((a, b) => b.statisticDate.localeCompare(a.statisticDate));
};

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1;
  // 实际应用中这里会调用API
};

// 重置查询
const resetQuery = () => {
  queryParams.period = '';
  queryParams.dateRange = [];
  queryParams.department = '';
  queryParams.pageNum = 1;
  handleQuery();
};

// 导出报表
const handleExport = () => {
  const data = archiveList.value.map((item) => ({
    档案编号: item.archiveId,
    统计周期: getPeriodLabel(item.period),
    统计日期: item.statisticDate,
    部门: item.department || '全部',
    覆盖人数: item.coveragePeople,
    人员覆盖率: `${item.peopleRate}%`,
    检查记录仪台次: item.checkRecorderCount,
    投入使用台数: item.activeRecorderCount,
    记录仪数量: item.totalRecorders,
    记录仪检查率: `${item.recorderCheckRate}%`,
    检查覆盖时间: `${item.coverageTime}h`,
    时间覆盖率: `${item.timeRate}%`,
    问题数量: item.issueCount,
    违章数量: item.violationCount,
    隐患数量: item.hazardCount,
    考核次数: item.assessmentCount,
    备注: item.remark || ''
  }));

  exportToCSV(data, `报警档案_${formatDateTime().split(' ')[0]}.csv`, {
    档案编号: '档案编号',
    统计周期: '统计周期',
    统计日期: '统计日期',
    部门: '部门',
    覆盖人数: '覆盖人数',
    人员覆盖率: '人员覆盖率',
    检查记录仪台次: '检查记录仪台次',
    投入使用台数: '投入使用台数',
    记录仪数量: '记录仪数量',
    记录仪检查率: '记录仪检查率',
    检查覆盖时间: '检查覆盖时间',
    时间覆盖率: '时间覆盖率',
    问题数量: '问题数量',
    违章数量: '违章数量',
    隐患数量: '隐患数量',
    考核次数: '考核次数',
    备注: '备注'
  });

  proxy?.$modal.msgSuccess('导出成功');
};

// 从已归档违规自动生成档案
const handleAutoGenerate = () => {
  proxy?.$modal.confirm('是否根据监控预警模块的已归档违规数据自动生成今日统计档案？').then(() => {
    // 生成今日日期
    const today = new Date().toISOString().split('T')[0];

    // 检查是否已存在今日档案
    const existingArchive = archiveData.value.find((item) => item.statisticDate === today && item.period === 'daily');

    if (existingArchive) {
      proxy?.$modal.msgWarning('今日档案已存在，无需重复生成');
      return;
    }

    // 生成模拟违规数据并生成档案
    const allViolations = generateMockViolations();
    const newArchive = generateArchiveFromViolations(allViolations, today, 'daily');

    // 添加到档案列表
    archiveData.value.unshift(newArchive);

    proxy?.$modal.msgSuccess(
      `已自动生成今日档案（${today}），共归档 ${newArchive.issueCount + newArchive.violationCount + newArchive.hazardCount} 条违规记录`
    );
  });
};

// 手动新增
const handleAdd = () => {
  formDialog.title = '手动新增档案';
  formDialog.visible = true;
  formData.value = {
    period: 'daily',
    statisticDate: '',
    coveragePeople: 0,
    peopleRate: 0,
    checkRecorderCount: 0,
    activeRecorderCount: 0,
    totalRecorders: 0,
    recorderCheckRate: 0,
    coverageTime: 0,
    timeRate: 0,
    issueCount: 0,
    violationCount: 0,
    hazardCount: 0,
    assessmentCount: 0,
    remark: ''
  };
};

// 编辑
const handleEdit = (row: AlarmArchiveVO) => {
  formDialog.title = '编辑档案';
  formDialog.visible = true;
  formData.value = { ...row };
};

// 查看详情
const handleView = (row: AlarmArchiveVO) => {
  viewData.value = { ...row };
  viewDialog.visible = true;
};

// 删除
const handleDelete = (row: AlarmArchiveVO) => {
  proxy?.$modal.confirm('确认删除该档案吗？').then(() => {
    const index = archiveData.value.findIndex((item) => item.archiveId === row.archiveId);
    if (index !== -1) {
      archiveData.value.splice(index, 1);
      proxy?.$modal.msgSuccess('删除成功');
    }
  });
};

// 表单提交
const handleFormSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (formData.value.archiveId) {
        // 编辑
        const index = archiveData.value.findIndex((item) => item.archiveId === formData.value.archiveId);
        if (index !== -1) {
          archiveData.value[index] = {
            ...archiveData.value[index],
            ...formData.value,
            updateTime: formatDateTime()
          } as AlarmArchiveVO;
          proxy?.$modal.msgSuccess('修改成功');
        }
      } else {
        // 新增
        const newArchive: AlarmArchiveVO = {
          ...formData.value,
          archiveId: generateId('ARC'),
          createTime: formatDateTime(),
          updateTime: formatDateTime()
        } as AlarmArchiveVO;
        archiveData.value.unshift(newArchive);
        proxy?.$modal.msgSuccess('新增成功');
      }
      formDialog.visible = false;
    }
  });
};

// 表单关闭
const handleFormClose = () => {
  formRef.value?.resetFields();
};

// ==================== 生命周期 ====================

onMounted(() => {
  initData();
});
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.statistics-cards {
  margin-bottom: 20px;

  .stat-card {
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;

      .stat-icon {
        flex-shrink: 0;
      }

      .stat-text {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.search-card {
  margin-bottom: 20px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }

    .header-buttons {
      display: flex;
      gap: 10px;
    }
  }

  :deep(.el-table) {
    margin-bottom: 20px;
  }
}
</style>
