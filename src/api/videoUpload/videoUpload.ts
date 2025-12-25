import request from '@/utils/request';
import { UploadRequestOptions } from 'element-plus';
import { AxiosProgressEvent } from 'axios';

export const managementUpload = (
  data: UploadRequestOptions,
  options?: {
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  }
) => {
  return request({
    url: `/camera/camera/management/upload`,
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    onUploadProgress: options?.onUploadProgress
  });
};
