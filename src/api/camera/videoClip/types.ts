/**
 * 视频切片 类型定义
 */

/** 单个切片 VO */
export interface VideoClipVO {
  /** 切片ID */
  clipId: number;
  /** 切割任务ID */
  taskId: string;
  /** 关联视频ID */
  videoId: number;
  /** 原视频文件名 */
  sourceFileName?: string;
  /** 原视频切分出的有效片段总数 */
  sourceClipCount?: number;
  /** 切片序号（从0开始） */
  clipIndex: number;
  /** MinIO 对象名称 */
  objectName: string;
  /** 预签名访问URL */
  url: string;
  /** 起始时间（秒） */
  startSecond: number;
  /** 结束时间（秒） */
  endSecond: number;
  /** 时长（秒） */
  durationSeconds: number;
  /** 文件大小（字节） */
  fileSize: number;
  /** 切片状态：0-处理中 1-完成 2-失败 */
  clipStatus: number;
  /** 失败信息 */
  errorMessage?: string;
  /** 创建时间 */
  createTime?: string;
}

/** 查询参数 */
export interface VideoClipQuery extends PageQuery {
  /** 原视频文件名 */
  sourceFileName?: string;
  /** 关联视频ID */
  videoId?: number;
  /** 任务ID */
  taskId?: string;
  /** 切片状态 */
  clipStatus?: number;
}

/** 发起切割响应 */
export interface SubmitClipResult {
  taskId: string;
}
