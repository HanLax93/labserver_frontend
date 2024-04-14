import request from '@/utils/request'

const api_name = '/admin'

export default {
  queryUserPage(page, limit, userQueryVo) {
    return request({
      url: `${api_name}/${page}/${limit}`,
      method: 'get',
      params: userQueryVo
    })
  },
  queryUserByUsername(username) {
    return request({
      url: `${api_name}/get/${username}`,
      method: 'get'
    })
  },
  editUser(user) {
    return request({
      url: `${api_name}/update`,
      method: 'put',
      data: user
    })
  },
  deleteUser(username) {
    return request({
      url: `${api_name}/remove/${username}`,
      method: 'post'
    })
  }
}
