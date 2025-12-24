import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CBadge,
  CButton,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAdminOrderById, updateAdminOrderStatus } from '../../api/orders'
import { formatTRY } from '../../utils/format'
import { statusColor, statusLabelTR } from '../../utils/orderUi'
import { toast } from 'react-toastify'
import { getAdminSettings } from '../../api/settings'

const STATUSES = ['PENDING', 'DELIVERED', 'CANCELLED']

const paymentMethodLabelTR = (m) => {
  if (!m) return '-'
  if (m === 'CASH') return 'Nakit'
  if (m === 'CARD') return 'Kart'
  return m
}

const paymentMethodColor = (m) => {
  if (m === 'CASH') return 'success'
  if (m === 'CARD') return 'info'
  return 'secondary'
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [minOrderAmount, setMinOrderAmount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('PENDING')

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const data = await getAdminOrderById(id)
      setOrder(data)
      setSelectedStatus(data?.status || 'PENDING')

      const settings = await getAdminSettings()
      setMinOrderAmount(settings?.minOrderAmount ?? 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onSaveStatus = async () => {
    if (!order) return

    setSaving(true)
    try {
      const updated = await updateAdminOrderStatus(order.id, selectedStatus)

      setOrder(updated)
      setSelectedStatus(updated.status)

      toast.success('Sipariş durumu güncellendi')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Durum güncellenirken bir hata oluştu'

      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <strong>Sipariş Detayı #{id}</strong>
        <CButton color="secondary" variant="outline" size="sm" onClick={() => navigate('/orders')}>
          Geri
        </CButton>
      </CCardHeader>

      <CCardBody>
        {loading && <div>Yükleniyor...</div>}

        {!loading && !order && <div>Sipariş bulunamadı.</div>}

        {!loading && order && (
          <>
            <CRow className="g-3 align-items-end mb-3">
              <CCol md={4}>
                <div className="mb-1 text-body-secondary">Mevcut Durum</div>
                <CBadge color={statusColor(order.status)}>{statusLabelTR(order.status)}</CBadge>
              </CCol>

              <CCol md={4}>
                <div className="mb-1 text-body-secondary">Yeni Durum</div>
                <CFormSelect
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusLabelTR(s)}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={4} className="d-flex justify-content-end gap-2">
                <CButton
                  color="primary"
                  disabled={saving || selectedStatus === order.status}
                  onClick={onSaveStatus}
                >
                  {saving ? 'Kaydediliyor...' : 'Status Güncelle'}
                </CButton>
              </CCol>
            </CRow>

            <CRow className="mb-3 g-3">
              <CCol md={4}>
                <div className="text-body-secondary">Toplam</div>
                <div className="fs-5">{formatTRY(order.totalAmount)}</div>
              </CCol>

              <CCol md={4}>
                <div className="text-body-secondary">Ödeme Yöntemi</div>
                <CBadge color={paymentMethodColor(order.paymentMethod)}>
                  {paymentMethodLabelTR(order.paymentMethod)}
                </CBadge>
              </CCol>

              <CCol md={4}>
                <div className="text-body-secondary">Adres</div>
                <div className="text-truncate" title={order.deliveryAddress || ''}>
                  {order.deliveryAddress || '-'}
                </div>
              </CCol>
              <CCol md={4}>
                <div className="text-body-secondary">Minimum Sipariş</div>
                <CBadge color="secondary">{formatTRY(minOrderAmount ?? 0)}</CBadge>
              </CCol>
            </CRow>

            <CTable responsive hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Ürün</CTableHeaderCell>
                  <CTableHeaderCell>Adet</CTableHeaderCell>
                  <CTableHeaderCell>Birim</CTableHeaderCell>
                  <CTableHeaderCell>Satır Toplam</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {(order.items || []).map((it, idx) => (
                  <CTableRow key={idx}>
                    <CTableDataCell>{it.productName}</CTableDataCell>
                    <CTableDataCell>{it.quantity}</CTableDataCell>
                    <CTableDataCell>{formatTRY(it.unitPrice)}</CTableDataCell>
                    <CTableDataCell>{formatTRY(it.lineTotal)}</CTableDataCell>
                  </CTableRow>
                ))}

                {(order.items || []).length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={4}>Ürün yok</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}
