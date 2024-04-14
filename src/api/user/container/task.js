import request from '@/utils/request'

const api_name = '/user'

export default {
  tasks() {
    return request({
      url: `${api_name}/task`,
      method: 'get'
    })
  }
}