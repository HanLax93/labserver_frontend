import request from '@/utils/request'

const api_name = '/admin'

export default {
  allContainers() {
    return request({
      url: `${api_name}/allContainers`,
      method: 'get'
    })
  },
  startRunning(name) {
    return request({
      url: `${api_name}/run/${name}`,
      method: 'get'
    })
  },
  startRunningSSH(name) {
    return request({
      url: `${api_name}/runSSH/${name}`,
      method: 'get'
    })
  },
  removeContainer(name) {
    return request({
      url: `${api_name}/removeContainer/${name}`,
      method: 'delete'
    })
  }
}
