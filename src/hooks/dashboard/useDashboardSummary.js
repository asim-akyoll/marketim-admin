// src/hooks/dashboard/useDashboardSummary.js
import { useCallback, useEffect, useState } from 'react'
import { getAdminDashboardSummary } from '../../api/dashboard'

export const useDashboardSummary = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const payload = await getAdminDashboardSummary()
      setData(payload)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { data, loading, error, refetch: fetchSummary }
}
