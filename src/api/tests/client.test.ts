import type { AxiosRequestHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { BASE_API_ENDPOINT, createClient, initApiClient, useApi } from '../client'

const getAccessTokenSilently = vi.fn()
const isAuthenticated = ref(false)

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    getAccessTokenSilently,
    isAuthenticated,
  }),
}))

vi.mock('../../config/env', () => ({
  auth0Audience: 'https://test-audience.example.com',
}))

describe('api/client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isAuthenticated.value = false
    initApiClient()
  })

  describe('BASE_API_ENDPOINT', () => {
    it('exports the base API endpoint', () => {
      expect(BASE_API_ENDPOINT).toBe('/api')
    })
  })

  describe('createClient', () => {
    it('creates axios instance without token provider', () => {
      const client = createClient()
      expect(client).toBeDefined()
      expect(client.get).toBeDefined()
      expect(client.post).toBeDefined()
    })

    it('creates axios instance with token provider', () => {
      const getToken = vi.fn()
      const client = createClient(getToken)
      expect(client).toBeDefined()
    })

    it('adds auth header for API requests when token is available', async () => {
      const getToken = vi.fn().mockResolvedValue('test-token')
      const client = createClient(getToken)

      const requestConfig = { url: '/api/test', headers: {} as AxiosRequestHeaders }
      const interceptor = client.interceptors.request.handlers![0]
      const result = await interceptor!.fulfilled(requestConfig)

      expect(getToken).toHaveBeenCalled()
      expect(result.headers.get('Authorization')).toBe('Bearer test-token')
    })

    it('does not add auth header for non-API requests', async () => {
      const getToken = vi.fn().mockResolvedValue('test-token')
      const client = createClient(getToken)

      const requestConfig = { url: '/other/endpoint', headers: {} as AxiosRequestHeaders }
      const interceptor = client.interceptors.request.handlers![0]
      const result = await interceptor!.fulfilled(requestConfig)

      expect(getToken).not.toHaveBeenCalled()
      expect(result.headers).toEqual({})
    })

    it('does not add auth header when token is null', async () => {
      const getToken = vi.fn().mockResolvedValue(null)
      const client = createClient(getToken)

      const requestConfig = { url: '/api/test', headers: {} as AxiosRequestHeaders }
      const interceptor = client.interceptors.request.handlers![0]
      const result = await interceptor!.fulfilled(requestConfig)

      expect('Authorization' in result.headers).toBe(false)
    })

    it('handles request interceptor errors', async () => {
      const getToken = vi.fn()
      const client = createClient(getToken)

      const interceptor = client.interceptors.request.handlers![0]
      const error = new Error('Request failed')

      return expect(interceptor!.rejected?.(error)).rejects.toThrow('Request failed')
    })

    it('converts non-Error to Error in rejection', () => {
      const getToken = vi.fn()
      const client = createClient(getToken)

      const interceptor = client.interceptors.request.handlers![0]

      return expect(interceptor!.rejected!('string error')).rejects.toThrow('string error')
    })
  })

  describe('initApiClient', () => {
    it('returns client when not authenticated', () => {
      isAuthenticated.value = false
      const client = initApiClient()
      expect(client).toBeDefined()
    })

    it('returns client when authenticated', () => {
      isAuthenticated.value = true
      const client = initApiClient()
      expect(client).toBeDefined()
    })

    it('gets token silently when authenticated and making API request', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('auth0-token')

      const client = initApiClient()
      const interceptor = client.interceptors.request.handlers![0]
      const requestConfig = { url: '/api/test', headers: {} as AxiosRequestHeaders }

      await interceptor!.fulfilled(requestConfig)

      expect(getAccessTokenSilently).toHaveBeenCalledWith({
        authorizationParams: { audience: 'https://test-audience.example.com' },
      })
    })

    it('returns null token when not authenticated', async () => {
      isAuthenticated.value = false

      const client = initApiClient()
      const interceptor = client.interceptors.request.handlers![0]
      const requestConfig = { url: '/api/test', headers: {} as AxiosRequestHeaders }
      const result = await interceptor!.fulfilled(requestConfig)

      expect(getAccessTokenSilently).not.toHaveBeenCalled()
      expect('Authorization' in result.headers).toBe(false)
    })

    it('returns null token when getAccessTokenSilently throws', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockRejectedValue(new Error('Token error'))

      const client = initApiClient()
      const interceptor = client.interceptors.request.handlers![0]
      const requestConfig = { url: '/api/test', headers: {} as AxiosRequestHeaders }
      const result = await interceptor!.fulfilled(requestConfig)

      expect('Authorization' in result.headers).toBe(false)
    })
  })

  describe('useApi', () => {
    it('returns api methods', () => {
      const api = useApi()

      expect(api.client).toBeDefined()
      expect(api.get).toBeDefined()
      expect(api.post).toBeDefined()
      expect(api.put).toBeDefined()
      expect(api.patch).toBeDefined()
      expect(api.del).toBeDefined()
    })

    it('get calls client.get', async () => {
      const api = useApi()
      const getSpy = vi.spyOn(api.client, 'get').mockResolvedValue({ data: 'test' })

      await api.get('/api/test', { params: { foo: 'bar' } })

      expect(getSpy).toHaveBeenCalledWith('/api/test', { params: { foo: 'bar' } })
    })

    it('post calls client.post', async () => {
      const api = useApi()
      const postSpy = vi.spyOn(api.client, 'post').mockResolvedValue({ data: 'test' })

      await api.post('/api/test', { body: 'data' }, { headers: {} })

      expect(postSpy).toHaveBeenCalledWith('/api/test', { body: 'data' }, { headers: {} })
    })

    it('put calls client.put', async () => {
      const api = useApi()
      const putSpy = vi.spyOn(api.client, 'put').mockResolvedValue({ data: 'test' })

      await api.put('/api/test', { body: 'data' })

      expect(putSpy).toHaveBeenCalledWith('/api/test', { body: 'data' }, undefined)
    })

    it('patch calls client.patch', async () => {
      const api = useApi()
      const patchSpy = vi.spyOn(api.client, 'patch').mockResolvedValue({ data: 'test' })

      await api.patch('/api/test', { body: 'data' })

      expect(patchSpy).toHaveBeenCalledWith('/api/test', { body: 'data' }, undefined)
    })

    it('del calls client.delete', async () => {
      const api = useApi()
      const deleteSpy = vi.spyOn(api.client, 'delete').mockResolvedValue({ data: 'test' })

      await api.del('/api/test')

      expect(deleteSpy).toHaveBeenCalledWith('/api/test', undefined)
    })
  })
})
