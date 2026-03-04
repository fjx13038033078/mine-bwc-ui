import request from '@/utils/request';
import { CameraManagementVO, CameraManagementQuery, CameraManagementForm, ManualReviewForm } from './types';
import { AxiosPromise } from 'axios';

/**
 * 查询执法视频信息管理列表
 * @param query 查询参数
 */
export function listCameraManagement(query?: CameraManagementQuery): AxiosPromise<CameraManagementVO[]> {
  return request({
    url: 'camera/management/list',
    method: 'get',
    params: query
  });
}

/**
 * 查询执法视频信息管理详细
 * @param videoId 视频ID
 */
export function getCameraManagement(videoId: number | string): AxiosPromise<CameraManagementVO> {
  return request({
    url: 'camera/management/' + videoId,
    method: 'get'
  });
}

/**
 * 新增执法视频信息管理
 * @param data 表单数据
 */
export function addCameraManagement(data: CameraManagementForm): AxiosPromise<void> {
  return request({
    url: 'camera/management',
    method: 'post',
    data: data
  });
}

/**
 * 修改执法视频信息管理
 * @param data 表单数据
 */
export function updateCameraManagement(data: CameraManagementForm): AxiosPromise<void> {
  return request({
    url: 'camera/management/edit',
    method: 'post',
    data: data
  });
}

/**
 * 删除执法视频信息管理
 * @param videoIds 视频ID数组
 */
export function delCameraManagement(videoIds: (number | string)[]): AxiosPromise<void> {
  return request({
    url: 'camera/management/remove',
    method: 'post',
    data: videoIds
  });
}

/**
 * 导出执法视频信息管理
 * @param query 查询参数
 */
export function exportCameraManagement(query?: CameraManagementQuery): AxiosPromise<Blob> {
  return request({
    url: 'camera/management/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
}

/**
 * 获取视频播放URL（预签名URL）
 * @param videoId 视频ID
 */
export function getVideoPlayUrl(videoId: number | string): AxiosPromise<string> {
  return request({
    url: 'camera/management/playUrl/' + videoId,
    method: 'get'
  });
}

/**
 * 提交人工复判结果
 * @param data 复判表单
 */
export function submitManualReview(data: ManualReviewForm): AxiosPromise<void> {
  return request({
    url: 'camera/management/review',
    method: 'post',
    data: data
  });
}
