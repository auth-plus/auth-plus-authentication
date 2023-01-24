export interface User {
  id: string
  name: string
  email: string
  info: UserInfo
}

export interface ShallowUser {
  id: string
  name: string
  email: string
}

export interface UserInfo {
  phone: string | null
  deviceId: string | null
  googleAuth: string | null
}
