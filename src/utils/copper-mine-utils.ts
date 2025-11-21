/**
 * 铜矿AI安全监控系统 - 业务工具函数
 */

import type { AI_STATUS, VIOLATION_SEVERITY, DEVICE_STATUS } from './copper-mine-constants';

/**
 * 生成唯一ID
 * @param prefix ID前缀
 * @param length ID长度（不含前缀）
 */
export const generateId = (prefix: string, length: number = 3): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * Math.pow(10, length));
  return `${prefix}${timestamp}${String(random).padStart(length, '0')}`;
};

/**
 * 格式化时间
 * @param date 日期对象或时间戳
 * @param format 格式化样式
 */
export const formatDateTime = (date: Date | number = new Date(), format: string = 'full'): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'full':
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hour}:${minute}:${second}`;
    case 'datetime':
      return `${year}-${month}-${day} ${hour}:${minute}`;
    default:
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
};

/**
 * 分页数据
 * @param data 原始数据
 * @param pageNum 页码
 * @param pageSize 每页数量
 */
export const paginateData = <T>(data: T[], pageNum: number, pageSize: number): { list: T[]; total: number } => {
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  return {
    list: data.slice(start, end),
    total: data.length
  };
};

/**
 * 文本分割（用于规范库的标准和违规条目）
 * @param text 文本内容
 * @param separator 分隔符
 */
export const splitText = (text: string, separator: string | RegExp = /[；;]/): string[] => {
  if (!text) return [];
  return text.split(separator).filter((item) => item.trim()).map((item) => item.trim());
};

/**
 * 数组转文本（用于规范库的标准和违规条目）
 * @param arr 数组
 * @param separator 分隔符
 */
export const arrayToText = (arr: string[], separator: string = '；'): string => {
  if (!arr || arr.length === 0) return '';
  return arr.join(separator);
};

/**
 * 获取AI状态的显示文本和类型
 * @param status AI状态
 */
export const getAIStatusInfo = (status: string): { text: string; type: 'success' | 'info' | 'warning' | 'danger' } => {
  const statusMap = {
    pending: { text: '待检测', type: 'info' as const },
    processing: { text: '检测中', type: 'warning' as const },
    completed: { text: '已完成', type: 'success' as const },
    failed: { text: '检测失败', type: 'danger' as const }
  };
  return statusMap[status as keyof typeof statusMap] || { text: status, type: 'info' as const };
};

/**
 * 获取设备状态的显示文本和类型
 * @param status 设备状态
 */
export const getDeviceStatusInfo = (status: string): { text: string; type: 'success' | 'info' | 'warning' | 'danger' } => {
  const statusMap = {
    online: { text: '在线', type: 'success' as const },
    offline: { text: '离线', type: 'info' as const },
    maintenance: { text: '维护中', type: 'warning' as const },
    fault: { text: '故障', type: 'danger' as const }
  };
  return statusMap[status as keyof typeof statusMap] || { text: status, type: 'info' as const };
};

/**
 * 获取违规严重程度的显示文本和类型
 * @param severity 严重程度
 */
export const getViolationSeverityInfo = (severity: string): { 
  text: string; 
  type: 'success' | 'info' | 'warning' | 'danger';
  color: string;
} => {
  const severityMap = {
    low: { text: '一般', type: 'info' as const, color: '#909399' },
    medium: { text: '较重', type: 'warning' as const, color: '#E6A23C' },
    high: { text: '严重', type: 'danger' as const, color: '#F56C6C' },
    critical: { text: '特别严重', type: 'danger' as const, color: '#C0392B' }
  };
  return severityMap[severity as keyof typeof severityMap] || { text: severity, type: 'info' as const, color: '#909399' };
};

/**
 * 获取作业类型的颜色
 * @param workType 作业类型
 */
export const getWorkTypeColor = (workType: string): string => {
  const colorMap: Record<string, string> = {
    '焊割作业': '#F56C6C',
    '吊装作业': '#E6A23C',
    '高处作业': '#409EFF',
    '受限空间作业': '#67C23A',
    '动火作业': '#F56C6C',
    '电气作业': '#909399',
    '爆破作业': '#C0392B',
    '通用作业': '#606266'
  };
  return colorMap[workType] || '#606266';
};

/**
 * 获取文件图标和颜色
 * @param fileType 文件类型
 */
export const getFileIconInfo = (fileType: string): { icon: string; color: string } => {
  const iconMap: Record<string, { icon: string; color: string }> = {
    pdf: { icon: 'Document', color: '#F56C6C' },
    docx: { icon: 'Document', color: '#409EFF' },
    doc: { icon: 'Document', color: '#409EFF' },
    image: { icon: 'Picture', color: '#67C23A' },
    jpg: { icon: 'Picture', color: '#67C23A' },
    jpeg: { icon: 'Picture', color: '#67C23A' },
    png: { icon: 'Picture', color: '#67C23A' }
  };
  return iconMap[fileType] || { icon: 'Document', color: '#909399' };
};

/**
 * 获取文件类型名称
 * @param fileType 文件类型
 */
export const getFileTypeName = (fileType: string): string => {
  const nameMap: Record<string, string> = {
    pdf: 'PDF',
    docx: 'Word',
    doc: 'Word',
    image: '图片',
    jpg: '图片',
    jpeg: '图片',
    png: '图片'
  };
  return nameMap[fileType] || fileType.toUpperCase();
};

/**
 * 模拟文件大小
 */
export const generateFileSize = (): string => {
  const sizes = ['856 KB', '1.2 MB', '1.8 MB', '2.5 MB', '3.2 MB', '4.5 MB', '5.8 MB', '8.3 MB'];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 计算两个日期之间的天数
 * @param date1 日期1
 * @param date2 日期2
 */
export const getDaysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 统计数组中某个值的出现次数
 * @param arr 数组
 * @param value 值
 */
export const countOccurrences = <T>(arr: T[], value: T): number => {
  return arr.filter((item) => item === value).length;
};

/**
 * 按字段分组
 * @param arr 数组
 * @param key 分组字段
 */
export const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
  return arr.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * 数组去重
 * @param arr 数组
 * @param key 去重字段（可选）
 */
export const uniqueArray = <T>(arr: T[], key?: keyof T): T[] => {
  if (!key) {
    return Array.from(new Set(arr));
  }
  const seen = new Set();
  return arr.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * 深拷贝对象
 * @param obj 对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * 导出数据为JSON文件
 * @param data 数据
 * @param filename 文件名
 */
export const exportToJSON = (data: any, filename: string = 'export.json'): void => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * 导出数据为CSV文件
 * @param data 数据数组
 * @param filename 文件名
 * @param headers 表头映射
 */
export const exportToCSV = (data: any[], filename: string = 'export.csv', headers?: Record<string, string>): void => {
  if (data.length === 0) return;

  const keys = headers ? Object.keys(headers) : Object.keys(data[0]);
  const headerRow = headers ? keys.map((key) => headers[key]).join(',') : keys.join(',');
  
  const csvContent = [
    headerRow,
    ...data.map((row) =>
      keys.map((key) => {
        const value = row[key];
        // 处理包含逗号的值
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // 添加BOM以支持中文
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * 高亮搜索关键词
 * @param text 文本
 * @param keyword 关键词
 */
export const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword || !text) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * 截断文本
 * @param text 文本
 * @param length 长度
 * @param ellipsis 省略符号
 */
export const truncateText = (text: string, length: number, ellipsis: string = '...'): string => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + ellipsis;
};

/**
 * 验证手机号
 * @param phone 手机号
 */
export const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

/**
 * 验证邮箱
 * @param email 邮箱
 */
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * 获取随机颜色
 */
export const getRandomColor = (): string => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#C0392B', '#8E44AD', '#2980B9'];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * 防抖函数
 * @param fn 函数
 * @param delay 延迟时间(ms)
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number = 300) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param fn 函数
 * @param delay 延迟时间(ms)
 */
export const throttle = <T extends (...args: any[]) => any>(fn: T, delay: number = 300) => {
  let lastTime = 0;
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
};

