import axios from 'axios'
import { notify } from '../utils/toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// =======================
// REQUEST INTERCEPTOR
// =======================
api.interceptors.request.use(
  (config) => {
    const isAuthRequest = config.url?.includes('/auth/')
    if (!isAuthRequest) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// =======================
// RESPONSE INTERCEPTOR
// =======================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Oturum süresi doldu / token geçersiz
      localStorage.removeItem('token')
      notify.error('Oturum süresi doldu. Lütfen tekrar giriş yapın.')

      // HashRouter kullandığın için:
      window.location.href = '/#/login'
      return
    }

    if (status === 403) {
      notify.error('Bu işlem için yetkiniz yok.')
      // Sadece GET isteklerinde sayfaya yönlendir (aksiyonlarda kullanıcıyı sayfadan atmayalım)
      const method = error.config?.method?.toLowerCase()
      if (method === 'get') {
        window.location.href = '/#/403'
        return
      }
      return Promise.reject(error.response?.data || error)
    }

    // Diğer hatalar
    if (error.response?.data) {
      return Promise.reject(error.response.data)
    }

    return Promise.reject(error)
  },
)

export default api
