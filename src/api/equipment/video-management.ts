import request from '@/utils/request';

/**
 * 查询视频列表
 * @param params 查询参数
 */
export const videoList = (params?: object) => {
  return request({
    url: '/system/camera/management/list',
    method: 'get',
    params: params
  });
};