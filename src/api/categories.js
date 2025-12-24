// src/api/categories.js
import api from './axios'

// PUBLIC (ProductForm dropdown vs.)
export const getCategories = async () => {
  const res = await api.get('/categories')
  return res.data
}

// ADMIN LIST (pagination + filter + search)
export const getAdminCategories = async ({
  page = 0,
  size = 20,
  q,
  active,
  sort = 'id',
  dir = 'desc',
} = {}) => {
  const params = { page, size, sort, dir }
  if (q != null && String(q).trim() !== '') params.q = String(q).trim()
  if (active === true || active === false) params.active = String(active)

  const res = await api.get('/admin/categories', { params })
  return res.data
}

export const getAdminCategoryById = async (id) => {
  const res = await api.get(`/admin/categories/${id}`)
  return res.data
}

export const createAdminCategory = async (payload) => {
  const res = await api.post('/admin/categories', payload)
  return res.data
}

export const updateAdminCategory = async (id, payload) => {
  const res = await api.put(`/admin/categories/${id}`, payload)
  return res.data
}

export const toggleAdminCategoryActive = async (id) => {
  const res = await api.patch(`/admin/categories/${id}/toggle-active`)
  return res.data
}
