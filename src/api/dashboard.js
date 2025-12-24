// src/api/dashboard.js
import api from './axios'

// GET /api/admin/dashboard/summary
export const getAdminDashboardSummary = async () => {
  const res = await api.get('/admin/dashboard/summary')
  return res.data
}

// GET /api/admin/dashboard/status-chart?range=week
export const getAdminDashboardStatusChart = async (range = 'week') => {
  const res = await api.get('/admin/dashboard/status-chart', { params: { range } })
  return res.data
}
