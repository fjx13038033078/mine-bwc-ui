import request from '@/utils/request';

/**
 * 视频事件数据
 */
export interface VideoEvent {
  event_description: string;
  date: string;
  start_time: string;
  end_time: string;
  user_number: string;
  unit_number: string;
  serial_number: string;
}

/**
 * 视频上传响应数据结构
 */
export interface VideoUploadResponse {
  code: number;
  msg: string;
  data: {
    success: boolean;
    message: string;
    upload_info: {
      remote_path: string;
      filename: string;
    };
    analysis_result: {
      success: boolean;
      events: VideoEvent[];
      total_events: number;
    };
    upload_file_name: string;
    upload_file_size: string;
    upload_time: string;
    file_format: string;
    file_size_bytes: number;
  };
}

/**
 * 上传视频文件进行分析
 * @param data 文件表单数据
 * @param onUploadProgress 上传进度回调
 */
export function uploadVideo(data: FormData, onUploadProgress?: (progressEvent: any) => void) {
  return request({
    url: 'camera/management/upload',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onUploadProgress
  });
}

export default {
  uploadVideo
};
