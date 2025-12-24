import api from './axios'

// GET /api/admin/stock-movements?productId=1&page=0&size=20&sort=createdAt,desc
export const getAdminStockMovements = async (params = {}) => {
  const res = await api.get('/admin/stock-movements', { params })
  return res.data
}
