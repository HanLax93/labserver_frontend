import request from '@/utils/request'

const api_name = '/admin'

export default {
  tasks() {
    return request({
      url: `${api_name}/tasks`,
      method: 'get'
    })
  },
  approve(name) {
    return request({
      url: `${api_name}/approve/${name}`,
      method: 'post'
    })
  },
  decline(name) {
    return request({
      url: `${api_name}/decline/${name}`,
      method: 'post'
    })
  }
}