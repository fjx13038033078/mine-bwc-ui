<template>
  <div class="data-screen">
    <!-- 顶部标题 -->
    <div class="screen-header">
      <div class="header-decoration left"></div>
      <div class="header-title">
        <div class="title-main">铜矿AI安全监控大数据平台</div>
        <div class="title-sub">Copper Mine AI Safety Monitoring Big Data Platform</div>
      </div>
      <div class="header-decoration right"></div>
      <div class="header-time">
        <div class="time-text">{{ currentTime }}</div>
        <div class="date-text">{{ currentDate }}</div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="screen-content">
      <!-- 左侧区域 -->
      <div class="content-left">
        <!-- 实时监控统计 -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="screen-panel-title">
              <i class="icon-dot"></i>
              实时监控统计
            </div>
          </div>
          <div class="panel-body">
            <div class="stat-grid">
              <div class="stat-item" v-for="(item, index) in realTimeStats" :key="index">
                <div class="stat-icon" :style="{ background: item.color }">
                  <i :class="item.icon"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ item.label }}</div>
                  <div class="stat-value">
                    <span class="stat-number">{{ item.value }}</span>
                    <span class="stat-unit">{{ item.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 违规类型分布 -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="screen-panel-title">
              <i class="icon-dot"></i>
              违规类型分布
            </div>
          </div>
          <div class="panel-body">
            <div ref="violationTypeChart" class="chart-container"></div>
          </div>
        </div>

        <!-- 设备状态分布 -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="screen-panel-title">
              <i class="icon-dot"></i>
              设备状态分布
            </div>
          </div>
          <div class="panel-body">
            <div ref="deviceStatusChart" class="chart-container"></div>
          </div>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="content-center">
        <!-- 核心指标 -->
        <div class="core-metrics">
          <div class="metric-item" v-for="(item, index) in coreMetrics" :key="index">
            <div class="metric-icon-wrapper">
              <div class="metric-icon" :style="{ background: item.gradient }">
                <i :class="item.icon"></i>
              </div>
              <div class="metric-progress">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" class="progress-bg"></circle>
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    class="progress-bar"
                    :style="{
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - item.percent / 100)}`
                    }"
                  ></circle>
                </svg>
              </div>
            </div>
            <div class="metric-content">
              <div class="metric-value">
                <span class="metric-number">{{ item.value }}</span>
              </div>
              <div class="metric-label">{{ item.label }}</div>
            </div>
          </div>
        </div>

        <!-- 违规趋势图 -->
        <div class="panel-card trend-panel">
          <div class="panel-header">
            <div class="screen-panel-title">
              <i class="icon-dot"></i>
              违规趋势分析
            </div>
            <div class="panel-tabs">
              <span
                v-for="tab in ['近7天', '近30天', '近90天']"
                :key="tab"
                :class="['tab-item', { active: selectedTab === tab }]"
                @click="selectedTab = tab"
              >
                {{ tab }}
              </span>
            </div>
          </div>
          <div class="panel-body">
            <div ref="trendChart" class="chart-container-large"></div>
          </div>
        </div>

        <!-- 最新违规预警 -->
        <div class="panel-card alert-panel">
          <div class="panel-header">
            <div class="screen-panel-title">
              <i class="icon-dot"></i>
              最新违规预警
            </div>
          </div>
          <div class="panel-body">
            <div class="alert-scroll-container" @mouseenter="pauseScroll" @mouseleave="resumeScroll">
              <div class="alert-list" :class="{ paused: isScrollPaused }">
                <!-- 第一组数据 -->
                <div class="alert-item" v-for="(item, index) in latestAlerts" :key="'first-' + index" :class="`severity-${item.severity}`">
                  <div class="alert-icon">
                    <i class="el-icon-warning"></i>
                  </div>
                  <div class="alert-content">
                    <div class="alert-title">{{ item.type }}</div>
                    <div class="alert-info">
                      <span class="alert-location">{{ item.location }}</span>
                      <span class="alert-time">{{ item.time }}</span>
                    </div>
                  </div>
                  <div class="alert-status" :class="`status-${item.status}`">
                    {{ item.statusText }}
                  </div>
                </div>
                <!-- 第二组数据（用于无缝循环） -->
                <div class="alert-item" v-for="(item, index) in latestAlerts" :key="'second-' + index" :class="`severity-${item.severity}`">
                  <div class="alert-icon">
                    <i class="el-icon-warning"></i>
                  </div>
                  <div class="alert-content">
                    <div class="alert-title">{{ item.type }}</div>
                    <div class="alert-info">
                      <span class="alert-location">{{ item.location }}</span>
                      <span class="alert-time">{{ item.time }}</span>
                    </div>
                  </div>
                  <div class="alert-status" :class="`status-${item.status}`">
                    {{ item.statusText }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="content-right">
        <!-- 时段违规分布 -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="screen-panel-title">
              <i class="icon-dot"></i>
              时段违规分布
            </div>
          </div>
          <div class="panel-body">
            <div ref="hourlyChart" class="chart-container"></div>
          </div>
        </div>

        <!-- AI识别准确率 -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="screen-panel-title">
              <i class="icon-dot"></i>
              AI识别准确率
            </div>
          </div>
          <div class="panel-body">
            <div ref="accuracyChart" class="chart-container"></div>
          </div>
        </div>

        <!-- 违规处理统计 -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="screen-panel-title">
              <i class="icon-dot"></i>
              违规处理统计
            </div>
          </div>
          <div class="panel-body">
            <div class="process-stats">
              <div class="process-item" v-for="(item, index) in processStats" :key="index">
                <div class="process-header">
                  <span class="process-label">{{ item.label }}</span>
                  <span class="process-value">{{ item.value }}</span>
                </div>
                <div class="process-bar">
                  <div
                    class="process-fill"
                    :style="{
                      width: item.percent + '%',
                      background: item.color
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="screen-footer">
      <div class="footer-decoration"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';

// ==================== 数据定义 ====================

// 当前时间
const currentTime = ref('');
const currentDate = ref('');

// 选中的tab
const selectedTab = ref('近7天');

// 实时监控统计
const realTimeStats = ref([
  { label: '在线设备', value: 128, unit: '台', icon: 'el-icon-monitor', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: '监控人员', value: 356, unit: '人', icon: 'el-icon-user', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { label: '今日检测', value: 2456, unit: '次', icon: 'el-icon-video-camera', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { label: '待处理违规', value: 23, unit: '项', icon: 'el-icon-warning', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
]);

// 核心指标
const coreMetrics = ref([
  { label: '设备总数', value: 128, percent: 85, icon: 'el-icon-monitor', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: '违规总数', value: 1543, percent: 65, icon: 'el-icon-warning-outline', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { label: '处理率', value: 92, percent: 92, icon: 'el-icon-circle-check', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { label: 'AI准确率', value: 96, percent: 96, icon: 'el-icon-data-analysis', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
]);

// 最新违规预警
const latestAlerts = ref([
  { type: '未佩戴安全帽', location: '3号矿井-B区', time: '2分钟前', severity: 'high', status: 'pending', statusText: '待处理' },
  { type: '违规操作设备', location: '2号矿井-A区', time: '5分钟前', severity: 'medium', status: 'processing', statusText: '处理中' },
  { type: '气瓶混放', location: '1号矿井-C区', time: '8分钟前', severity: 'critical', status: 'pending', statusText: '待处理' },
  { type: '未系安全带', location: '4号矿井-D区', time: '12分钟前', severity: 'high', status: 'pending', statusText: '待处理' },
  { type: '无证上岗', location: '3号矿井-A区', time: '15分钟前', severity: 'critical', status: 'processing', statusText: '处理中' }
]);

// 滚动控制
const isScrollPaused = ref(false);

// 暂停滚动
const pauseScroll = () => {
  isScrollPaused.value = true;
};

// 恢复滚动
const resumeScroll = () => {
  isScrollPaused.value = false;
};

// 违规处理统计
const processStats = ref([
  { label: '已处理', value: 1421, percent: 92, color: 'linear-gradient(90deg, #52c41a 0%, #73d13d 100%)' },
  { label: '处理中', value: 89, percent: 6, color: 'linear-gradient(90deg, #faad14 0%, #ffd666 100%)' },
  { label: '待处理', value: 23, percent: 1.5, color: 'linear-gradient(90deg, #f5222d 0%, #ff4d4f 100%)' },
  { label: '误报', value: 10, percent: 0.5, color: 'linear-gradient(90deg, #8c8c8c 0%, #bfbfbf 100%)' }
]);

// ==================== 图表引用 ====================
const violationTypeChart = ref<HTMLElement>();
const deviceStatusChart = ref<HTMLElement>();
const hourlyChart = ref<HTMLElement>();
const accuracyChart = ref<HTMLElement>();
const trendChart = ref<HTMLElement>();

// ==================== 图表实例 ====================
let violationTypeChartInstance: echarts.ECharts;
let deviceStatusChartInstance: echarts.ECharts;
let hourlyChartInstance: echarts.ECharts;
let accuracyChartInstance: echarts.ECharts;
let trendChartInstance: echarts.ECharts;

// ==================== 时间更新 ====================
const updateTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekDay = weekDays[now.getDay()];
  currentDate.value = `${year}-${month}-${day} ${weekDay}`;
};

// ==================== 图表初始化 ====================

// 违规类型分布图
const initViolationTypeChart = () => {
  if (!violationTypeChart.value) return;

  violationTypeChartInstance = echarts.init(violationTypeChart.value);

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      itemWidth: 10,
      itemHeight: 10
    },
    series: [
      {
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#0a1929',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: [
          { value: 435, name: '未佩戴安全帽', itemStyle: { color: '#5470c6' } },
          { value: 310, name: '未系安全带', itemStyle: { color: '#91cc75' } },
          { value: 234, name: '违规操作设备', itemStyle: { color: '#fac858' } },
          { value: 198, name: '气瓶混放', itemStyle: { color: '#ee6666' } },
          { value: 156, name: '无证上岗', itemStyle: { color: '#73c0de' } },
          { value: 210, name: '其他违规', itemStyle: { color: '#9a60b4' } }
        ]
      }
    ]
  };

  violationTypeChartInstance.setOption(option);
};

// 设备状态分布图
const initDeviceStatusChart = () => {
  if (!deviceStatusChart.value) return;

  deviceStatusChartInstance = echarts.init(deviceStatusChart.value);

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      formatter: '{b}: {c}台 ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      left: 'center',
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      itemWidth: 12,
      itemHeight: 12
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0a1929',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'center',
          formatter: () => {
            return '{total|设备总数}\n{value|128}{unit|台}';
          },
          rich: {
            total: {
              fontSize: 13,
              color: '#b0c4de',
              lineHeight: 22
            },
            value: {
              fontSize: 28,
              fontWeight: 'bold',
              color: '#00d4ff',
              lineHeight: 36
            },
            unit: {
              fontSize: 14,
              color: '#b0c4de'
            }
          }
        },
        emphasis: {
          label: {
            show: false
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: 109,
            name: '在线',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                { offset: 0, color: '#52c41a' },
                { offset: 1, color: '#73d13d' }
              ])
            }
          },
          {
            value: 13,
            name: '维护',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                { offset: 0, color: '#faad14' },
                { offset: 1, color: '#ffd666' }
              ])
            }
          },
          {
            value: 6,
            name: '故障',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                { offset: 0, color: '#f5222d' },
                { offset: 1, color: '#ff4d4f' }
              ])
            }
          }
        ]
      }
    ]
  };

  deviceStatusChartInstance.setOption(option);
};

// 部门违规对比图
const initHourlyChart = () => {
  if (!hourlyChart.value) return;

  hourlyChartInstance = echarts.init(hourlyChart.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '8%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['0-4时', '4-8时', '8-12时', '12-16时', '16-20时', '20-24时'],
      axisLabel: {
        color: '#b0c4de',
        fontSize: 11
      },
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '违规数量',
      nameTextStyle: {
        color: '#b0c4de',
        fontSize: 11
      },
      axisLabel: {
        color: '#b0c4de',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: '#1e3a5f',
          type: 'dashed'
        }
      },
      axisLine: {
        show: false
      }
    },
    series: [
      {
        name: '违规数量',
        data: [8, 12, 45, 78, 62, 23],
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          color: (params: any) => {
            const colors = [
              '#3b82f6',
              '#3b82f6',
              '#faad14',
              '#f5222d',
              '#faad14',
              '#3b82f6'
            ];
            return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[params.dataIndex] },
              { offset: 1, color: colors[params.dataIndex] + '80' }
            ]);
          },
          borderRadius: [5, 5, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          color: '#00d4ff',
          fontSize: 11,
          fontWeight: 'bold'
        }
      }
    ]
  };

  hourlyChartInstance.setOption(option);
};

// AI识别准确率图
const initAccuracyChart = () => {
  if (!accuracyChart.value) return;

  accuracyChartInstance = echarts.init(accuracyChart.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    radar: {
      indicator: [
        { name: '未佩戴安全帽', max: 100 },
        { name: '未系安全带', max: 100 },
        { name: '违规操作', max: 100 },
        { name: '气瓶混放', max: 100 },
        { name: '无证上岗', max: 100 }
      ],
      shape: 'circle',
      radius: '55%',
      center: ['50%', '52%'],
      name: {
        textStyle: {
          color: '#b0c4de',
          fontSize: 11
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(0, 212, 255, 0.1)', 'rgba(0, 212, 255, 0.05)']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [96, 94, 98, 92, 95],
            name: 'AI准确率',
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.7, [
                { offset: 0, color: 'rgba(0, 212, 255, 0.5)' },
                { offset: 1, color: 'rgba(0, 212, 255, 0.1)' }
              ])
            },
            lineStyle: {
              color: '#00d4ff',
              width: 2
            },
            itemStyle: {
              color: '#00d4ff',
              borderWidth: 2
            }
          }
        ]
      }
    ]
  };

  accuracyChartInstance.setOption(option);
};

// 违规趋势图
const initTrendChart = () => {
  if (!trendChart.value) return;

  trendChartInstance = echarts.init(trendChart.value);

  const dates = [];
  const violationData = [];
  const handledData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
    violationData.push(Math.floor(Math.random() * 50) + 150);
    handledData.push(Math.floor(Math.random() * 50) + 130);
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      data: ['检测违规', '已处理'],
      textStyle: {
        color: '#b0c4de'
      },
      top: '5%',
      right: '5%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        color: '#b0c4de',
        fontSize: 11
      },
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#b0c4de',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: '#1e3a5f',
          type: 'dashed'
        }
      },
      axisLine: {
        show: false
      }
    },
    series: [
      {
        name: '检测违规',
        type: 'line',
        smooth: true,
        data: violationData,
        lineStyle: {
          color: '#f5222d',
          width: 3
        },
        itemStyle: {
          color: '#f5222d'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 34, 45, 0.5)' },
            { offset: 1, color: 'rgba(245, 34, 45, 0.1)' }
          ])
        }
      },
      {
        name: '已处理',
        type: 'line',
        smooth: true,
        data: handledData,
        lineStyle: {
          color: '#52c41a',
          width: 3
        },
        itemStyle: {
          color: '#52c41a'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(82, 196, 26, 0.5)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
          ])
        }
      }
    ]
  };

  trendChartInstance.setOption(option);
};

// ==================== 响应式处理 ====================
const handleResize = () => {
  violationTypeChartInstance?.resize();
  deviceStatusChartInstance?.resize();
  hourlyChartInstance?.resize();
  accuracyChartInstance?.resize();
  trendChartInstance?.resize();
};

// ==================== 生命周期 ====================
let timeInterval: number;

onMounted(() => {
  updateTime();
  timeInterval = window.setInterval(updateTime, 1000);

  nextTick(() => {
    initViolationTypeChart();
    initDeviceStatusChart();
    initHourlyChart();
    initAccuracyChart();
    initTrendChart();

    window.addEventListener('resize', handleResize);
  });
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }

  violationTypeChartInstance?.dispose();
  deviceStatusChartInstance?.dispose();
  hourlyChartInstance?.dispose();
  accuracyChartInstance?.dispose();
  trendChartInstance?.dispose();

  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped lang="scss">
.data-screen {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #0a1929 0%, #0f2744 100%);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
  }
}

// ==================== 顶部标题 ====================
.screen-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 40px;

  .header-decoration {
    width: 200px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #00d4ff, transparent);
    position: relative;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid #00d4ff;
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
    }

    &::before {
      left: -8px;
    }

    &::after {
      right: -8px;
    }
  }

  .header-title {
    margin: 0 30px;
    text-align: center;

    .title-main {
      font-size: 28px;
      font-weight: bold;
      background: linear-gradient(90deg, #00d4ff, #0066ff, #00d4ff);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 3px;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    }

    .title-sub {
      font-size: 11px;
      color: #4a90e2;
      letter-spacing: 1px;
      margin-top: 3px;
      text-transform: uppercase;
    }
  }

  .header-time {
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    text-align: right;

    .time-text {
      font-size: 20px;
      font-weight: bold;
      color: #00d4ff;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
    }

    .date-text {
      font-size: 10px;
      color: #4a90e2;
      margin-top: 3px;
    }
  }
}

// ==================== 主体内容 ====================
.screen-content {
  display: flex;
  gap: 20px;
  padding: 0 20px 20px;
  height: calc(100vh - 80px);
}

.content-left,
.content-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0; // 防止flex子项溢出

  // 左右两侧的卡片平均分配高度
  .panel-card {
    flex: 1;
    min-height: 0; // 允许flex收缩
  }
}

.content-center {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

// ==================== 面板卡片 ====================
.panel-card {
  background: rgba(10, 25, 41, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  }

  &.trend-panel {
    flex: 1;
    min-height: 0;
  }

  &.alert-panel {
    flex: 1;
    min-height: 0;
  }
}

.panel-header {
  padding: 10px 15px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.screen-panel-title {
  font-size: 14px;
  color: #00d4ff;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;

  .icon-dot {
    width: 6px;
    height: 6px;
    background: #00d4ff;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.8);
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.8);
  }
}

.panel-tabs {
  display: flex;
  gap: 8px;

  .tab-item {
    padding: 3px 10px;
    font-size: 11px;
    color: #4a90e2;
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: #00d4ff;
      border-color: #00d4ff;
    }

    &.active {
      background: rgba(0, 212, 255, 0.2);
      color: #00d4ff;
      border-color: #00d4ff;
    }
  }
}

.panel-body {
  padding: 12px 15px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ==================== 统计网格 ====================
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  height: 100%;
  align-content: start;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
  }
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;

  i {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
  }
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #b0c4de;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #00d4ff;
  font-family: 'Arial', sans-serif;

  .stat-number {
    display: inline-block;
    animation: fadeInUp 0.8s ease-out;
  }

  .stat-unit {
    font-size: 14px;
    color: #4a90e2;
    margin-left: 4px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ==================== 核心指标 ====================
.core-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 15px 20px;
  flex-shrink: 0;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: rgba(10, 25, 41, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 212, 255, 0.4);
    border-color: #00d4ff;
  }
}

.metric-icon-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
}

.metric-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);

  i {
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  }
}

.metric-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  svg {
    transform: rotate(-90deg);
  }

  .progress-bg {
    fill: none;
    stroke: rgba(0, 212, 255, 0.1);
    stroke-width: 4;
  }

  .progress-bar {
    fill: none;
    stroke: #00d4ff;
    stroke-width: 4;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s ease;
    filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.8));
  }
}

.metric-content {
  text-align: center;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #00d4ff;
  font-family: 'Arial', sans-serif;

  .metric-number {
    display: inline-block;
    animation: fadeInUp 1s ease-out;
  }
}

.metric-label {
  font-size: 12px;
  color: #b0c4de;
  margin-top: 2px;
}

// ==================== 图表容器 ====================
.chart-container {
  width: 100%;
  flex: 1;
  min-height: 200px;
  max-height: 350px;
}

.chart-container-large {
  width: 100%;
  flex: 1;
  min-height: 0;
}

// ==================== 最新违规预警（无缝滚动） ====================
.alert-scroll-container {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.alert-list {
  display: flex;
  flex-direction: column;
  animation: scroll-up 20s linear infinite;

  &.paused {
    animation-play-state: paused;
  }
}

// 滚动动画
@keyframes scroll-up {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 10px;
  background: rgba(0, 212, 255, 0.05);
  border-left: 3px solid #00d4ff;
  border-radius: 4px;
  transition: all 0.3s;
  flex-shrink: 0;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    transform: translateX(5px);
  }

  &.severity-high {
    border-left-color: #faad14;

    .alert-icon {
      color: #faad14;
    }
  }

  &.severity-critical {
    border-left-color: #f5222d;

    .alert-icon {
      color: #f5222d;
      animation: blink 1s infinite;
    }
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.alert-icon {
  font-size: 24px;
  color: #00d4ff;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  color: #fff;
  margin-bottom: 4px;
  font-weight: bold;
}

.alert-info {
  font-size: 12px;
  color: #b0c4de;
  display: flex;
  gap: 15px;
}

.alert-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;

  &.status-pending {
    background: rgba(245, 34, 45, 0.2);
    color: #f5222d;
  }

  &.status-processing {
    background: rgba(250, 173, 20, 0.2);
    color: #faad14;
  }
}

// ==================== 违规处理统计 ====================
.process-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  justify-content: space-between;
  padding: 5px 0;
}

.process-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;

  .process-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .process-label {
      font-size: 13px;
      color: #b0c4de;
    }

    .process-value {
      font-size: 16px;
      font-weight: bold;
      color: #00d4ff;
    }
  }

  .process-bar {
    width: 100%;
    height: 10px;
    background: rgba(0, 212, 255, 0.1);
    border-radius: 5px;
    overflow: hidden;

    .process-fill {
      height: 100%;
      border-radius: 5px;
      transition: width 1s ease;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
    }
  }
}

// ==================== 底部装饰 ====================
.screen-footer {
  height: 20px;
  padding: 0 20px;

  .footer-decoration {
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  }
}
</style>
