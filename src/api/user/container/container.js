import request from '@/utils/request'

const api_name = '/user'

export default {
  allContainers() {
    return request({
      url: `${api_name}/container`,
      method: 'get'
    })
  },
  startRunning() {
    return request({
      url: `${api_name}/run`,
      method: 'get'
    })
  },
  startRunningSSH() {
    return request({
      url: `${api_name}/runSSH`,
      method: 'get'
    })
  }
}
