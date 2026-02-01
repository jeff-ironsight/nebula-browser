import { useAuth0 } from '@auth0/auth0-vue'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios, { AxiosHeaders } from 'axios'

import { auth0Audience } from '../config/env'

export const BASE_API_ENDPOINT = '/api'

type TokenProvider = () => Promise<string | null>
type ApiClient = AxiosInstance

let apiClient: ApiClient | null = null

const addNebulaInterceptor = (instance: AxiosInstance, getToken?: TokenProvider) => {
  if (!getToken) {
    return instance
  }

  instance.interceptors.request.use(
    async (config) => {
      if (!config.url?.startsWith(BASE_API_ENDPOINT)) {
        return config
      }

      const token = await getToken()
      if (token) {
        const headers = AxiosHeaders.from(config.headers)
        headers.set('Authorization', `Bearer ${token}`)
        config.headers = headers
      }

      return config
    },
    (error) =>
      Promise.reject(error instanceof Error ? error : new Error(String(error))),
  )

  return instance
}

export const createClient = (getToken?: TokenProvider) => {
  return addNebulaInterceptor(axios.create(), getToken)
}

export const initApiClient = () => {
  if (apiClient) {
    return apiClient
  }

  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  const getToken = async () => {
    if (!isAuthenticated.value) {
      return null
    }
    try {
      return await getAccessTokenSilently({
        authorizationParams: auth0Audience ? { audience: auth0Audience } : undefined,
      })
    } catch {
      return null
    }
  }

  apiClient = createClient(getToken)
  return apiClient
}

export const getApiClient = () => {
  if (!apiClient) {
    throw new Error('API client not initialized. Call initApiClient() in app setup.')
  }
  return apiClient
}

export const useApi = () => {
  const client = getApiClient()

  const get = <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    client.get<T>(url, config)

  const post = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    client.post<T>(url, data, config)

  const put = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    client.put<T>(url, data, config)

  const patch = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    client.patch<T>(url, data, config)

  const del = <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    client.delete<T>(url, config)

  return {
    client,
    get,
    post,
    put,
    patch,
    del,
  }
}
