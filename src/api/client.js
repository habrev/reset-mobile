import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_URL = 'https://reset-backend-7vl8.onrender.com'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refresh = await SecureStore.getItemAsync('refresh_token')

      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/token/refresh/`, { refresh })
          await SecureStore.setItemAsync('access_token', res.data.access)
          if (res.data.refresh) {
            await SecureStore.setItemAsync('refresh_token', res.data.refresh)
          }
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`
          return api(originalRequest)
        } catch {
          await SecureStore.deleteItemAsync('access_token')
          await SecureStore.deleteItemAsync('refresh_token')
          await SecureStore.deleteItemAsync('user')
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
