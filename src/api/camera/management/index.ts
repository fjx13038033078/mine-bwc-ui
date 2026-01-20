import request from '@/utils/request';
import { CameraManagementVO, CameraManagementQuery, CameraManagementForm } from './types';
import { AxiosPromise } from 'axios';

/**
 * 查询执法视频信息管理列表
 * @param query 查询参数
 */
export function listCameraManagement(query?: CameraManagementQuery): AxiosPromise<TableDataInfo<CameraManagementVO>> {
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
    url: 'camera/management',
    method: 'put',
    data: data
  });
}

/**
 * 删除执法视频信息管理
 * @param videoIds 视频ID数组
 */
export function delCameraManagement(videoIds: (number | string)[] | number | string): AxiosPromise<void> {
  return request({
    url: 'camera/management/' + videoIds,
    method: 'delete'
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
