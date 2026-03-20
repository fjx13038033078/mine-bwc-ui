<template>
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <span class="header-dot"></span>
        <span class="header-sub">VIDEO AI DETECTION SYSTEM</span>
      </div>
      <h1 class="header-title">执法视频 AI 智能检测数据大屏</h1>
      <div class="header-right">
        <span class="header-time">{{ currentTime }}</span>
        <span class="header-dot"></span>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="stat-row">
      <div v-for="item in statCards" :key="item.label" class="stat-card">
        <div class="stat-icon" :style="{ background: item.gradient }">
          <el-icon :size="24"><component :is="item.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value" :style="{ color: item.color }">{{ animatedValues[item.key] ?? item.value }}</span>
          <span class="stat-label">{{ item.label }}</span>
        </div>
        <div class="stat-trend" v-if="item.trend">
          <span :class="['trend-tag', item.trendUp ? 'up' : 'down']"> {{ item.trendUp ? '&#9650;' : '&#9660;' }} {{ item.trend }} </span>
          <span class="trend-hint">较昨日</span>
        </div>
      </div>
    </div>

    <!-- 主内容区：左列（违规视频 + 检测记录）与右列（图表 + 系统状态）等高对齐 -->
    <div class="middle-section">
      <div class="middle-col middle-col--left">
        <!-- 最近违规视频 -->
        <div class="video-grid-panel">
          <div class="card-header">
            <span class="card-dot pulse"></span>
            <span class="card-title">最近违规视频</span>
            <span class="card-badge">循环播放</span>
          </div>
          <div class="video-grid">
            <div v-for="(item, idx) in recentViolationVideos" :key="item.videoId" class="video-cell">
              <video
                :ref="(el) => setVideoRef(el, idx)"
                class="violation-video"
                muted
                loop
                playsinline
                :src="item.playUrl"
                @loadedmetadata="onVideoLoaded($event, idx)"
                @timeupdate="onVideoTimeUpdate($event, idx)"
              />
              <div class="video-overlay">
                <span class="video-type">{{ item.violationType || '违规' }}</span>
                <span class="video-time">{{ formatViolationTime(item) }}</span>
              </div>
            </div>
            <div v-if="recentViolationVideos.length === 0" class="video-empty">暂无违规视频</div>
          </div>
        </div>

        <!-- 最新检测记录（与上方视频同宽、同列对齐） -->
        <div class="chart-card record-panel">
          <div class="card-header">
            <span class="card-dot pulse"></span>
            <span class="card-title">最新检测记录</span>
            <span class="card-badge">实时</span>
          </div>
          <div class="record-list">
            <div v-for="(record, index) in recentRecords" :key="index" class="record-item">
              <span class="record-time">{{ record.time }}</span>
              <span :class="['record-status', statusClass(record.status)]">{{ record.statusText }}</span>
              <span class="record-name" :title="record.fileName">{{ record.fileName }}</span>
              <span class="record-user">{{ record.userName }}</span>
              <span :class="['record-result', resultClass(record)]">{{ record.resultText }}</span>
            </div>
            <div v-if="recentRecords.length === 0" class="record-empty">暂无检测记录</div>
          </div>
        </div>
      </div>

      <div class="middle-col middle-col--right">
        <!-- 统计图表 -->
        <div class="charts-panel">
          <div class="chart-card">
            <div class="card-header">
              <span class="card-dot"></span>
              <span class="card-title">检测趋势（近7天）</span>
            </div>
            <div ref="trendChartRef" class="chart-body"></div>
          </div>
          <div class="chart-card">
            <div class="card-header">
              <span class="card-dot"></span>
              <span class="card-title">违规类型分布</span>
            </div>
            <div ref="pieChartRef" class="chart-body"></div>
          </div>
          <div class="chart-card">
            <div class="card-header">
              <span class="card-dot"></span>
              <span class="card-title">部门检测统计</span>
            </div>
            <div ref="barChartRef" class="chart-body"></div>
          </div>
        </div>

        <!-- 系统状态 -->
        <div class="chart-card system-panel">
          <div class="card-header">
            <span class="card-dot"></span>
            <span class="card-title">系统运行状态</span>
          </div>
          <div class="system-status">
            <div v-for="item in systemStatus" :key="item.label" class="status-item">
              <div class="status-label">{{ item.label }}</div>
              <div class="status-bar-wrap">
                <div class="status-bar" :style="{ width: item.percent + '%', background: item.barColor }"></div>
              </div>
              <div class="status-value" :style="{ color: item.valueColor }">{{ item.display }}</div>
            </div>
            <div class="status-footer">
              <div v-for="svc in serviceStatus" :key="svc.name" class="svc-item">
                <span :class="['svc-dot', svc.ok ? 'online' : 'offline']"></span>
                <span class="svc-name">{{ svc.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Index">
import { ref, onMounted, onUnmounted, onActivated, nextTick, markRaw, shallowRef } from 'vue';
import * as echarts from 'echarts';
import { VideoCamera, DataAnalysis, Warning, CircleCheck, Timer, Document } from '@element-plus/icons-vue';
import { getDashboardStats, type DashboardStatsVO, type RecordItem, type ViolationVideoItem } from '@/api/camera/dashboard';

// ======================== 时钟 ========================
const currentTime = ref('');
let clockTimer: ReturnType<typeof setInterval>;

function updateClock() {
  const now = new Date();
  currentTime.value =
    now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
    '  ' +
    now.toLocaleTimeString('zh-CN', { hour12: false });
}

// ======================== 指标数据 ========================
interface StatCard {
  key: string;
  label: string;
  value: number | string;
  icon: any;
  color: string;
  gradient: string;
  trend?: string;
  trendUp?: boolean;
}

const statCards = ref<StatCard[]>([
  { key: 'total', label: '视频总量', value: 0, icon: markRaw(VideoCamera), color: '#00d4ff', gradient: 'linear-gradient(135deg,#0a3d6b,#00d4ff33)' },
  {
    key: 'checked',
    label: '已检测数',
    value: 0,
    icon: markRaw(CircleCheck),
    color: '#00e396',
    gradient: 'linear-gradient(135deg,#0a4d3b,#00e39633)'
  },
  { key: 'violation', label: '违规视频', value: 0, icon: markRaw(Warning), color: '#ff4560', gradient: 'linear-gradient(135deg,#4d1a2a,#ff456033)' },
  {
    key: 'rate',
    label: '检测通过率',
    value: '--',
    icon: markRaw(DataAnalysis),
    color: '#feb019',
    gradient: 'linear-gradient(135deg,#4d3a0a,#feb01933)'
  },
  { key: 'today', label: '今日新增', value: 0, icon: markRaw(Document), color: '#775dd0', gradient: 'linear-gradient(135deg,#2a1f4d,#775dd033)' },
  {
    key: 'avgTime',
    label: '平均处理时长',
    value: '--',
    icon: markRaw(Timer),
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg,#0a3d6b,#00d4ff33)'
  }
]);

const animatedValues = ref<Record<string, string | number>>({});
const recentRecords = ref<RecordItem[]>([]);
const recentViolationVideos = ref<ViolationVideoItem[]>([]);
const videoRefs = ref<(HTMLVideoElement | null)[]>([]);

// 服务端返回的图表原始数据
let serverData: DashboardStatsVO | null = null;

function statusClass(status: number) {
  if (status === 2) return 'done';
  if (status === 1) return 'running';
  if (status === 3) return 'fail';
  return 'pending';
}

function resultClass(record: RecordItem) {
  if (record.status === 2) return record.hasViolation === 1 ? 'danger' : 'safe';
  if (record.status === 1) return 'pending';
  if (record.status === 3) return 'danger';
  return 'pending';
}

// 违规视频四宫格：格式化起止时间
function formatViolationTime(item: ViolationVideoItem): string {
  const start = item.violationStartSecond;
  const end = item.violationEndSecond;
  if (start == null && end == null) return '--';
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `0:${sec.toString().padStart(2, '0')}`;
  };
  if (start != null && end != null) return `${fmt(start)} - ${fmt(end)}`;
  if (start != null) return `从 ${fmt(start)}`;
  if (end != null) return `至 ${fmt(end)}`;
  return '--';
}

// 视频 ref 收集（Vue 3 函数式 ref）
function setVideoRef(el: unknown, idx: number) {
  if (!el || !(el instanceof HTMLVideoElement)) return;
  const arr = videoRefs.value;
  while (arr.length <= idx) arr.push(null);
  arr[idx] = el;
}

// 视频加载后：若有起止时间，从 start 开始播放
function onVideoLoaded(_ev: Event, idx: number) {
  const item = recentViolationVideos.value[idx];
  const video = videoRefs.value[idx] as HTMLVideoElement | undefined;
  if (!video || !item) return;
  const start = item.violationStartSecond;
  if (start != null && start > 0) {
    video.currentTime = Math.min(start, video.duration || 0);
  }
  video.play().catch(() => {});
}

// 视频播放中：若有起止时间且超出 end，循环回 start
function onVideoTimeUpdate(_ev: Event, idx: number) {
  const item = recentViolationVideos.value[idx];
  const video = videoRefs.value[idx] as HTMLVideoElement | undefined;
  if (!video || !item) return;
  const start = item.violationStartSecond ?? 0;
  const end = item.violationEndSecond;
  if (end != null && end > start && video.currentTime >= end) {
    video.currentTime = start;
  }
}

function animateNumber(key: string, target: number) {
  let current = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    animatedValues.value[key] = current;
  }, 30);
}

function applyStats(data: DashboardStatsVO) {
  serverData = data;

  // 更新指标卡片
  const cardMap: Record<string, { value: number | string; trend?: string; trendUp?: boolean }> = {
    total: { value: data.totalVideos },
    checked: { value: data.checkedCount },
    violation: { value: data.violationCount },
    rate: { value: data.passRate },
    today: { value: data.todayNew },
    avgTime: { value: data.avgProcessTime }
  };

  // 计算今日趋势
  if (data.yesterdayNew > 0) {
    const diff = ((data.todayNew - data.yesterdayNew) / data.yesterdayNew) * 100;
    cardMap.today.trend = Math.abs(diff).toFixed(1) + '%';
    cardMap.today.trendUp = diff >= 0;
  }

  statCards.value.forEach((card) => {
    const update = cardMap[card.key];
    if (!update) return;
    card.value = update.value;
    if (update.trend !== undefined) {
      card.trend = update.trend;
      card.trendUp = update.trendUp;
    }
    if (typeof update.value === 'number') {
      animateNumber(card.key, update.value);
    } else {
      animatedValues.value[card.key] = update.value;
    }
  });

  // 最新记录
  recentRecords.value = data.recentRecords || [];
  // 最近违规视频（四宫格）
  recentViolationVideos.value = data.recentViolationVideos || [];
  videoRefs.value = [];
}

// ======================== 系统状态（暂用假数据） ========================
const systemStatus = ref([
  { label: 'CPU 使用率', percent: 42, display: '42%', barColor: '#00d4ff', valueColor: '#00d4ff' },
  { label: '内存使用率', percent: 68, display: '68%', barColor: '#00e396', valueColor: '#00e396' },
  { label: 'GPU 使用率', percent: 85, display: '85%', barColor: '#feb019', valueColor: '#feb019' },
  { label: '磁盘使用率', percent: 53, display: '53%', barColor: '#775dd0', valueColor: '#775dd0' },
  { label: '消息队列积压', percent: 12, display: '3条', barColor: '#00d4ff', valueColor: '#00d4ff' }
]);

const serviceStatus = ref([
  { name: 'Java 后端', ok: true },
  { name: 'FastAPI 服务', ok: true },
  { name: 'RabbitMQ', ok: true },
  { name: 'MinIO 存储', ok: true },
  { name: 'AI 模型服务', ok: true },
  { name: 'Nacos 注册中心', ok: true }
]);

// ======================== ECharts ========================
const trendChartRef = ref<HTMLElement>();
const pieChartRef = ref<HTMLElement>();
const barChartRef = ref<HTMLElement>();

const chartInstances = shallowRef<echarts.ECharts[]>([]);

const CHART_TEXT_COLOR = '#8899aa';
const CHART_LINE_COLOR = '#1a2a3a';
const PIE_COLORS = ['#ff4560', '#feb019', '#775dd0', '#00d4ff', '#00e396', '#f9a825', '#ab47bc'];

function initTrendChart() {
  if (!trendChartRef.value || !serverData) return;
  const chart = echarts.init(trendChartRef.value);
  const trend = serverData.trendData || [];

  chart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: '#0d1b2aee', borderColor: '#0099ff44', textStyle: { color: '#ccc' } },
    grid: { top: 30, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: trend.map((t) => t.date),
      axisLine: { lineStyle: { color: CHART_LINE_COLOR } },
      axisLabel: { color: CHART_TEXT_COLOR }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: CHART_LINE_COLOR } },
      axisLabel: { color: CHART_TEXT_COLOR }
    },
    series: [
      {
        name: '检测数量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: trend.map((t) => t.total),
        lineStyle: { width: 3, color: '#00d4ff' },
        itemStyle: { color: '#00d4ff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00d4ff33' },
            { offset: 1, color: '#00d4ff05' }
          ])
        }
      },
      {
        name: '违规数量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: trend.map((t) => t.violations),
        lineStyle: { width: 3, color: '#ff4560' },
        itemStyle: { color: '#ff4560', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff456033' },
            { offset: 1, color: '#ff456005' }
          ])
        }
      }
    ]
  });
  return chart;
}

function initPieChart() {
  if (!pieChartRef.value || !serverData) return;
  const chart = echarts.init(pieChartRef.value);
  const types = serverData.violationTypes || [];

  const pieData =
    types.length > 0
      ? types.map((t, i) => ({ value: t.count, name: t.name, itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length] } }))
      : [{ value: 1, name: '暂无违规数据', itemStyle: { color: '#334455' } }];

  chart.setOption({
    tooltip: { trigger: 'item', backgroundColor: '#0d1b2aee', borderColor: '#0099ff44', textStyle: { color: '#ccc' } },
    legend: { bottom: 0, textStyle: { color: CHART_TEXT_COLOR, fontSize: 11 }, itemWidth: 12, itemHeight: 8 },
    series: [
      {
        type: 'pie',
        radius: ['42%', '70%'],
        center: ['50%', '45%'],
        label: { color: CHART_TEXT_COLOR, fontSize: 11 },
        labelLine: { lineStyle: { color: '#334455' } },
        itemStyle: { borderColor: '#0d1b2a', borderWidth: 2 },
        data: pieData
      }
    ]
  });
  return chart;
}

function initBarChart() {
  if (!barChartRef.value || !serverData) return;
  const chart = echarts.init(barChartRef.value);
  const depts = serverData.deptStats || [];

  const deptNames = depts.map((d) => d.deptName);
  const checkedData = depts.map((d) => d.checked);
  const violationData = depts.map((d) => d.violations);

  chart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: '#0d1b2aee', borderColor: '#0099ff44', textStyle: { color: '#ccc' } },
    grid: { top: 20, right: 20, bottom: 30, left: 80 },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: CHART_LINE_COLOR } },
      axisLabel: { color: CHART_TEXT_COLOR }
    },
    yAxis: {
      type: 'category',
      data: deptNames,
      axisLine: { lineStyle: { color: CHART_LINE_COLOR } },
      axisLabel: { color: CHART_TEXT_COLOR, fontSize: 11 }
    },
    series: [
      {
        name: '已检测',
        type: 'bar',
        barWidth: 14,
        stack: 'total',
        data: checkedData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#0099ff' },
            { offset: 1, color: '#00d4ff' }
          ])
        }
      },
      {
        name: '违规',
        type: 'bar',
        barWidth: 14,
        stack: 'total',
        data: violationData,
        itemStyle: { color: '#ff456099', borderRadius: [0, 3, 3, 0] }
      }
    ]
  });
  return chart;
}

// ======================== 数据加载 ========================
async function loadDashboardData() {
  try {
    const { data } = await getDashboardStats();
    applyStats(data);
    // 数据就绪后初始化图表
    const c1 = initTrendChart();
    const c2 = initPieChart();
    const c3 = initBarChart();
    chartInstances.value = [c1, c2, c3].filter(Boolean) as echarts.ECharts[];
  } catch (e) {
    console.error('大屏数据加载失败:', e);
  }
}

// ======================== 生命周期 ========================
let resizeHandler: () => void;
let visibilityHandler: () => void;
let refreshTimer: ReturnType<typeof setInterval>;

// 恢复所有视频播放（切换页面/标签页回来时调用）
function resumeVideos() {
  videoRefs.value.forEach((v) => v?.play().catch(() => {}));
}

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);

  loadDashboardData();
  // 每60秒自动刷新数据
  refreshTimer = setInterval(loadDashboardData, 60000);

  resizeHandler = () => chartInstances.value.forEach((c) => c.resize());
  window.addEventListener('resize', resizeHandler);

  // 标签页重新可见时恢复视频播放
  visibilityHandler = () => {
    if (document.visibilityState === 'visible') resumeVideos();
  };
  document.addEventListener('visibilitychange', visibilityHandler);
});

onActivated(() => {
  // keep-alive 激活时（从其他路由切回首页）立即恢复视频
  nextTick(() => resumeVideos());
  chartInstances.value.forEach((c) => c?.resize());
});

onUnmounted(() => {
  clearInterval(clockTimer);
  clearInterval(refreshTimer);
  window.removeEventListener('resize', resizeHandler);
  document.removeEventListener('visibilitychange', visibilityHandler);
  chartInstances.value.forEach((c) => c.dispose());
});
</script>

<style lang="scss" scoped>
/* ==================== 全局变量 ==================== */
$bg-primary: #0a0e1a;
$bg-card: #0d1b2aee;
$border-color: #0f3460;
$accent: #00d4ff;
$accent2: #0099ff;
$text-primary: #e0e8f0;
$text-secondary: #6b7d8e;
$safe-color: #00e396;
$danger-color: #ff4560;
$pending-color: #feb019;

/* ==================== 容器 ==================== */
.dashboard {
  min-height: calc(100vh - 84px);
  background: $bg-primary;
  background-image:
    linear-gradient(rgba(0, 153, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 153, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: $text-primary;
  font-family: 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ==================== 头部 ==================== */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  background: linear-gradient(90deg, transparent, $bg-card, transparent);
  border-bottom: 1px solid $border-color;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 20%;
    right: 20%;
    height: 1px;
    background: linear-gradient(90deg, transparent, $accent, transparent);
  }
}
.header-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 6px;
  background: linear-gradient(90deg, $accent2, $accent, #fff, $accent, $accent2);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: headerShine 4s linear infinite;
}
@keyframes headerShine {
  to {
    background-position: 200% center;
  }
}
.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
}
.header-right {
  justify-content: flex-end;
}
.header-sub {
  color: $text-secondary;
  font-size: 11px;
  letter-spacing: 2px;
}
.header-time {
  color: $accent;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}
.header-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $accent;
  box-shadow: 0 0 6px $accent;
}

/* ==================== 指标卡片 ==================== */
.stat-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.stat-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, $accent2, transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  &:hover {
    border-color: $accent2;
    box-shadow: 0 0 20px rgba(0, 153, 255, 0.1);
    &::before {
      opacity: 1;
    }
  }
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  font-family: 'DIN Alternate', 'Courier New', monospace;
  line-height: 1.2;
}
.stat-label {
  font-size: 12px;
  color: $text-secondary;
  white-space: nowrap;
}
.stat-trend {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}
.trend-tag {
  font-size: 12px;
  font-weight: 600;
  &.up {
    color: $safe-color;
  }
  &.down {
    color: $danger-color;
  }
}
.trend-hint {
  font-size: 10px;
  color: $text-secondary;
}

/* ==================== 卡片通用 ==================== */
.chart-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.3s;
  &:hover {
    border-color: rgba(0, 153, 255, 0.3);
  }
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #1a2a3a;
}
.card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $accent;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);

  &.pulse {
    animation: dotPulse 1.5s ease-in-out infinite;
  }
}
@keyframes dotPulse {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px $accent;
  }
  50% {
    opacity: 0.4;
    box-shadow: 0 0 2px $accent;
  }
}
.card-title {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
}
.card-badge {
  margin-left: auto;
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 4px;
  background: rgba(0, 212, 255, 0.15);
  color: $accent;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

/* ==================== 主内容区（左右两列等高，左列视频与记录同宽对齐） ==================== */
.middle-section {
  display: grid;
  grid-template-columns: 1fr minmax(280px, 0.7fr);
  gap: 12px;
  align-items: stretch;
  flex: 1;
  min-height: 520px;
}

.middle-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
}

.middle-col--left {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  min-height: 0;
}

.middle-col--right {
  flex: 1;
}

.video-grid-panel {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  transition: border-color 0.3s;
  border-left: 3px solid $danger-color;
  &:hover {
    border-color: rgba(255, 69, 96, 0.4);
  }
}

/* 与上方视频区等分左列高度、同宽 */
.record-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .record-list {
    flex: 1;
    min-height: 0;
  }
}

.video-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  min-height: 280px;
}

.video-cell {
  position: relative;
  background: #0a0e1a;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid $border-color;
}

.violation-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.video-type {
  color: $danger-color;
  font-weight: 500;
}

.video-time {
  color: $text-secondary;
  font-family: 'Courier New', monospace;
}

.video-empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  font-size: 14px;
  min-height: 200px;
}

.charts-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  flex: 1;
  min-height: 0;
}

.charts-panel .chart-card {
  flex: 1;
  min-height: 120px;
}

.charts-panel .chart-card .chart-body {
  min-height: 100px;
}

.system-panel {
  flex-shrink: 0;
}

/* ==================== 图表行（兼容） ==================== */
.chart-row {
  display: grid;
  gap: 12px;
  grid-template-columns: 5fr 3fr 4fr;
  min-height: 240px;
}
.chart-body {
  flex: 1;
  min-height: 0;
}

/* ==================== 检测记录列表 ==================== */
.record-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: $border-color;
    border-radius: 3px;
  }
}
.record-item {
  display: grid;
  grid-template-columns: 70px 72px 1fr 60px 90px;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.2s;
  &:hover {
    background: rgba(0, 153, 255, 0.08);
  }
}
.record-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  font-size: 13px;
}
.record-time {
  color: $text-secondary;
  font-family: 'Courier New', monospace;
}
.record-name {
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.record-user {
  color: $text-secondary;
  text-align: center;
}
.record-status {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  text-align: center;
  &.done {
    color: $safe-color;
    background: rgba(0, 227, 150, 0.1);
  }
  &.running {
    color: $pending-color;
    background: rgba(254, 176, 25, 0.1);
  }
  &.fail {
    color: $danger-color;
    background: rgba(255, 69, 96, 0.1);
  }
  &.pending {
    color: $text-secondary;
    background: rgba(255, 255, 255, 0.05);
  }
}
.record-result {
  text-align: right;
  font-weight: 500;
  &.safe {
    color: $safe-color;
  }
  &.danger {
    color: $danger-color;
  }
  &.pending {
    color: $text-secondary;
  }
}

/* ==================== 系统状态 ==================== */
.system-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 4px;
}
.status-item {
  display: grid;
  grid-template-columns: 90px 1fr 50px;
  align-items: center;
  gap: 12px;
}
.status-label {
  font-size: 12px;
  color: $text-secondary;
}
.status-bar-wrap {
  height: 6px;
  background: #1a2a3a;
  border-radius: 3px;
  overflow: hidden;
}
.status-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 1.5s ease-out;
}
.status-value {
  font-size: 13px;
  font-weight: 600;
  text-align: right;
  font-family: 'Courier New', monospace;
}

.status-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #1a2a3a;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.svc-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.svc-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  &.online {
    background: $safe-color;
    box-shadow: 0 0 6px rgba(0, 227, 150, 0.5);
  }
  &.offline {
    background: $danger-color;
    box-shadow: 0 0 6px rgba(255, 69, 96, 0.5);
  }
}
.svc-name {
  font-size: 11px;
  color: $text-secondary;
}

/* ==================== 响应式 ==================== */
@media (max-width: 1400px) {
  .stat-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .middle-section {
    grid-template-columns: 1fr;
  }
  .charts-panel .chart-card {
    min-height: 140px;
  }
}
@media (max-width: 900px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .video-grid-panel {
    min-width: 0;
  }
  .middle-section {
    grid-template-columns: 1fr;
  }
}
</style>
