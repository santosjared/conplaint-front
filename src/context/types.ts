export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type RegisterParams = {
  email: string
  username: string
  password: string
}

export type UserDataType = {
  role: {
    name: string
    permissions: []
  }
  name: string,
  lastName: string,
  email: string,
  userId: string,
  rememberMe?: boolean
}

export type Tokens = {
  accesToken: string
  refreshToken: string
}
export type AuthValuesType = {
  tokens: Tokens
  loading: boolean
  loadingRefresh: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  refresh: () => Promise<void>
}

export type ApiValuesType = {
  get: (endpoint: string, param?: {}) => Promise<any>
  put: (endpoint: string, data: { [key: string]: any; }) => Promise<any>
  post: (endpoint: string, data: { [key: string]: any; }) => Promise<any>
  delete: (endpoint: string, param?: {}) => Promise<any>
}
