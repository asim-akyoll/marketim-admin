import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatTRY } from '../../utils/format'
import { statusColor, statusLabelTR } from '../../utils/orderUi'
import { getAdminOrders, getAdminOrderStats } from '../../api/orders'

const normalizeIdQuery = (v) => String(v ?? '').trim()

const parsePage = (v) => {
  const n = Number(v)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

const parseSize = (v) => {
  const n = Number(v)
  if (n === 10 || n === 20 || n === 50) return n
  return 10
}

export default function OrdersList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [pageData, setPageData] = useState(null)
  const [stats, setStats] = useState({ pending: 0, delivered: 0, cancelled: 0, total: 0 })
  const [loading, setLoading] = useState(false)

  // URL -> başlangıç state
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [debouncedQ, setDebouncedQ] = useState(searchParams.get('q') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL')
  const [amountSort, setAmountSort] = useState(searchParams.get('sort') || 'NONE')
  const [pageSize, setPageSize] = useState(parseSize(searchParams.get('size')))
  const [page, setPage] = useState(parsePage(searchParams.get('page')))

  const syncingFromUrlRef = useRef(false)

  // 0) debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  // 1) URL -> State (back/forward veya manuel URL edit)
  useEffect(() => {
    const nextQ = searchParams.get('q') || ''
    const nextStatus = searchParams.get('status') || 'ALL'
    const nextSort = searchParams.get('sort') || 'NONE'
    const nextSize = parseSize(searchParams.get('size'))
    const nextPage = parsePage(searchParams.get('page'))

    const changed =
      nextQ !== q ||
      nextQ !== debouncedQ ||
      nextStatus !== statusFilter ||
      nextSort !== amountSort ||
      nextSize !== pageSize ||
      nextPage !== page

    if (!changed) return

    syncingFromUrlRef.current = true
    setQ(nextQ)
    setDebouncedQ(nextQ)
    setStatusFilter(nextStatus)
    setAmountSort(nextSort)
    setPageSize(nextSize)
    setPage(nextPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // 2) filtre/sort/size değişince page=1 (ama URL’den geldiyse dokunma)
  useEffect(() => {
    if (syncingFromUrlRef.current) {
      syncingFromUrlRef.current = false
      return
    }
    setPage(1)
  }, [debouncedQ, statusFilter, amountSort, pageSize])

  // 3) State -> URL
  useEffect(() => {
    const params = new URLSearchParams()

    const qq = normalizeIdQuery(debouncedQ)
    if (qq) params.set('q', qq)

    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (amountSort !== 'NONE') params.set('sort', amountSort)

    if (page !== 1) params.set('page', String(page))
    if (pageSize !== 10) params.set('size', String(pageSize))

    const next = params.toString()
    const current = searchParams.toString()
    if (next === current) return

    setSearchParams(params, { replace: true })
  }, [debouncedQ, statusFilter, amountSort, page, pageSize, searchParams, setSearchParams])

  // 4) Stats çek (badge sayıları)
  useEffect(() => {
    getAdminOrderStats()
      .then(setStats)
      .catch(() => {}) // şimdilik sessiz
  }, [])

  // 5) Listeyi backend’den çek (server-side)
  useEffect(() => {
    setLoading(true)

    const cleanedId = normalizeIdQuery(debouncedQ).replace('#', '')
    const idParam = cleanedId ? Number(cleanedId) : undefined

    getAdminOrders({
      page: page - 1, // backend 0-based
      size: pageSize,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      sort:
        amountSort === 'NONE' ? undefined : `totalAmount,${amountSort === 'ASC' ? 'asc' : 'desc'}`,
      id: Number.isFinite(idParam) ? idParam : undefined,
    })
      .then(setPageData)
      .finally(() => setLoading(false))
  }, [page, pageSize, statusFilter, amountSort, debouncedQ])

  const content = pageData?.content ?? []
  const totalElements = pageData?.totalElements ?? 0
  const totalPages = Math.max(1, pageData?.totalPages ?? 1)
  const safePage = Math.min(page, totalPages)

  // page güvenliği (page > totalPages olursa düzelt)
  useEffect(() => {
    if (page !== safePage) setPage(safePage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage])

  const startIndex = totalElements === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endIndex = Math.min(safePage * pageSize, totalElements)

  const clearFilters = () => {
    setQ('')
    setDebouncedQ('')
    setStatusFilter('ALL')
    setAmountSort('NONE')
    setPageSize(10)
    setPage(1)
    setSearchParams({}, { replace: true })
  }

  const applyStatus = (status) => {
    setStatusFilter(status)
    setPage(1)
  }

  const pageItems = useMemo(() => {
    const items = []
    const p = safePage
    const tp = totalPages

    const push = (key, label, pageNum, disabled = false, active = false) => {
      items.push({ key, label, pageNum, disabled, active })
    }

    const addRange = (from, to) => {
      for (let i = from; i <= to; i++) push(`p-${i}`, String(i), i, false, i === p)
    }

    if (tp <= 7) {
      addRange(1, tp)
      return items
    }

    push('p-1', '1', 1, false, p === 1)
    if (p > 4) push('dots-l', '…', null, true, false)

    const from = Math.max(2, p - 1)
    const to = Math.min(tp - 1, p + 1)
    addRange(from, to)

    if (p < tp - 3) push('dots-r', '…', null, true, false)
    push(`p-${tp}`, String(tp), tp, false, p === tp)

    return items
  }, [safePage, totalPages])

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <strong>Siparişler</strong>
        <small className="text-body-secondary">
          {totalElements === 0 ? '0 sonuç' : `${startIndex}-${endIndex} / ${totalElements}`}
        </small>
      </CCardHeader>

      <CCardBody>
        {/* Mini sayaçlar */}
        <CRow className="mb-3 g-2">
          <CCol className="d-flex gap-2 flex-wrap">
            <CBadge
              color="warning"
              role="button"
              style={{ cursor: 'pointer' }}
              onClick={() => applyStatus('PENDING')}
            >
              Beklemede: {stats.pending}
            </CBadge>

            <CBadge
              color="success"
              role="button"
              style={{ cursor: 'pointer' }}
              onClick={() => applyStatus('DELIVERED')}
            >
              Teslim: {stats.delivered}
            </CBadge>

            <CBadge
              color="danger"
              role="button"
              style={{ cursor: 'pointer' }}
              onClick={() => applyStatus('CANCELLED')}
            >
              İptal: {stats.cancelled}
            </CBadge>

            <CBadge
              color="secondary"
              role="button"
              style={{ cursor: 'pointer' }}
              onClick={() => applyStatus('ALL')}
            >
              Toplam: {stats.total}
            </CBadge>
          </CCol>
        </CRow>

        {/* Filtreler */}
        <CRow className="mb-3 g-2">
          <CCol md={3}>
            <CFormInput
              placeholder="Ara: sadece ID (örn: 3 veya #3)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </CCol>

          <CCol md={3}>
            <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">Tümü</option>
              <option value="PENDING">{statusLabelTR('PENDING')}</option>
              <option value="DELIVERED">{statusLabelTR('DELIVERED')}</option>
              <option value="CANCELLED">{statusLabelTR('CANCELLED')}</option>
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormSelect value={amountSort} onChange={(e) => setAmountSort(e.target.value)}>
              <option value="NONE">Tutar: Varsayılan</option>
              <option value="ASC">Tutar: Artan</option>
              <option value="DESC">Tutar: Azalan</option>
            </CFormSelect>
          </CCol>

          <CCol md={1}>
            <CFormSelect
              value={String(pageSize)}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </CFormSelect>
          </CCol>

          <CCol md={2} className="d-flex justify-content-end">
            <CButton
              color="secondary"
              variant="outline"
              onClick={clearFilters}
              disabled={
                !q &&
                statusFilter === 'ALL' &&
                amountSort === 'NONE' &&
                pageSize === 10 &&
                page === 1
              }
            >
              Temizle
            </CButton>
          </CCol>
        </CRow>

        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Durum</CTableHeaderCell>
              <CTableHeaderCell>Toplam</CTableHeaderCell>
              <CTableHeaderCell>Adres</CTableHeaderCell>
              <CTableHeaderCell className="text-end">İşlem</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loading && (
              <CTableRow>
                <CTableDataCell colSpan={5}>Yükleniyor...</CTableDataCell>
              </CTableRow>
            )}

            {!loading && content.length === 0 && (
              <CTableRow>
                <CTableDataCell colSpan={5}>Kayıt yok</CTableDataCell>
              </CTableRow>
            )}

            {!loading &&
              content.map((o) => (
                <CTableRow key={o.id}>
                  <CTableDataCell>#{o.id}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={statusColor(o.status)}>{statusLabelTR(o.status)}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{formatTRY(o.totalAmount)}</CTableDataCell>
                  <CTableDataCell>{o.deliveryAddress || '-'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CButton
                      size="sm"
                      color="primary"
                      variant="outline"
                      onClick={() => navigate(`/orders/${o.id}`)}
                    >
                      Detay
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
          </CTableBody>
        </CTable>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="d-flex justify-content-end mt-3">
            <CPagination align="end" aria-label="Orders pagination">
              <CPaginationItem disabled={safePage === 1} onClick={() => setPage(1)}>
                «
              </CPaginationItem>
              <CPaginationItem
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </CPaginationItem>

              {pageItems.map((it) => (
                <CPaginationItem
                  key={it.key}
                  active={it.active}
                  disabled={it.disabled}
                  onClick={() => it.pageNum && setPage(it.pageNum)}
                >
                  {it.label}
                </CPaginationItem>
              ))}

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
  )
}
