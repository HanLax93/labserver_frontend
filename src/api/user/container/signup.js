import request from '@/utils/request'

const api_name = '/user'

export default {
  signup(applyVo) {
    return request({
      url: `${api_name}/apply`,
      method: 'post',
      data: applyVo
    })
  }
}