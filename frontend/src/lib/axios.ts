import axios, { AxiosError, AxiosRequestConfig } from 'axios'

let accessTokenRef: (() => string | null) | null = null
let refreshCallback: (() => Promise<string | null>) | null = null
let signOutCallback: (() => void) | null = null

export function configureAxios(
  getToken: () => string | null,
  doRefresh: () => Promise<string | null>,
  doSignOut: () => void,
) {
  accessTokenRef = getToken
  refreshCallback = doRefresh
  signOutCallback = doSignOut
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true, // send cookies on cross-origin requests
})

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = accessTokenRef?.()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: silent token refresh on 401
let isRefreshing = false
type FailedRequest = {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}
let failedQueue: FailedRequest[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshCallback?.()
        if (!newToken) throw new Error('Refresh failed')

        processQueue(null, newToken)

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        signOutCallback?.()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
