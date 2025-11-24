<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="违规类型" prop="violationType">
              <el-select v-model="queryParams.violationType" placeholder="请选择违规类型" clearable style="width: 180px">
                <el-option v-for="item in VIOLATION_TYPES" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="严重程度" prop="severity">
              <el-select v-model="queryParams.severity" placeholder="请选择严重程度" clearable style="width: 150px">
                <el-option v-for="item in VIOLATION_SEVERITY_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="处理状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
                <el-option label="待处理" value="pending" />
                <el-option label="处理中" value="processing" />
                <el-option label="已处理" value="handled" />
                <el-option label="已归档" value="archived" />
                <el-option label="误报" value="false_alarm" />
              </el-select>
            </el-form-item>
            <el-form-item label="所属部门" prop="department">
              <el-select v-model="queryParams.department" placeholder="请选择部门" clearable style="width: 150px">
                <el-option v-for="dept in DEPARTMENTS" :key="dept.value" :label="dept.label" :value="dept.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="识别时间" prop="dateRange">
              <el-date-picker
                v-model="queryParams.dateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 240px"
              />
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
            <el-button type="warning" plain icon="Bell" :disabled="multiple" @click="handleBatchReport">批量上报</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="CircleCheck" :disabled="multiple" @click="handleBatchHandle">批量处理</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="FolderOpened" :disabled="multiple" @click="handleBatchArchive">批量归档</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Download" @click="handleExport">导出报表</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="36" color="#F56C6C"><i-ep-warning /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ stats.pending }}</div>
                <div class="stat-label">待处理</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="36" color="#E6A23C"><i-ep-loading /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ stats.processing }}</div>
                <div class="stat-label">处理中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="36" color="#67C23A"><i-ep-circle-check /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ stats.handled }}</div>
                <div class="stat-label">已处理</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="36" color="#909399"><i-ep-folder-opened /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ stats.archived }}</div>
                <div class="stat-label">已归档</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="36" color="#409EFF"><i-ep-warning-filled /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ stats.falseAlarm }}</div>
                <div class="stat-label">误报</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon :size="36" color="#303133"><i-ep-data-analysis /></el-icon>
              <div class="stat-text">
                <div class="stat-value">{{ stats.total }}</div>
                <div class="stat-label">总计</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-table v-loading="loading" border :data="violationList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="违规截图" align="center" width="120">
          <template #default="scope">
            <div class="violation-thumbnail" @click="handleViewImage(scope.row)">
              <el-image
                :src="scope.row.snapshotUrl"
                fit="cover"
                style="width: 100px; height: 70px; border-radius: 4px; cursor: pointer"
                :preview-src-list="[scope.row.snapshotUrl]"
                preview-teleported
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><i-ep-picture /></el-icon>
                    <span>暂无截图</span>
                  </div>
                </template>
              </el-image>
              <div class="play-icon" v-if="scope.row.videoUrl" @click.stop="handlePlayVideo(scope.row)">
                <el-icon><i-ep-video-play /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="违规ID" align="center" prop="violationId" width="180" />
        <el-table-column label="识别时间" align="center" prop="captureTime" width="160">
          <template #default="scope">
            <el-icon><i-ep-clock /></el-icon>
            <span style="margin-left: 6px">{{ scope.row.captureTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="违规类型" align="center" prop="violationType" width="140">
          <template #default="scope">
            <el-tag :type="getViolationTypeColor(scope.row.violationType)" size="small">
              {{ scope.row.violationType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="严重程度" align="center" prop="severity" width="100">
          <template #default="scope">
            <el-tag :type="getSeverityType(scope.row.severity)" size="small">
              {{ getSeverityLabel(scope.row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="设备信息" align="left" min-width="160">
          <template #default="scope">
            <div class="device-info">
              <div>
                <el-icon><i-ep-monitor /></el-icon> {{ scope.row.deviceId }}
              </div>
              <div style="color: #909399; font-size: 12px">{{ scope.row.department }} / {{ scope.row.principal }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="违规描述" align="left" prop="description" :show-overflow-tooltip="true" min-width="180" />
        <el-table-column label="处理状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已上报" align="center" prop="reported" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.reported" type="warning" size="small">
              <el-icon><i-ep-bell /></el-icon>
            </el-tag>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="处理人" align="center" prop="handler" width="100">
          <template #default="scope">
            <span v-if="scope.row.handler">{{ scope.row.handler }}</span>
            <span v-else style="color: #909399">未分配</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="280" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="上报" placement="top" v-if="!scope.row.reported && scope.row.status !== 'false_alarm'">
              <el-button link type="warning" icon="Bell" @click="handleReport(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="处理" placement="top" v-if="['pending', 'processing'].includes(scope.row.status)">
              <el-button link type="success" icon="Edit" @click="handleProcess(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="归档" placement="top" v-if="scope.row.status === 'handled'">
              <el-button link type="info" icon="FolderOpened" @click="handleArchive(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="标记误报" placement="top" v-if="scope.row.status === 'pending'">
              <el-button link type="danger" icon="Close" @click="handleMarkFalseAlarm(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="播放视频" placement="top">
              <el-button link type="primary" icon="VideoPlay" @click="handlePlayVideo(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 违规详情对话框 -->
    <el-dialog v-model="viewDialog.visible" :title="`违规详情 - ${viewData.violationId}`" width="1200px" append-to-body>
      <!-- 违规视频/截图展示区 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="14">
          <el-card shadow="never" class="media-card">
            <template #header>
              <div class="card-header">
                <span
                  ><el-icon><i-ep-video-camera /></el-icon> 违规视频</span
                >
                <el-tag v-if="viewData.videoUrl" type="success" size="small">可播放</el-tag>
                <el-tag v-else type="info" size="small">仅截图</el-tag>
              </div>
            </template>
            <div class="media-container">
              <video
                v-if="viewData.videoUrl"
                :src="viewData.videoUrl"
                controls
                style="width: 100%; max-height: 400px; background: #000; border-radius: 4px"
              >
                您的浏览器不支持视频播放
              </video>
              <el-image
                v-else
                :src="viewData.snapshotUrl"
                fit="contain"
                style="width: 100%; max-height: 400px"
                :preview-src-list="[viewData.snapshotUrl]"
                preview-teleported
              >
                <template #error>
                  <div class="image-error-large">
                    <el-icon :size="60"><i-ep-picture /></el-icon>
                    <p>暂无图片</p>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="media-info">
              <el-tag size="small" type="danger">
                <el-icon><i-ep-warning /></el-icon>
                违规时刻: {{ viewData.violationTimestamp || '00:00:35' }}
              </el-tag>
              <el-tag size="small" type="info"> 识别置信度: {{ (viewData.confidence * 100).toFixed(1) }}% </el-tag>
            </div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="never" class="snapshot-card">
            <template #header>
              <span
                ><el-icon><i-ep-picture /></el-icon> 违规截图</span
              >
            </template>
            <el-image
              :src="viewData.snapshotUrl"
              fit="cover"
              style="width: 100%; height: 350px; border-radius: 4px"
              :preview-src-list="[viewData.snapshotUrl]"
              preview-teleported
            >
              <template #error>
                <div class="image-error-large">
                  <el-icon :size="50"><i-ep-picture /></el-icon>
                  <p>暂无截图</p>
                </div>
              </template>
            </el-image>
            <div class="snapshot-tip">
              <el-icon><i-ep-info-filled /></el-icon>
              点击图片可放大查看
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider content-position="left">基本信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="违规ID">{{ viewData.violationId }}</el-descriptions-item>
        <el-descriptions-item label="识别时间">{{ viewData.captureTime }}</el-descriptions-item>
        <el-descriptions-item label="违规类型">
          <el-tag :type="getViolationTypeColor(viewData.violationType)" size="small">
            {{ viewData.violationType }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="严重程度">
          <el-tag :type="getSeverityType(viewData.severity)" size="small">
            {{ getSeverityLabel(viewData.severity) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备ID">{{ viewData.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="视频ID">
          <el-link type="primary" @click="handlePlayVideo(viewData)">{{ viewData.videoId }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ viewData.department }}</el-descriptions-item>
        <el-descriptions-item label="责任人">{{ viewData.principal }}</el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="getStatusType(viewData.status)" size="small">
            {{ getStatusLabel(viewData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否上报">
          <el-tag v-if="viewData.reported" type="warning" size="small">已上报</el-tag>
          <el-tag v-else type="info" size="small">未上报</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ viewData.handler || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ viewData.handleTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="违规描述" :span="2">{{ viewData.description }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">关联规范</el-divider>
      <el-card v-if="viewData.matchedRegulation" shadow="never" class="info-card">
        <div><strong>规范类型：</strong>{{ viewData.matchedRegulation.workType }}</div>
        <div><strong>违规行为：</strong>{{ viewData.matchedRegulation.violation }}</div>
        <div><strong>规范要求：</strong>{{ viewData.matchedRegulation.standard }}</div>
      </el-card>
      <el-empty v-else description="暂无关联规范" :image-size="80" />

      <el-divider content-position="left">处理建议</el-divider>
      <el-card v-if="viewData.handlingSuggestion" shadow="never" class="info-card">
        <div><strong>处理措施：</strong>{{ viewData.handlingSuggestion.measure }}</div>
        <div><strong>处罚依据：</strong>{{ viewData.handlingSuggestion.basis }}</div>
        <div><strong>预防措施：</strong>{{ viewData.handlingSuggestion.prevention }}</div>
      </el-card>
      <el-empty v-else description="暂无处理建议" :image-size="80" />

      <el-divider content-position="left">处理记录</el-divider>
      <el-timeline v-if="viewData.handleRecords && viewData.handleRecords.length > 0">
        <el-timeline-item
          v-for="(record, index) in viewData.handleRecords"
          :key="index"
          :timestamp="record.time"
          :type="getRecordType(record.action)"
          placement="top"
        >
          <el-card shadow="never">
            <h4>{{ record.action }}</h4>
            <p>操作人：{{ record.operator }}</p>
            <p v-if="record.remark">备注：{{ record.remark }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无处理记录" :image-size="80" />

      <template #footer>
        <div class="dialog-footer">
          <el-button type="warning" icon="Bell" @click="handleReportFromView" v-if="!viewData.reported && viewData.status !== 'false_alarm'"
            >上报</el-button
          >
          <el-button type="success" icon="Edit" @click="handleProcessFromView" v-if="['pending', 'processing'].includes(viewData.status)"
            >处理</el-button
          >
          <el-button type="info" icon="FolderOpened" @click="handleArchiveFromView" v-if="viewData.status === 'handled'">归档</el-button>
          <el-button @click="viewDialog.visible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 处理对话框 -->
    <el-dialog v-model="processDialog.visible" title="违规处理" width="700px" append-to-body @close="closeProcessDialog">
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="100px">
        <el-form-item label="违规ID">
          <el-input v-model="processForm.violationId" disabled />
        </el-form-item>
        <el-form-item label="处理状态" prop="status">
          <el-radio-group v-model="processForm.status">
            <el-radio label="processing">处理中</el-radio>
            <el-radio label="handled">已处理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理人" prop="handler">
          <el-input v-model="processForm.handler" placeholder="请输入处理人姓名" />
        </el-form-item>
        <el-form-item label="处理措施" prop="measure">
          <el-input v-model="processForm.measure" type="textarea" :rows="4" placeholder="请详细描述采取的处理措施" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="处理结果" prop="result">
          <el-input v-model="processForm.result" type="textarea" :rows="3" placeholder="请描述处理结果" maxlength="300" show-word-limit />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="processForm.remark" type="textarea" :rows="2" placeholder="其他需要说明的内容" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitProcess">提交处理</el-button>
          <el-button @click="processDialog.visible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 上报对话框 -->
    <el-dialog v-model="reportDialog.visible" title="违规上报" width="600px" append-to-body @close="closeReportDialog">
      <el-form ref="reportFormRef" :model="reportForm" :rules="reportRules" label-width="100px">
        <el-form-item label="上报部门" prop="department">
          <el-select v-model="reportForm.department" placeholder="请选择上报部门" style="width: 100%">
            <el-option label="安全管理部" value="安全管理部" />
            <el-option label="生产调度部" value="生产调度部" />
            <el-option label="矿区管理处" value="矿区管理处" />
            <el-option label="公司领导层" value="公司领导层" />
          </el-select>
        </el-form-item>
        <el-form-item label="上报等级" prop="level">
          <el-radio-group v-model="reportForm.level">
            <el-radio label="normal">一般上报</el-radio>
            <el-radio label="urgent">紧急上报</el-radio>
            <el-radio label="critical">重大隐患</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上报说明" prop="description">
          <el-input v-model="reportForm.description" type="textarea" :rows="4" placeholder="请说明上报原因和情况" maxlength="300" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="warning" @click="submitReport">确认上报</el-button>
          <el-button @click="reportDialog.visible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 视频播放对话框 -->
    <el-dialog v-model="videoDialog.visible" title="视频回放" width="900px" append-to-body>
      <div class="video-container">
        <video
          ref="videoPlayerRef"
          :src="currentVideoUrl"
          controls
          style="width: 100%; max-height: 500px; background: #000"
          @error="handleVideoError"
        >
          您的浏览器不支持视频播放
        </video>
      </div>
      <el-descriptions :column="2" border style="margin-top: 16px">
        <el-descriptions-item label="视频ID">{{ currentVideoInfo.videoId }}</el-descriptions-item>
        <el-descriptions-item label="采集时间">{{ currentVideoInfo.captureTime }}</el-descriptions-item>
        <el-descriptions-item label="设备ID">{{ currentVideoInfo.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="时长">{{ currentVideoInfo.duration }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="videoDialog.visible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ViolationMonitor" lang="ts">
import { DEPARTMENTS, VIOLATION_TYPES, VIOLATION_SEVERITY_OPTIONS } from '@/utils/copper-mine-constants';
import { formatDateTime, exportToCSV } from '@/utils/copper-mine-utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();

// 违规监控数据接口
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
  handleRecords?: HandleRecord[];
  matchedRegulation?: {
    workType: string;
    violation: string;
    standard: string;
  };
  handlingSuggestion?: {
    measure: string;
    basis: string;
    prevention: string;
  };
  snapshotUrl?: string; // 违规截图URL
  videoUrl?: string; // 违规视频URL
  violationTimestamp?: string; // 违规时刻（视频时间点）
  confidence?: number; // AI识别置信度
}

interface HandleRecord {
  time: string;
  operator: string;
  action: string;
  remark?: string;
}

interface ViolationQuery {
  pageNum: number;
  pageSize: number;
  violationType?: string;
  severity?: string;
  status?: string;
  department?: string;
  dateRange?: string[];
}

interface ProcessForm {
  violationId: string;
  status: string;
  handler: string;
  measure: string;
  result: string;
  remark: string;
}

interface ReportForm {
  department: string;
  level: string;
  description: string;
}

// 模拟违规数据（实际应从视频管理模块的AI检测结果获取）
const generateViolationData = (): ViolationVO[] => {
  const violations: ViolationVO[] = [];
  const violationTypes = ['未佩戴安全帽', '未系安全带', '违规操作设备', '气瓶平放', '气瓶混放', '无证上岗', '吊装违规', '动火违规'];
  const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
  const statuses: ('pending' | 'processing' | 'handled' | 'archived' | 'false_alarm')[] = [
    'pending',
    'processing',
    'handled',
    'archived',
    'false_alarm'
  ];
  const depts = ['采矿部', '安全部', '技术部', '设备部', '后勤部'];
  const principals = ['张三', '李四', '王五', '赵六', '孙七'];

  // 模拟截图URL（实际项目中应该是真实的图片或视频地址）
  const snapshotUrls = [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2',
    'https://picsum.photos/400/300?random=3',
    'https://picsum.photos/400/300?random=4',
    'https://picsum.photos/400/300?random=5'
  ];

  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const captureTime = formatDateTime(date);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const violationType = violationTypes[Math.floor(Math.random() * violationTypes.length)];
    const hasVideo = Math.random() > 0.3; // 70%的记录有视频

    const violation: ViolationVO = {
      violationId: `VIO${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${i.toString().padStart(4, '0')}`,
      videoId: `VID${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${i.toString().padStart(3, '0')}`,
      deviceId: `DEV202411${((i % 10) + 1).toString().padStart(3, '0')}`,
      captureTime,
      violationType,
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `检测到${violationType}，位置：井下作业区${Math.floor(Math.random() * 10 + 1)}号工作面，需立即处理。`,
      department: depts[Math.floor(Math.random() * depts.length)],
      principal: principals[Math.floor(Math.random() * principals.length)],
      status,
      reported: Math.random() > 0.5,
      handler: status !== 'pending' ? principals[Math.floor(Math.random() * principals.length)] : undefined,
      handleTime: status !== 'pending' ? formatDateTime(new Date(date.getTime() + 3600000)) : undefined,
      snapshotUrl: snapshotUrls[i % snapshotUrls.length],
      videoUrl: hasVideo ? '/src/assets/video/202111230846.mov' : undefined,
      violationTimestamp: `00:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      confidence: 0.75 + Math.random() * 0.24, // 75%-99%置信度
      matchedRegulation: {
        workType: violationType.includes('气瓶') ? '焊割作业' : violationType.includes('吊装') ? '吊装作业' : '一般作业',
        violation: violationType,
        standard: `按照《铜矿安全作业规范》要求，${violationType}属于严重违规行为`
      },
      handlingSuggestion: {
        measure: `立即停止作业，要求作业人员整改；对责任人进行安全教育；加强现场监督检查`,
        basis: `《铜矿安全管理条例》第${Math.floor(Math.random() * 50 + 10)}条`,
        prevention: '定期开展安全培训；加强现场巡检；建立责任追究机制'
      },
      handleRecords:
        status !== 'pending'
          ? [
              {
                time: captureTime,
                operator: 'AI识别系统',
                action: '自动识别违规',
                remark: `AI置信度: ${(0.85 + Math.random() * 0.15).toFixed(2)}`
              },
              ...(status === 'processing' || status === 'handled' || status === 'archived'
                ? [
                    {
                      time: formatDateTime(new Date(date.getTime() + 1800000)),
                      operator: principals[Math.floor(Math.random() * principals.length)],
                      action: '开始处理',
                      remark: '已通知现场负责人'
                    }
                  ]
                : []),
              ...(status === 'handled' || status === 'archived'
                ? [
                    {
                      time: formatDateTime(new Date(date.getTime() + 3600000)),
                      operator: principals[Math.floor(Math.random() * principals.length)],
                      action: '处理完成',
                      remark: '违规行为已整改，责任人已接受教育'
                    }
                  ]
                : []),
              ...(status === 'archived'
                ? [
                    {
                      time: formatDateTime(new Date(date.getTime() + 7200000)),
                      operator: '系统管理员',
                      action: '归档',
                      remark: '记录已归档'
                    }
                  ]
                : [])
            ]
          : []
    };

    violations.push(violation);
  }

  return violations.sort((a, b) => new Date(b.captureTime).getTime() - new Date(a.captureTime).getTime());
};

const violationList = ref<ViolationVO[]>([]);
const allViolations = ref<ViolationVO[]>(generateViolationData());
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string>>([]);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const processFormRef = ref<ElFormInstance>();
const reportFormRef = ref<ElFormInstance>();
const videoPlayerRef = ref<HTMLVideoElement>();

const viewDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const processDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const reportDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const videoDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initProcessForm: ProcessForm = {
  violationId: '',
  status: 'processing',
  handler: '',
  measure: '',
  result: '',
  remark: ''
};

const initReportForm: ReportForm = {
  department: '',
  level: 'normal',
  description: ''
};

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    violationType: '',
    severity: '',
    status: '',
    department: '',
    dateRange: []
  } as ViolationQuery,
  viewData: {} as ViolationVO,
  processForm: { ...initProcessForm },
  processRules: {
    status: [{ required: true, message: '请选择处理状态', trigger: 'change' }],
    handler: [{ required: true, message: '请输入处理人', trigger: 'blur' }],
    measure: [{ required: true, message: '请输入处理措施', trigger: 'blur' }],
    result: [{ required: true, message: '请输入处理结果', trigger: 'blur' }]
  },
  reportForm: { ...initReportForm },
  reportRules: {
    department: [{ required: true, message: '请选择上报部门', trigger: 'change' }],
    level: [{ required: true, message: '请选择上报等级', trigger: 'change' }],
    description: [{ required: true, message: '请输入上报说明', trigger: 'blur' }]
  },
  currentVideoUrl: '',
  currentVideoInfo: {
    videoId: '',
    captureTime: '',
    deviceId: '',
    duration: ''
  }
});

const { queryParams, viewData, processForm, processRules, reportForm, reportRules, currentVideoUrl, currentVideoInfo } = toRefs(data);

// 统计数据
const stats = computed(() => {
  return {
    pending: allViolations.value.filter((v) => v.status === 'pending').length,
    processing: allViolations.value.filter((v) => v.status === 'processing').length,
    handled: allViolations.value.filter((v) => v.status === 'handled').length,
    archived: allViolations.value.filter((v) => v.status === 'archived').length,
    falseAlarm: allViolations.value.filter((v) => v.status === 'false_alarm').length,
    total: allViolations.value.length
  };
});

/** 获取违规类型颜色 */
const getViolationTypeColor = (type: string) => {
  const colorMap = {
    '未佩戴安全帽': 'danger',
    '未系安全带': 'danger',
    '违规操作设备': 'warning',
    '气瓶平放': 'danger',
    '气瓶混放': 'danger',
    '无证上岗': 'danger',
    '吊装违规': 'warning',
    '动火违规': 'danger'
  } as const;
  return colorMap[type as keyof typeof colorMap] || 'info';
};

/** 获取严重程度类型 */
const getSeverityType = (severity: string) => {
  const typeMap = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  } as const;
  return typeMap[severity as keyof typeof typeMap] || 'info';
};

/** 获取严重程度标签 */
const getSeverityLabel = (severity: string) => {
  const labelMap = {
    low: '轻微',
    medium: '一般',
    high: '严重',
    critical: '重大'
  };
  return labelMap[severity as keyof typeof labelMap] || severity;
};

/** 获取状态类型 */
const getStatusType = (status: string) => {
  const typeMap = {
    pending: 'danger',
    processing: 'warning',
    handled: 'success',
    archived: 'info',
    false_alarm: 'info'
  } as const;
  return typeMap[status as keyof typeof typeMap] || 'info';
};

/** 获取状态标签 */
const getStatusLabel = (status: string) => {
  const labelMap = {
    pending: '待处理',
    processing: '处理中',
    handled: '已处理',
    archived: '已归档',
    false_alarm: '误报'
  };
  return labelMap[status as keyof typeof labelMap] || status;
};

/** 获取记录类型 */
const getRecordType = (action: string) => {
  if (action.includes('识别') || action.includes('检测')) return 'primary';
  if (action.includes('处理')) return 'success';
  if (action.includes('上报')) return 'warning';
  if (action.includes('归档')) return 'info';
  return 'primary';
};

/** 查询违规列表 */
const getList = () => {
  loading.value = true;

  setTimeout(() => {
    let filteredData = [...allViolations.value];

    // 按条件筛选
    if (queryParams.value.violationType) {
      filteredData = filteredData.filter((v) => v.violationType === queryParams.value.violationType);
    }
    if (queryParams.value.severity) {
      filteredData = filteredData.filter((v) => v.severity === queryParams.value.severity);
    }
    if (queryParams.value.status) {
      filteredData = filteredData.filter((v) => v.status === queryParams.value.status);
    }
    if (queryParams.value.department) {
      filteredData = filteredData.filter((v) => v.department === queryParams.value.department);
    }
    if (queryParams.value.dateRange && queryParams.value.dateRange.length === 2) {
      const [start, end] = queryParams.value.dateRange;
      filteredData = filteredData.filter((v) => {
        const captureDate = v.captureTime.split(' ')[0];
        return captureDate >= start && captureDate <= end;
      });
    }

    total.value = filteredData.length;

    // 分页
    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
    const end = start + queryParams.value.pageSize;
    violationList.value = filteredData.slice(start, end);

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
const handleView = (row: ViolationVO) => {
  viewData.value = { ...row };
  viewDialog.visible = true;
};

/** 处理违规 */
const handleProcess = (row: ViolationVO) => {
  processForm.value = {
    ...initProcessForm,
    violationId: row.violationId
  };
  processDialog.visible = true;
};

/** 从详情处理 */
const handleProcessFromView = () => {
  viewDialog.visible = false;
  handleProcess(viewData.value);
};

/** 提交处理 */
const submitProcess = () => {
  processFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      const index = allViolations.value.findIndex((v) => v.violationId === processForm.value.violationId);
      if (index !== -1) {
        allViolations.value[index].status = processForm.value.status as any;
        allViolations.value[index].handler = processForm.value.handler;
        allViolations.value[index].handleTime = formatDateTime();

        // 添加处理记录
        if (!allViolations.value[index].handleRecords) {
          allViolations.value[index].handleRecords = [];
        }
        allViolations.value[index].handleRecords!.push({
          time: formatDateTime(),
          operator: processForm.value.handler,
          action: processForm.value.status === 'handled' ? '处理完成' : '开始处理',
          remark: `措施：${processForm.value.measure}；结果：${processForm.value.result}`
        });
      }

      proxy?.$modal.msgSuccess('处理成功');
      processDialog.visible = false;
      getList();
    }
  });
};

/** 上报违规 */
const handleReport = (row: ViolationVO) => {
  reportForm.value = { ...initReportForm };
  ids.value = [row.violationId];
  reportDialog.visible = true;
};

/** 从详情上报 */
const handleReportFromView = () => {
  viewDialog.visible = false;
  handleReport(viewData.value);
};

/** 提交上报 */
const submitReport = () => {
  reportFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      ids.value.forEach((id) => {
        const index = allViolations.value.findIndex((v) => v.violationId === id);
        if (index !== -1) {
          allViolations.value[index].reported = true;

          // 添加上报记录
          if (!allViolations.value[index].handleRecords) {
            allViolations.value[index].handleRecords = [];
          }
          allViolations.value[index].handleRecords!.push({
            time: formatDateTime(),
            operator: '当前用户',
            action: `上报至${reportForm.value.department}`,
            remark: `等级：${reportForm.value.level}；说明：${reportForm.value.description}`
          });
        }
      });

      proxy?.$modal.msgSuccess(`已上报${ids.value.length}条违规记录`);
      reportDialog.visible = false;
      getList();
    }
  });
};

/** 归档违规 */
const handleArchive = (row: ViolationVO) => {
  proxy?.$modal
    .confirm(`确认归档违规记录"${row.violationId}"吗？`)
    .then(() => {
      const index = allViolations.value.findIndex((v) => v.violationId === row.violationId);
      if (index !== -1) {
        allViolations.value[index].status = 'archived';

        // 添加归档记录
        if (!allViolations.value[index].handleRecords) {
          allViolations.value[index].handleRecords = [];
        }
        allViolations.value[index].handleRecords!.push({
          time: formatDateTime(),
          operator: '当前用户',
          action: '归档',
          remark: '违规处理完成，记录已归档'
        });
      }

      proxy?.$modal.msgSuccess('归档成功');
      getList();
    })
    .catch(() => {});
};

/** 从详情归档 */
const handleArchiveFromView = () => {
  viewDialog.visible = false;
  handleArchive(viewData.value);
};

/** 标记误报 */
const handleMarkFalseAlarm = (row: ViolationVO) => {
  proxy?.$modal
    .confirm(`确认标记"${row.violationId}"为误报吗？`)
    .then(() => {
      const index = allViolations.value.findIndex((v) => v.violationId === row.violationId);
      if (index !== -1) {
        allViolations.value[index].status = 'false_alarm';

        // 添加误报记录
        if (!allViolations.value[index].handleRecords) {
          allViolations.value[index].handleRecords = [];
        }
        allViolations.value[index].handleRecords!.push({
          time: formatDateTime(),
          operator: '当前用户',
          action: '标记误报',
          remark: '经核实，AI识别错误，标记为误报'
        });
      }

      proxy?.$modal.msgSuccess('已标记为误报');
      getList();
    })
    .catch(() => {});
};

/** 批量上报 */
const handleBatchReport = () => {
  reportForm.value = { ...initReportForm };
  reportDialog.visible = true;
};

/** 批量处理 */
const handleBatchHandle = () => {
  if (ids.value.length === 0) {
    proxy?.$modal.msgWarning('请选择要处理的违规记录');
    return;
  }

  proxy?.$modal
    .confirm(`确认批量处理选中的${ids.value.length}条违规记录吗？`)
    .then(() => {
      ids.value.forEach((id) => {
        const index = allViolations.value.findIndex((v) => v.violationId === id);
        if (index !== -1 && ['pending', 'processing'].includes(allViolations.value[index].status)) {
          allViolations.value[index].status = 'handled';
          allViolations.value[index].handler = '批量处理';
          allViolations.value[index].handleTime = formatDateTime();

          if (!allViolations.value[index].handleRecords) {
            allViolations.value[index].handleRecords = [];
          }
          allViolations.value[index].handleRecords!.push({
            time: formatDateTime(),
            operator: '当前用户',
            action: '批量处理',
            remark: '批量处理完成'
          });
        }
      });

      proxy?.$modal.msgSuccess('批量处理成功');
      getList();
    })
    .catch(() => {});
};

/** 批量归档 */
const handleBatchArchive = () => {
  if (ids.value.length === 0) {
    proxy?.$modal.msgWarning('请选择要归档的违规记录');
    return;
  }

  const canArchive = ids.value.every((id) => {
    const violation = allViolations.value.find((v) => v.violationId === id);
    return violation && violation.status === 'handled';
  });

  if (!canArchive) {
    proxy?.$modal.msgWarning('只能归档已处理的违规记录');
    return;
  }

  proxy?.$modal
    .confirm(`确认批量归档选中的${ids.value.length}条违规记录吗？`)
    .then(() => {
      ids.value.forEach((id) => {
        const index = allViolations.value.findIndex((v) => v.violationId === id);
        if (index !== -1) {
          allViolations.value[index].status = 'archived';

          if (!allViolations.value[index].handleRecords) {
            allViolations.value[index].handleRecords = [];
          }
          allViolations.value[index].handleRecords!.push({
            time: formatDateTime(),
            operator: '当前用户',
            action: '批量归档',
            remark: '批量归档完成'
          });
        }
      });

      proxy?.$modal.msgSuccess('批量归档成功');
      getList();
    })
    .catch(() => {});
};

/** 查看图片（点击缩略图） */
const handleViewImage = (row: ViolationVO) => {
  // Element Plus的el-image组件会自动处理预览
  // 这里可以添加额外的逻辑，比如埋点统计
  console.log('查看违规截图:', row.violationId);
};

/** 播放视频 */
const handlePlayVideo = (row: ViolationVO) => {
  if (row.videoUrl) {
    currentVideoUrl.value = row.videoUrl;
    currentVideoInfo.value = {
      videoId: row.videoId,
      captureTime: row.captureTime,
      deviceId: row.deviceId,
      duration: '00:02:35'
    };
    videoDialog.visible = true;
  } else {
    proxy?.$modal.msgWarning('该违规记录暂无视频');
  }
};

/** 视频加载错误 */
const handleVideoError = () => {
  proxy?.$modal.msgError('视频加载失败');
};

/** 导出报表 */
const handleExport = () => {
  const exportData = allViolations.value.map((v) => ({
    违规ID: v.violationId,
    识别时间: v.captureTime,
    违规类型: v.violationType,
    严重程度: getSeverityLabel(v.severity),
    设备ID: v.deviceId,
    所属部门: v.department,
    责任人: v.principal,
    违规描述: v.description,
    处理状态: getStatusLabel(v.status),
    是否上报: v.reported ? '是' : '否',
    处理人: v.handler || '未分配',
    处理时间: v.handleTime || '-'
  }));

  exportToCSV(exportData, `违规监控报表_${formatDateTime(new Date(), 'date')}.csv`);
  proxy?.$modal.msgSuccess('导出成功');
};

/** 选择条数 */
const handleSelectionChange = (selection: ViolationVO[]) => {
  ids.value = selection.map((item) => item.violationId);
  multiple.value = !selection.length;
};

/** 关闭处理对话框 */
const closeProcessDialog = () => {
  processForm.value = { ...initProcessForm };
  processFormRef.value?.resetFields();
};

/** 关闭上报对话框 */
const closeReportDialog = () => {
  reportForm.value = { ...initReportForm };
  reportFormRef.value?.resetFields();
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

.device-info {
  line-height: 1.6;
}

.info-card {
  background-color: #f5f7fa;
  margin-bottom: 16px;

  div {
    margin-bottom: 8px;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.violation-thumbnail {
  position: relative;
  display: inline-block;

  .play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: translate(-50%, -50%) scale(1.1);
    }

    .el-icon {
      color: #fff;
      font-size: 20px;
    }
  }
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70px;
  background: #f5f7fa;
  color: #909399;

  .el-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  span {
    font-size: 12px;
  }
}

.image-error-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f7fa;
  color: #909399;

  p {
    margin-top: 10px;
    font-size: 14px;
  }
}

.media-card {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    span {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }
  }

  .media-container {
    margin-bottom: 12px;
  }

  .media-info {
    display: flex;
    gap: 12px;
    margin-top: 12px;
  }
}

.snapshot-card {
  height: 100%;

  .snapshot-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding: 8px;
    background: #f0f9ff;
    border-radius: 4px;
    color: #409eff;
    font-size: 12px;
  }
}
</style>
