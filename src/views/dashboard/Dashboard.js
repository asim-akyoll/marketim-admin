import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'

import { useDashboardSummary } from '../../hooks/dashboard/useDashboardSummary'
import { useStatusChart } from '../../hooks/dashboard/useStatusChart'
import { formatTRY } from '../../utils/format'
import { statusColor, statusLabelTR } from '../../utils/orderUi'

import { useNavigate } from 'react-router-dom'

import StatCard from '../../components/dashboard/StatCard'
import RecentOrdersTable from '../../components/dashboard/RecentOrdersTable'

import { getAdminLowStockCount } from '../../api/products'

const Dashboard = () => {
  // ✅ HOOK’LAR HER ZAMAN EN ÜSTTE
  const { data, loading, error } = useDashboardSummary()

  const [range, setRange] = React.useState('week')
  const { data: chartData, loading: chartLoading, error: chartError } = useStatusChart(range)

  const [lowStockCount, setLowStockCount] = useState(0)

  const navigate = useNavigate()

  // ✅ Low Stock count çek (threshold=5)
  useEffect(() => {
    const run = async () => {
      try {
        const c = await getAdminLowStockCount(5)
        setLowStockCount(c)
      } catch {
        setLowStockCount(0)
      }
    }
    run()
  }, [])

  // ✅ return'ler hook'lardan sonra
  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <CSpinner size="sm" />
        <span className="text-body-secondary">Veriler yükleniyor...</span>
      </div>
    )
  }

  if (error) {
    return (
      <CAlert color="danger">
        Dashboard verisi alınamadı. (Örn: token / backend bağlantısı) <br />
        <small className="text-body-secondary">{error?.message}</small>
      </CAlert>
    )
  }

  if (!data) {
    return <CAlert color="warning">Dashboard verisi boş geldi.</CAlert>
  }

  const { todayOrderCount, pending, delivered, cancelled, totalOrders, revenue, recentOrders } =
    data

  return (
    <>
      {/* ÜST KARTLAR */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol sm={6} lg={3}>
          <StatCard title="Bugünkü Sipariş" value={todayOrderCount} />
        </CCol>

        <CCol sm={6} lg={3}>
          <StatCard title="Bekleyen" value={pending} subtitle={`Toplam: ${totalOrders}`} />
        </CCol>

        <CCol sm={6} lg={3}>
          <StatCard title="Teslim" value={delivered} subtitle={`Toplam: ${totalOrders}`} />
        </CCol>

        <CCol sm={6} lg={3}>
          <StatCard title="İptal" value={cancelled} subtitle={`Toplam: ${totalOrders}`} />
        </CCol>
      </CRow>

      {/* CİRO KARTLARI */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol md={4}>
          <StatCard title="Bugün Ciro" value={formatTRY(revenue?.today ?? 0)} />
        </CCol>
        <CCol md={4}>
          <StatCard title="Son 7 Gün Ciro" value={formatTRY(revenue?.last7Days ?? 0)} />
        </CCol>
        <CCol md={4}>
          <StatCard title="Bu Ay Ciro" value={formatTRY(revenue?.thisMonth ?? 0)} />
        </CCol>
      </CRow>

      {/* ✅ LOW STOCK KARTI (UX POLISH) */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol md={4}>
          <StatCard
            title="Low Stock"
            value={lowStockCount}
            subtitle="Stok ≤ 5"
            onClick={() => navigate('/products/low-stock')}
          />
        </CCol>
      </CRow>

      {/* STATUS DAĞILIMI */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="d-flex align-items-center justify-content-between">
              <span className="fw-semibold">Durum Dağılımı</span>

              <CButtonGroup>
                <CButton
                  color={range === 'today' ? 'primary' : 'secondary'}
                  variant={range === 'today' ? undefined : 'outline'}
                  onClick={() => setRange('today')}
                >
                  Bugün
                </CButton>
                <CButton
                  color={range === 'week' ? 'primary' : 'secondary'}
                  variant={range === 'week' ? undefined : 'outline'}
                  onClick={() => setRange('week')}
                >
                  7 Gün
                </CButton>
                <CButton
                  color={range === 'month' ? 'primary' : 'secondary'}
                  variant={range === 'month' ? undefined : 'outline'}
                  onClick={() => setRange('month')}
                >
                  Ay
                </CButton>
              </CButtonGroup>
            </CCardHeader>

            <CCardBody>
              {chartLoading && (
                <div className="d-flex align-items-center gap-2">
                  <CSpinner size="sm" />
                  <span className="text-body-secondary">Durum verileri yükleniyor...</span>
                </div>
              )}

              {chartError && (
                <CAlert color="danger">
                  Grafik verisi alınamadı. <br />
                  <small className="text-body-secondary">{chartError?.message}</small>
                </CAlert>
              )}

              {!chartLoading && !chartError && (
                <div className="d-flex gap-3 flex-wrap">
                  {(chartData?.items ?? []).map((it) => (
                    <CCard key={it.status} style={{ minWidth: 220 }}>
                      <CCardBody className="d-flex align-items-center justify-content-between">
                        <div>
                          <div className="text-body-secondary small">Durum</div>
                          <div className="fw-semibold">{statusLabelTR(it.status)}</div>
                        </div>
                        <div className="text-end">
                          <CBadge color={statusColor(it.status)} className="fs-6">
                            {it.count}
                          </CBadge>
                        </div>
                      </CCardBody>
                    </CCard>
                  ))}

                  {(chartData?.items ?? []).length === 0 && (
                    <div className="text-body-secondary">
                      Seçilen tarih aralığında görüntülenecek veri bulunmuyor.
                    </div>
                  )}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* SON 5 SİPARİŞ */}
      <RecentOrdersTable orders={recentOrders} />
    </>
  )
}

export default Dashboard
