// src/api/http.js
import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8080', // backend adresin
  headers: {
    'Content-Type': 'application/json',
  },
})

// REQUEST INTERCEPTOR (JWT)
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // AdminLTE’de kullandığın key buysa
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// RESPONSE INTERCEPTOR (ileride 401 vs yakalarız)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  },
)

export default http
