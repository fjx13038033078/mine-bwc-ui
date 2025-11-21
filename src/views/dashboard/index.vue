<template>
  <div class="p-2">
    <el-card shadow="hover" class="dashboard-header mb-4">
      <div class="header-content">
        <div class="header-left">
          <el-icon :size="48" color="#409EFF"><i-ep-data-analysis /></el-icon>
          <div class="header-text">
            <h2>铜矿AI安全监控数据看板</h2>
            <p>实时展示全矿安全生产数据和AI识别效果</p>
          </div>
        </div>
        <div class="header-right">
          <div class="time-info">
            <el-icon><i-ep-clock /></el-icon>
            <span>{{ currentTime }}</span>
          </div>
          <el-button type="primary" icon="Refresh" @click="refreshData">刷新数据</el-button>
        </div>
      </div>
    </el-card>

    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <el-icon :size="48" color="#409EFF"><i-ep-monitor /></el-icon>
            <div class="metric-data">
              <div class="metric-value">{{ stats.deviceCount }}</div>
              <div class="metric-label">设备总数</div>
              <div class="metric-sub">
                在线: <span class="success">{{ stats.onlineDeviceCount }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <el-icon :size="48" color="#67C23A"><i-ep-video-camera /></el-icon>
            <div class="metric-data">
              <div class="metric-value">{{ stats.totalVideoCount }}</div>
              <div class="metric-label">采集视频数</div>
              <div class="metric-sub">
                今日: <span class="primary">{{ stats.todayVideoCount || 0 }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <el-icon :size="48" color="#E6A23C"><i-ep-warning /></el-icon>
            <div class="metric-data">
              <div class="metric-value">{{ stats.totalViolationCount }}</div>
              <div class="metric-label">识别违规数</div>
              <div class="metric-sub">
                待处理: <span class="warning">{{ stats.pendingViolationCount }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <el-icon :size="48" color="#F56C6C"><i-ep-cpu /></el-icon>
            <div class="metric-data">
              <div class="metric-value">{{ stats.enabledSkillCount }}</div>
              <div class="metric-label">启用技能数</div>
              <div class="metric-sub">
                总数: <span class="info">{{ aiSkills.length }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 业务关联展示 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 设备与技能关联 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><i-ep-connection /></el-icon> 设备技能配置情况</span>
              <el-button text type="primary" @click="goToSkillConfig">查看详情</el-button>
            </div>
          </template>
          <el-table :data="deviceSkillStats" border max-height="300">
            <el-table-column label="技能名称" prop="skillName" min-width="150">
              <template #default="scope">
                <div class="skill-name-cell">
                  <el-icon :color="scope.row.color"><component :is="scope.row.icon" /></el-icon>
                  <span>{{ scope.row.skillName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="使用设备" prop="deviceCount" width="100" align="center">
              <template #default="scope">
                <el-tag type="warning" size="small">{{ scope.row.deviceCount }} 台</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="识别次数" prop="detectionCount" width="100" align="center" />
            <el-table-column label="违规数" prop="violationCount" width="100" align="center">
              <template #default="scope">
                <span :style="{ color: scope.row.violationCount > 0 ? '#F56C6C' : '#909399', fontWeight: 'bold' }">
                  {{ scope.row.violationCount }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 部门违规统计 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><i-ep-office-building /></el-icon> 部门违规统计</span>
              <el-button text type="primary" @click="goToViolationHandling">查看详情</el-button>
            </div>
          </template>
          <el-table :data="departmentViolationStats" border max-height="300">
            <el-table-column label="部门" prop="department" width="120" />
            <el-table-column label="设备数" prop="deviceCount" width="100" align="center" />
            <el-table-column label="视频数" prop="videoCount" width="100" align="center" />
            <el-table-column label="违规数" prop="violationCount" width="100" align="center">
              <template #default="scope">
                <span style="color: #F56C6C; font-weight: bold">{{ scope.row.violationCount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="违规率" prop="violationRate" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getViolationRateType(scope.row.violationRate)" size="small">
                  {{ (scope.row.violationRate * 100).toFixed(1) }}%
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 违规类型和处理情况 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 违规类型Top10 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><i-ep-data-line /></el-icon> 违规类型TOP10</span>
              <el-button text type="primary" @click="goToRegulations">查看规范</el-button>
            </div>
          </template>
          <el-table :data="topViolationTypes" border max-height="300">
            <el-table-column label="排名" type="index" width="60" align="center" />
            <el-table-column label="违规类型" prop="violationType" min-width="150" />
            <el-table-column label="发生次数" prop="count" width="100" align="center">
              <template #default="scope">
                <span style="color: #F56C6C; font-weight: bold">{{ scope.row.count }}</span>
              </template>
            </el-table-column>
            <el-table-column label="平均置信度" prop="avgConfidence" width="120" align="center">
              <template #default="scope">
                {{ (scope.row.avgConfidence * 100).toFixed(1) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 违规处理情况 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><i-ep-circle-check /></el-icon> 违规处理情况</span>
              <el-button text type="primary" @click="goToKnowledge">查看知识库</el-button>
            </div>
          </template>
          <div class="handling-stats">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="stat-item">
                  <div class="stat-label">已处理</div>
                  <div class="stat-value success">{{ handlingStats.handled }}</div>
                  <el-progress :percentage="handlingStats.handledRate" color="#67C23A" />
                </div>
              </el-col>
              <el-col :span="12">
                <div class="stat-item">
                  <div class="stat-label">待处理</div>
                  <div class="stat-value warning">{{ handlingStats.pending }}</div>
                  <el-progress :percentage="handlingStats.pendingRate" color="#E6A23C" />
                </div>
              </el-col>
            </el-row>
            <el-divider />
            <el-table :data="handlerStats" border size="small">
              <el-table-column label="处理人" prop="handler" width="100" />
              <el-table-column label="处理数量" prop="count" width="100" align="center" />
              <el-table-column label="平均用时" prop="avgTime" align="center" />
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时监控 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><i-ep-video-play /></el-icon> 最新违规识别</span>
              <el-button text type="primary" @click="goToVideoManagement">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentViolations" border>
            <el-table-column label="时间" prop="captureTime" width="160" />
            <el-table-column label="设备ID" prop="deviceId" width="120" />
            <el-table-column label="部门" prop="department" width="100" />
            <el-table-column label="责任人" prop="principal" width="100" />
            <el-table-column label="识别技能" prop="skillName" min-width="150">
              <template #default="scope">
                <el-tag size="small">{{ scope.row.skillName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="违规类型" prop="violationType" min-width="120" />
            <el-table-column label="严重程度" prop="severity" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getSeverityType(scope.row.severity)" size="small">
                  {{ getSeverityText(scope.row.severity) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="置信度" prop="confidence" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.confidence >= 0.9 ? 'success' : scope.row.confidence >= 0.8 ? 'warning' : 'info'" size="small">
                  {{ (scope.row.confidence * 100).toFixed(1) }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="handled" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.handled ? 'success' : 'warning'" size="small">
                  {{ scope.row.handled ? '已处理' : '待处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="100">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="handleViolation(scope.row)">
                  {{ scope.row.handled ? '查看' : '处理' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Dashboard" lang="ts">
import { useCopperMineStore } from '@/store/modules/copperMineData';
import { useRouter } from 'vue-router';

const store = useCopperMineStore();
const router = useRouter();

const currentTime = ref('');
const stats = computed(() => store.overallStats);
const aiSkills = computed(() => store.aiSkills);

// 设备技能统计
const deviceSkillStats = computed(() => {
  return store.enabledSkills.map(skill => ({
    skillId: skill.skillId,
    skillName: skill.skillName,
    icon: skill.icon,
    color: skill.color,
    deviceCount: skill.deviceUsageCount,
    detectionCount: skill.detectionCount,
    violationCount: skill.violationCount
  }));
});

// 部门违规统计
const departmentViolationStats = computed(() => {
  const departments = ['采矿部', '安全部', '技术部', '设备部', '机电部'];
  return departments.map(dept => {
    const deptDevices = store.devices.filter(d => d.department === dept);
    const deptVideos = store.videos.filter(v => {
      const device = store.getDeviceById(v.deviceId);
      return device && device.department === dept;
    });
    const deptViolations = store.violations.filter(v => {
      const video = store.videos.find(vid => vid.videoId === v.videoId);
      if (!video) return false;
      const device = store.getDeviceById(video.deviceId);
      return device && device.department === dept;
    });
    
    return {
      department: dept,
      deviceCount: deptDevices.length,
      videoCount: deptVideos.length,
      violationCount: deptViolations.length,
      violationRate: deptVideos.length > 0 ? deptViolations.length / deptVideos.length : 0
    };
  });
});

// 违规类型TOP10
const topViolationTypes = computed(() => {
  const typeMap: Record<string, { count: number; totalConfidence: number }> = {};
  
  store.violations.forEach(v => {
    if (!typeMap[v.violationType]) {
      typeMap[v.violationType] = { count: 0, totalConfidence: 0 };
    }
    typeMap[v.violationType].count++;
    typeMap[v.violationType].totalConfidence += v.confidence;
  });
  
  return Object.entries(typeMap)
    .map(([violationType, data]) => ({
      violationType,
      count: data.count,
      avgConfidence: data.totalConfidence / data.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
});

// 违规处理统计
const handlingStats = computed(() => {
  const handled = store.violations.filter(v => v.handled).length;
  const pending = store.violations.filter(v => !v.handled).length;
  const total = store.violations.length;
  
  return {
    handled,
    pending,
    total,
    handledRate: total > 0 ? (handled / total) * 100 : 0,
    pendingRate: total > 0 ? (pending / total) * 100 : 0
  };
});

// 处理人统计
const handlerStats = computed(() => {
  const handlerMap: Record<string, { count: number; totalTime: number }> = {};
  
  store.violations.filter(v => v.handled && v.handler).forEach(v => {
    if (!handlerMap[v.handler!]) {
      handlerMap[v.handler!] = { count: 0, totalTime: 0 };
    }
    handlerMap[v.handler!].count++;
    // 模拟处理用时
    handlerMap[v.handler!].totalTime += Math.floor(Math.random() * 120) + 30;
  });
  
  return Object.entries(handlerMap)
    .map(([handler, data]) => ({
      handler,
      count: data.count,
      avgTime: `${Math.floor(data.totalTime / data.count)}分钟`
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
});

// 最新违规
const recentViolations = computed(() => {
  return store.violations
    .slice()
    .sort((a, b) => {
      const videoA = store.videos.find(v => v.videoId === a.videoId);
      const videoB = store.videos.find(v => v.videoId === b.videoId);
      return (videoB?.captureTime || '').localeCompare(videoA?.captureTime || '');
    })
    .slice(0, 10)
    .map(v => {
      const video = store.videos.find(vid => vid.videoId === v.videoId);
      const device = video ? store.getDeviceById(video.deviceId) : null;
      return {
        ...v,
        captureTime: video?.captureTime || '',
        deviceId: video?.deviceId || '',
        department: device?.department || '',
        principal: device?.principal || ''
      };
    });
});

// 获取违规率类型
const getViolationRateType = (rate: number) => {
  if (rate < 0.1) return 'success';
  if (rate < 0.2) return 'warning';
  return 'danger';
};

// 获取严重程度类型
const getSeverityType = (severity: string) => {
  const map: Record<string, any> = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  };
  return map[severity] || 'info';
};

// 获取严重程度文本
const getSeverityText = (severity: string) => {
  const map: Record<string, string> = {
    low: '一般',
    medium: '较重',
    high: '严重',
    critical: '特别严重'
  };
  return map[severity] || severity;
};

// 更新当前时间
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// 刷新数据
const refreshData = () => {
  store.updateStatistics();
  ElMessage.success('数据已刷新');
};

// 处理违规
const handleViolation = (violation: any) => {
  router.push(`/equipment/video-management?violationId=${violation.resultId}`);
};

// 导航方法
const goToSkillConfig = () => router.push('/equipment/skill-config');
const goToViolationHandling = () => router.push('/library/violation-handling');
const goToRegulations = () => router.push('/library/safety-regulations');
const goToKnowledge = () => router.push('/library/violation-handling');
const goToVideoManagement = () => router.push('/equipment/video-management');

// 初始化
onMounted(() => {
  // 初始化Store数据
  if (store.devices.length === 0) {
    store.initializeData();
  }
  
  updateTime();
  setInterval(updateTime, 1000);
});
</script>

<style scoped lang="scss">
.dashboard-header {
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-text {
        h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #303133;
        }

        p {
          margin: 0;
          color: #909399;
          font-size: 14px;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .time-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

.metric-card {
  .metric-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .metric-data {
      flex: 1;

      .metric-value {
        font-size: 32px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 4px;
      }

      .metric-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .metric-sub {
        font-size: 13px;
        color: #606266;

        .success {
          color: #67C23A;
          font-weight: bold;
        }

        .primary {
          color: #409EFF;
          font-weight: bold;
        }

        .warning {
          color: #E6A23C;
          font-weight: bold;
        }

        .info {
          color: #909399;
        }
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;

  span {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.skill-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.handling-stats {
  .stat-item {
    text-align: center;
    padding: 16px;

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 12px;

      &.success {
        color: #67C23A;
      }

      &.warning {
        color: #E6A23C;
      }
    }
  }
}
</style>

