export type ErrCallbackType = (err: { [key: string]: string }) => void

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'permissions' | 'personal' | 'print' | 'acepted' | 'refused' | 'confirmed' | 'look' | 'manage'
export type Subjects = 'dashboard' | 'users' | 'roles' | 'shifts' | 'vehicles' | 'complaints' | 'recibidos' | 'asignes' | 'atender' | 'all'

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

export type Permission = {
  subject: Subjects
  action: Actions[]
  _id?: string
  __v?: string
}

export type Rol = {
  name: string,
  permissions: Permission[],
  description: string
  _id: string
  __v: string
}

export type UserDataType = {
  rol: Rol
  name: string,
  lastName: string,
  email: string,
  rememberMe?: boolean
  _id?: string
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  setLoading: (value: boolean) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
}

export type ApiValuesType = {
  get: (endpoint: string, param?: {}) => Promise<any>
  put: (endpoint: string, data: { [key: string]: any; }) => Promise<any>
  post: (endpoint: string, data: { [key: string]: any; }) => Promise<any>
  delete: (endpoint: string, param?: {}) => Promise<any>
}
