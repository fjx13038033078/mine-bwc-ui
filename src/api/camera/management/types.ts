/**
 * 执法视频信息管理 类型定义
 */

/**
 * 执法视频信息 VO
 */
export interface CameraManagementVO {
  /** 视频ID（唯一标识） */
  videoId: number;
  /** 来源设备 */
  deviceId: string;
  /** 用户编号/执法人员编号（采集者/使用者） */
  userCode: string;
  /** 用户姓名 */
  userName: string;
  /** 上传时间（入库时间戳） */
  uploadTime: string;
  /** 单位编号 */
  deptId: number;
  /** 单位名称 */
  deptName?: string;
  /** 拍摄时间（视频实际拍摄时间） */
  shootTime: string;
  /** 视频时长显示（如：05:30） */
  durationDisplay: string;
  /** 媒体类型（mp4/mov/avi等） */
  mediaType: string;
  /** 文件描述（如：巡检焊割作业现场记录） */
  fileDescription: string;
  /** 存储位置（对象存储URL/文件系统路径） */
  storageLocation: string;
  /** 文件标记（预留字段） */
  fileMark: string;
  /** 数据来源（执法记录仪自动上传/手动上传/外部导入） */
  dataSource: string;
  /** AI检测状态（0:未检测,1:检测中,2:检测完成,3:检测失败） */
  aiCheckStatus: number;
  /** AI检测结果（JSON结构化描述） */
  aiCheckResult: string;
  /** 数据状态（1:正常,0:删除） */
  dataStatus: number;
  /** 创建时间 */
  createTime?: string;
  /** OSS文件ID */
  ossId?: number;
  /** 文件URL（通过ossId翻译获取） */
  url?: string;
}

/**
 * 执法视频信息 查询参数
 */
export interface CameraManagementQuery extends PageQuery {
  /** 来源设备 */
  deviceId?: string;
  /** 用户编号/执法人员编号 */
  userCode?: string;
  /** 用户姓名 */
  userName?: string;
  /** 单位编号 */
  deptId?: number;
  /** 媒体类型 */
  mediaType?: string;
  /** 数据来源 */
  dataSource?: string;
  /** AI检测状态 */
  aiCheckStatus?: number;
  /** 数据状态 */
  dataStatus?: number;
  /** 拍摄时间范围 */
  params?: {
    beginShootTime?: string;
    endShootTime?: string;
  };
}

/**
 * 执法视频信息 表单
 */
export interface CameraManagementForm {
  /** 视频ID */
  videoId?: number;
  /** 来源设备 */
  deviceId?: string;
  /** 用户编号 */
  userCode?: string;
  /** 用户姓名 */
  userName?: string;
  /** 上传时间 */
  uploadTime?: string;
  /** 单位编号 */
  deptId?: number;
  /** 拍摄时间 */
  shootTime?: string;
  /** 视频时长显示 */
  durationDisplay?: string;
  /** 媒体类型 */
  mediaType?: string;
  /** 文件描述 */
  fileDescription?: string;
  /** 存储位置 */
  storageLocation?: string;
  /** 文件标记 */
  fileMark?: string;
  /** 数据来源 */
  dataSource?: string;
  /** AI检测状态 */
  aiCheckStatus?: number;
  /** AI检测结果 */
  aiCheckResult?: string;
  /** 数据状态 */
  dataStatus?: number;
}
