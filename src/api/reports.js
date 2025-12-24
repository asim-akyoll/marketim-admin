import api from './axios'

// GET /api/admin/reports?type=ORDER&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export const getAdminReportPdf = async ({ type, startDate, endDate }) => {
  const res = await api.get('/admin/reports', {
    params: { type, startDate, endDate },
    responseType: 'blob', // ✅ PDF binary için şart
    headers: { Accept: 'application/pdf' },
  })
  return res.data // Blob
}
