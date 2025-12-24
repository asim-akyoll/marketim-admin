import api from './axios'

// GET /api/admin/orders?page=0&size=20&status=PENDING&sort=totalAmount,desc&id=12
export const getAdminOrders = async (params = {}) => {
  const res = await api.get('/admin/orders', { params })
  return res.data
}

// GET /api/admin/orders/stats
export const getAdminOrderStats = async () => {
  const res = await api.get('/admin/orders/stats')
  return res.data
}

// GET /api/admin/orders/{id}
export const getAdminOrderById = async (id) => {
  const res = await api.get(`/admin/orders/${id}`)
  return res.data
}

// PATCH /api/admin/orders/{id}/status
export const updateAdminOrderStatus = async (id, status) => {
  const res = await api.patch(`/admin/orders/${id}/status`, { status })
  return res.data
}
