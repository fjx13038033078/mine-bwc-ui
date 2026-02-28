import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/** 趋势数据 */
export interface TrendItem {
  date: string;
  total: number;
  violations: number;
}

/** 违规类型 */
export interface TypeItem {
  name: string;
  count: number;
}

/** 部门统计 */
export interface DeptItem {
  deptId: number;
  deptName: string;
  checked: number;
  violations: number;
}

/** 最新记录 */
export interface RecordItem {
  time: string;
  status: number;
  statusText: string;
  fileName: string;
  userName: string;
  hasViolation: number;
  resultText: string;
}

/** 大屏统计数据 */
export interface DashboardStatsVO {
  totalVideos: number;
  checkedCount: number;
  violationCount: number;
  passRate: string;
  todayNew: number;
  yesterdayNew: number;
  avgProcessTime: string;
  trendData: TrendItem[];
  violationTypes: TypeItem[];
  deptStats: DeptItem[];
  recentRecords: RecordItem[];
}

/**
 * 获取数据大屏统计数据
 */
export function getDashboardStats(): AxiosPromise<DashboardStatsVO> {
  return request({
    url: 'camera/dashboard/stats',
    method: 'get'
  });
}
