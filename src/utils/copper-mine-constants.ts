/**
 * 铜矿AI安全监控系统 - 业务常量定义
 */

// 部门列表
export const DEPARTMENTS = [
  { label: '采矿部', value: '采矿部' },
  { label: '安全部', value: '安全部' },
  { label: '技术部', value: '技术部' },
  { label: '设备部', value: '设备部' },
  { label: '后勤部', value: '后勤部' },
  { label: '机电部', value: '机电部' },
  { label: '运输部', value: '运输部' }
] as const;

// 设备状态
export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance',
  FAULT: 'fault'
} as const;

export const DEVICE_STATUS_OPTIONS = [
  { label: '在线', value: 'online', type: 'success' },
  { label: '离线', value: 'offline', type: 'info' },
  { label: '维护中', value: 'maintenance', type: 'warning' },
  { label: '故障', value: 'fault', type: 'danger' }
] as const;

// AI检测状态
export const AI_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export const AI_STATUS_OPTIONS = [
  { label: '待检测', value: 'pending', type: 'info' },
  { label: '检测中', value: 'processing', type: 'warning' },
  { label: '已完成', value: 'completed', type: 'success' },
  { label: '检测失败', value: 'failed', type: 'danger' }
] as const;

// 违规严重等级
export const VIOLATION_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const VIOLATION_SEVERITY_OPTIONS = [
  { label: '一般', value: 'low', type: 'info', color: '#909399' },
  { label: '较重', value: 'medium', type: 'warning', color: '#E6A23C' },
  { label: '严重', value: 'high', type: 'danger', color: '#F56C6C' },
  { label: '特别严重', value: 'critical', type: 'danger', color: '#C0392B' }
] as const;

// 作业类型
export const WORK_TYPES = [
  { label: '焊割作业', value: '焊割作业', color: '#F56C6C' },
  { label: '吊装作业', value: '吊装作业', color: '#E6A23C' },
  { label: '高处作业', value: '高处作业', color: '#409EFF' },
  { label: '受限空间作业', value: '受限空间作业', color: '#67C23A' },
  { label: '动火作业', value: '动火作业', color: '#F56C6C' },
  { label: '电气作业', value: '电气作业', color: '#909399' },
  { label: '爆破作业', value: '爆破作业', color: '#C0392B' },
  { label: '通用作业', value: '通用作业', color: '#606266' }
] as const;

// AI技能定义
export interface AISkill {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  tagType: 'success' | 'info' | 'warning' | 'danger' | 'primary';
  workTypes: string[]; // 适用的作业类型
}

export const AI_SKILLS: AISkill[] = [
  {
    id: 'violation_detection',
    name: '违规行为识别',
    description: '检测矿工违规操作、未佩戴安全装备等行为',
    category: '安全监控',
    icon: 'WarningFilled',
    color: '#F56C6C',
    tagType: 'danger',
    workTypes: ['通用作业']
  },
  {
    id: 'welding_standard',
    name: '焊割作业规范识别',
    description: '识别焊割作业中的气瓶摆放、安全距离等规范',
    category: '专项作业',
    icon: 'Fire',
    color: '#E6A23C',
    tagType: 'warning',
    workTypes: ['焊割作业', '动火作业']
  },
  {
    id: 'lifting_standard',
    name: '吊装作业规范识别',
    description: '监控吊装作业中的操作规范和安全措施',
    category: '专项作业',
    icon: 'Connection',
    color: '#409EFF',
    tagType: 'primary',
    workTypes: ['吊装作业']
  },
  {
    id: 'ppe_detection',
    name: '个人防护装备检测',
    description: '检测安全帽、防护服、安全带等个人防护装备佩戴情况',
    category: '安全监控',
    icon: 'User',
    color: '#67C23A',
    tagType: 'success',
    workTypes: ['通用作业']
  },
  {
    id: 'confined_space',
    name: '受限空间作业监控',
    description: '监控受限空间作业的通风、监护等安全措施',
    category: '专项作业',
    icon: 'Box',
    color: '#909399',
    tagType: 'info',
    workTypes: ['受限空间作业']
  },
  {
    id: 'high_altitude',
    name: '高处作业安全监控',
    description: '监测高处作业安全带、防坠装置等防护措施',
    category: '专项作业',
    icon: 'Top',
    color: '#409EFF',
    tagType: 'primary',
    workTypes: ['高处作业']
  },
  {
    id: 'fire_hazard',
    name: '动火作业风险识别',
    description: '识别动火作业区域的灭火器材、隔离措施等',
    category: '专项作业',
    icon: 'HotWater',
    color: '#F56C6C',
    tagType: 'danger',
    workTypes: ['动火作业', '焊割作业']
  },
  {
    id: 'electrical_safety',
    name: '电气作业安全识别',
    description: '监控电气作业的绝缘措施、停送电操作等',
    category: '专项作业',
    icon: 'Lightning',
    color: '#E6A23C',
    tagType: 'warning',
    workTypes: ['电气作业']
  }
];

// 文件分类
export const FILE_CATEGORIES = [
  { label: '管理制度', value: '管理制度' },
  { label: '操作规程', value: '操作规程' },
  { label: '处罚条例', value: '处罚条例' },
  { label: '应急预案', value: '应急预案' },
  { label: '培训教材', value: '培训教材' },
  { label: '事故案例', value: '事故案例' },
  { label: '其他文件', value: '其他文件' }
] as const;

// 文件类型
export const FILE_TYPES = [
  { label: 'PDF文档', value: 'pdf' },
  { label: 'Word文档', value: 'docx' },
  { label: '图片', value: 'image' }
] as const;

// 违规行为类型（常见）
export const COMMON_VIOLATIONS = [
  '未佩戴安全帽',
  '未系安全带',
  '未穿防护服',
  '违章操作',
  '无证作业',
  '气瓶混放',
  '乙炔瓶平放',
  '吊装手扶',
  '高处抛物',
  '无监护人',
  '通风不良',
  '未配灭火器',
  '未验电',
  '未停电作业'
] as const;

// 违规类型选项（用于下拉选择）
export const VIOLATION_TYPES = [
  { label: '未佩戴安全帽', value: '未佩戴安全帽' },
  { label: '未系安全带', value: '未系安全带' },
  { label: '未穿防护服', value: '未穿防护服' },
  { label: '违规操作设备', value: '违规操作设备' },
  { label: '无证上岗', value: '无证上岗' },
  { label: '气瓶混放', value: '气瓶混放' },
  { label: '气瓶平放', value: '气瓶平放' },
  { label: '吊装违规', value: '吊装违规' },
  { label: '动火违规', value: '动火违规' },
  { label: '高处抛物', value: '高处抛物' },
  { label: '无监护人', value: '无监护人' },
  { label: '通风不良', value: '通风不良' }
] as const;

