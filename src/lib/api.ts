import axios from 'axios'
import { getApiToken } from './apiToken'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8001/api',
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = getApiToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
