// src/hooks/dashboard/useStatusChart.js
import { useCallback, useEffect, useState } from 'react'
import { getAdminDashboardStatusChart } from '../../api/dashboard'

export const useStatusChart = (range = 'week') => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchChart = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const payload = await getAdminDashboardStatusChart(range)
      setData(payload)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    fetchChart()
  }, [fetchChart])

  return { data, loading, error, refetch: fetchChart }
}
