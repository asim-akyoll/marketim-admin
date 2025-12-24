import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { getAdminLowStockCount } from '../api/products'

const DefaultLayout = () => {
  const [lowStockCount, setLowStockCount] = useState(0)
  const location = useLocation()

  const fetchLowStockCount = async () => {
    try {
      const count = await getAdminLowStockCount(10) // threshold = 10
      setLowStockCount(count)
    } catch (e) {
      setLowStockCount(0)
    }
  }

  useEffect(() => {
    fetchLowStockCount()
  }, [])

  useEffect(() => {
    fetchLowStockCount()
  }, [location.pathname])

  return (
    <div>
      <AppSidebar lowStockCount={lowStockCount} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
