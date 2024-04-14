import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: 'user/logout',
    method: 'get'
  })
}

export function changepassword(data) {
    return request({
      url: '/user/update',
      method: 'put',
      data
    })
}

export function getCurUser() {
    return request({
      url: '/user/getCurUser',
      method: 'get'
    })
}