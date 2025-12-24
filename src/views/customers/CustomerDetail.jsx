import { useCallback, useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
  CFormSelect,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { notify } from '../../utils/toast'
import {
  getAdminCustomerById,
  getAdminCustomerOrders,
  toggleAdminCustomerActive,
} from '../../api/customers'

const parseSize = (v) => {
  const n = Number(v)
  if (n === 10 || n === 20 || n === 50) return n
  return 10
}

const formatDateTimeTR = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('tr-TR')
}

const formatTRY = (value) => {
  if (value === null || value === undefined) return '-'
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return String(value)
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num)
}
const orderStatusTR = (status) => {
  switch (status) {
    case 'PENDING':
      return 'Bekliyor'
    case 'DELIVERED':
      return 'Teslim Edildi'
    case 'CANCELLED':
      return 'İptal Edildi'
    default:
      return status
  }
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState(null)
  const [loadingCustomer, setLoadingCustomer] = useState(false)
  const [toggling, setToggling] = useState(false)

  const [ordersPage, setOrdersPage] = useState(null)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const fetchCustomer = useCallback(async () => {
    setLoadingCustomer(true)
    try {
      const data = await getAdminCustomerById(id)
      setCustomer(data)
    } catch (e) {
      notify.error(e?.message || 'Müşteri bilgisi alınamadı')
    } finally {
      setLoadingCustomer(false)
    }
  }, [id])

  const fetchOrders = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoadingOrders(true)
      try {
        const data = await getAdminCustomerOrders(id, {
          page: page - 1,
          size,
          sort: 'createdAt,desc',
        })
        setOrdersPage(data)
      } catch (e) {
        notify.error(e?.message || 'Sipariş geçmişi alınamadı')
      } finally {
        if (!silent) setLoadingOrders(false)
      }
    },
    [id, page, size],
  )

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  useEffect(() => {
    fetchOrders({ silent: false })
  }, [fetchOrders])

  const onToggle = async () => {
    if (!customer || toggling) return
    setToggling(true)
    try {
      const updated = await toggleAdminCustomerActive(customer.id)
      setCustomer(updated)
      notify.success('Müşteri durumu güncellendi')
    } catch (e) {
      notify.error(e?.message || 'İşlem başarısız')
    } finally {
      setToggling(false)
    }
  }

  const content = ordersPage?.content ?? []
  const totalPages = Math.max(1, ordersPage?.totalPages ?? 1)
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage])

  return (
    <>
      <CCard className="mb-3">
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <strong>Müşteri Detayı</strong>
          <CButton color="secondary" variant="outline" size="sm" onClick={() => navigate(-1)}>
            Geri
          </CButton>
        </CCardHeader>

        <CCardBody>
          {loadingCustomer && <div>Yükleniyor...</div>}

          {!loadingCustomer && customer && (
            <CRow className="g-3 align-items-center">
              <CCol md={6}>
                <div className="mb-1">
                  <strong>Ad Soyad:</strong>{' '}
                  {customer.fullName || `${customer.firstName} ${customer.lastName}`}
                </div>
                <div className="mb-1">
                  <strong>Email:</strong> {customer.email}
                </div>
                <div className="mb-1">
                  <strong>Telefon:</strong> {customer.phone || '-'}
                </div>
                <div className="mb-1">
                  <strong>Adres:</strong> {customer.address || '-'}
                </div>
                <div className="mb-1">
                  <strong>Oluşturma:</strong> {formatDateTimeTR(customer.createdAt)}
                </div>
              </CCol>

              <CCol md={6} className="d-flex justify-content-md-end">
                <div className="d-flex align-items-center gap-2">
                  <CBadge color={customer.active ? 'success' : 'secondary'}>
                    {customer.active ? 'Aktif' : 'Pasif'}
                  </CBadge>

                  <CButton
                    color={customer.active ? 'danger' : 'success'}
                    variant="outline"
                    disabled={toggling}
                    onClick={onToggle}
                  >
                    {toggling ? '...' : customer.active ? 'Pasif Yap' : 'Aktif Yap'}
                  </CButton>
                </div>
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <strong>Sipariş Geçmişi</strong>

          <div className="d-flex align-items-center gap-2">
            <small className="text-body-secondary">Sayfa boyutu</small>
            <CFormSelect
              size="sm"
              value={String(size)}
              onChange={(e) => {
                setSize(parseSize(e.target.value))
                setPage(1)
              }}
              style={{ width: 110 }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </CFormSelect>
          </div>
        </CCardHeader>

        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Tarih</CTableHeaderCell>
                <CTableHeaderCell>Durum</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Tutar</CTableHeaderCell>
                <CTableHeaderCell className="text-end">İşlem</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {loadingOrders && (
                <CTableRow>
                  <CTableDataCell colSpan={5}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="spinner-border spinner-border-sm" />
                      <span>Yükleniyor...</span>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              )}

              {!loadingOrders && content.length === 0 && (
                <CTableRow>
                  <CTableDataCell colSpan={5}>
                    <div className="text-body-secondary">Bu müşteriye ait sipariş bulunamadı.</div>
                  </CTableDataCell>
                </CTableRow>
              )}

              {!loadingOrders &&
                content.map((o) => {
                  const statusColor =
                    o.status === 'PENDING'
                      ? 'warning'
                      : o.status === 'DELIVERED'
                        ? 'success'
                        : 'danger'

                  return (
                    <CTableRow key={o.id}>
                      <CTableDataCell>#{o.id}</CTableDataCell>
                      <CTableDataCell>{formatDateTimeTR(o.createdAt)}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={statusColor}>{orderStatusTR(o.status)}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        {formatTRY(o.totalAmount)}
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          onClick={() => navigate(`/orders/${o.id}`)}
                        >
                          Detay
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
            </CTableBody>
          </CTable>

          {!loadingOrders && totalPages > 1 && (
            <div className="d-flex justify-content-end mt-3">
              <CPagination align="end">
                <CPaginationItem disabled={safePage === 1} onClick={() => setPage(1)}>
                  «
                </CPaginationItem>
                <CPaginationItem
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </CPaginationItem>

                <CPaginationItem active>{safePage}</CPaginationItem>

                <CPaginationItem
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </CPaginationItem>
                <CPaginationItem
                  disabled={safePage === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  »
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}
