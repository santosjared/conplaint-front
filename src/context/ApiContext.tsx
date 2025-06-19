// src/context/ApiContext.tsx
import { createContext, ReactNode, useEffect, useRef } from 'react'
import { ApiValuesType } from './types'
import { instance } from 'src/configs/axios'
import { useAuth } from 'src/hooks/useAuth'

const defaultProvider: ApiValuesType = {
  get: () => Promise.resolve({}),
  post: () => Promise.resolve(),
  put: () => Promise.resolve(),
  delete: () => Promise.resolve()
}

const ApiContext = createContext(defaultProvider)

const ApiProvider = ({ children }: { children: ReactNode }) => {

  const { tokens, refresh } = useAuth()

  const isRefreshingRef = useRef(false)
  const pendingQueueRef = useRef<Array<() => void>>([])

  useEffect(() => {
    const requestInterceptor = instance.interceptors.request.use(
      config => {
        if (tokens?.accesToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${tokens.accesToken}`
        }
        return config
      },
      error => Promise.reject(error)
    )

    const responseInterceptor = instance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config

        const isUnauthorized =
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes('/auth/refresh-token')

        if (!isUnauthorized) return Promise.reject(error)

        originalRequest._retry = true

        const cleanRequest = {
          method: originalRequest.method,
          url: originalRequest.url,
          data: originalRequest.data,
          params: originalRequest.params,
          baseURL: originalRequest.baseURL,
          timeout: originalRequest.timeout,
          withCredentials: originalRequest.withCredentials
        }

        return new Promise((resolve, reject) => {
          pendingQueueRef.current.push(() => {
            instance(cleanRequest).then(resolve).catch(reject)
          })

          if (!isRefreshingRef.current) {
            isRefreshingRef.current = true

            refresh()
              .then(() => {
                pendingQueueRef.current.forEach(fn => fn())
                pendingQueueRef.current = []
              })
              .catch(err => {
                pendingQueueRef.current = []
                reject(err)
              })
              .finally(() => {
                isRefreshingRef.current = false
              })
          }
        })
      }
    )

    return () => {
      instance.interceptors.request.eject(requestInterceptor)
      instance.interceptors.response.eject(responseInterceptor)
    }
  }, [tokens?.refreshToken])

  const get = (endpoint: string, params?: any) =>
    instance.get(endpoint, { params }).then(res => res.data)

  const post = (endpoint: string, data: any) =>
    instance.post(endpoint, data).then(res => res.data)

  const put = (endpoint: string, data: any) =>
    instance.put(endpoint, data).then(res => res.data)

  const del = (endpoint: string, params?: any) =>
    instance.delete(endpoint, { params }).then(res => res.data)

  return (
    <ApiContext.Provider value={{ get, post, put, delete: del }}>
      {children}
    </ApiContext.Provider>
  )
}

export { ApiContext, ApiProvider }
