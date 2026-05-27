import request from '@/utils/request';
import type { VideoClipVO, VideoClipQuery, SubmitClipResult } from './types';
import type { AxiosPromise } from 'axios';

/**
 * 分页查询切片列表
 */
export function listVideoClip(query?: VideoClipQuery): AxiosPromise<any> {
  return request({
    url: 'camera/clip/list',
    method: 'get',
    params: query
  });
}

/**
 * 根据视频ID查询切片列表
 */
export function listClipByVideoId(videoId: number | string): AxiosPromise<VideoClipVO[]> {
  return request({
    url: `camera/clip/byVideo/${videoId}`,
    method: 'get'
  });
}

/**
 * 根据任务ID查询切片列表
 */
export function listClipByTaskId(taskId: string): AxiosPromise<VideoClipVO[]> {
  return request({
    url: `camera/clip/byTask/${taskId}`,
    method: 'get'
  });
}

/**
 * 发起视频切割任务
 * @param videoId 视频ID
 */
export function submitClipTask(videoId: number | string): AxiosPromise<SubmitClipResult> {
  return request({
    url: `camera/clip/submit/${videoId}`,
    method: 'post'
  });
}

/**
 * 刷新切片预签名URL
 * @param clipId 切片ID
 */
export function refreshClipUrl(clipId: number | string): AxiosPromise<VideoClipVO> {
  return request({
    url: `camera/clip/refreshUrl/${clipId}`,
    method: 'get'
  });
}

/**
 * 删除切片
 * @param clipIds 切片ID数组
 */
export function delVideoClip(clipIds: (number | string)[]): AxiosPromise<void> {
  return request({
    url: 'camera/clip/remove',
    method: 'post',
    data: clipIds
  });
}
