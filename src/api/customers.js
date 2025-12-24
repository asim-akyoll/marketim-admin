import api from './axios'

// GET /api/admin/customers?q=&active=&page=0&size=10
export const getAdminCustomers = async (params = {}) => {
  const res = await api.get('/admin/customers', { params })
  return res.data
}

// PATCH /api/admin/customers/{id}/toggle-active
export const toggleAdminCustomerActive = async (id) => {
  const res = await api.patch(`/admin/customers/${id}/toggle-active`)
  return res.data
}

// ✅ GET /api/admin/customers/{id}
export const getAdminCustomerById = async (id) => {
  const res = await api.get(`/admin/customers/${id}`)
  return res.data
}

// ✅ GET /api/admin/customers/{id}/orders?page=0&size=10&sort=createdAt,desc
export const getAdminCustomerOrders = async (id, params = {}) => {
  const res = await api.get(`/admin/customers/${id}/orders`, { params })
  return res.data
}
