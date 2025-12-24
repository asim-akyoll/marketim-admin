import api from './axios'

// GET /api/admin/products?page=0&size=20&active=true&categoryId=1&q=arm&sort=createdAt,desc
export const getAdminProducts = async (params = {}) => {
  const res = await api.get('/admin/products', { params })
  return res.data
}

// POST /api/admin/products
export const createAdminProduct = async (data) => {
  const res = await api.post('/admin/products', data)
  return res.data
}

// PUT /api/admin/products/{id}
export const updateAdminProduct = async (id, data) => {
  const res = await api.put(`/admin/products/${id}`, data)
  return res.data
}

// PATCH /api/admin/products/{id}/toggle-active
export const toggleAdminProductActive = async (id) => {
  const res = await api.patch(`/admin/products/${id}/toggle-active`)
  return res.data
}

// GET /api/admin/products/low-stock?threshold=5&page=0&size=20&sort=stock,asc
export const getAdminLowStockProducts = async (params = {}) => {
  const res = await api.get('/admin/products/low-stock', { params })
  return res.data
}

// GET /api/admin/products/{id}
export const getAdminProductById = async (id) => {
  const res = await api.get(`/admin/products/${id}`)
  return res.data
}

// Low stock count (totalElements üzerinden)
export const getAdminLowStockCount = async (threshold = 5) => {
  const res = await api.get('/admin/products/low-stock', {
    params: { threshold, page: 0, size: 1 },
  })
  return res.data?.totalElements ?? 0
}
