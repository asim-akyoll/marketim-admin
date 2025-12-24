import api from './axios'

export const getAdminSettings = async () => {
  const res = await api.get('/admin/settings')
  return res.data
}

export const updateAdminSettings = async (payload) => {
  const res = await api.patch('/admin/settings', payload)
  return res.data
}

export const clearAdminCache = async () => {
  const res = await api.post('/admin/system/cache/clear')
  return res.data
}
