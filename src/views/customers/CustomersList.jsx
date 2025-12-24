import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { getAdminCustomers, toggleAdminCustomerActive } from '../../api/customers'
import { notify } from '../../utils/toast'

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

export default function CustomersList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [togglingId, setTogglingId] = useState(null)

  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(false)

  // URL -> başlangıç state
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [debouncedQ, setDebouncedQ] = useState(searchParams.get('q') || '')
  const [activeFilter, setActiveFilter] = useState(searchParams.get('active') || 'ALL')
  const [pageSize, setPageSize] = useState(parseSize(searchParams.get('size')))
  const [page, setPage] = useState(parsePage(searchParams.get('page')))

  const syncingFromUrlRef = useRef(false)

  // ✅ Debounce: yazarken istek atma, 400ms sonra set et
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400)
    return () => clearTimeout(t)
  }, [q])

  // URL -> State
  useEffect(() => {
    const nextQ = searchParams.get('q') || ''
    const nextActive = searchParams.get('active') || 'ALL'
    const nextSize = parseSize(searchParams.get('size'))
    const nextPage = parsePage(searchParams.get('page'))

    const changed =
      nextQ !== q ||
      nextQ !== debouncedQ ||
      nextActive !== activeFilter ||
      nextSize !== pageSize ||
      nextPage !== page

    if (!changed) return

    syncingFromUrlRef.current = true
    setQ(nextQ)
    setDebouncedQ(nextQ)
    setActiveFilter(nextActive)
    setPageSize(nextSize)
    setPage(nextPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // filtre/size değişince page=1 (URL’den geldiyse dokunma)
  useEffect(() => {
    if (syncingFromUrlRef.current) {
      syncingFromUrlRef.current = false
      return
    }
    setPage(1)
  }, [debouncedQ, activeFilter, pageSize])

  // State -> URL
  useEffect(() => {
    const params = new URLSearchParams()

    const qq = String(debouncedQ ?? '').trim()
    if (qq) params.set('q', qq)

    if (activeFilter !== 'ALL') params.set('active', activeFilter)

    if (page !== 1) params.set('page', String(page))
    if (pageSize !== 10) params.set('size', String(pageSize))

    const next = params.toString()
    const current = searchParams.toString()
    if (next === current) return

    setSearchParams(params, { replace: true })
  }, [debouncedQ, activeFilter, page, pageSize, searchParams, setSearchParams])

  // ✅ silent param: toggle sonrası refetch'te table loading açmayacağız
  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true)
      try {
        const data = await getAdminCustomers({
          page: page - 1,
          size: pageSize,
          q: debouncedQ?.trim() || undefined,
          active: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE' ? true : false,
        })
        setPageData(data)
      } catch (e) {
        notify.error(e?.message || 'Liste alınamadı')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [page, pageSize, debouncedQ, activeFilter],
  )

  // Liste çek
  useEffect(() => {
    fetchList({ silent: false })
  }, [fetchList])

  const content = pageData?.content ?? []
  const totalElements = pageData?.totalElements ?? 0
  const totalPages = Math.max(1, pageData?.totalPages ?? 1)
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage])

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

  const onToggle = async (customer) => {
    if (togglingId) return
    setTogglingId(customer.id)

    try {
      await toggleAdminCustomerActive(customer.id)
      notify.success('Müşteri durumu güncellendi')
      await fetchList({ silent: true })
    } catch (e) {
      notify.error(e?.message || 'İşlem başarısız')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <strong>Müşteriler</strong>
        <small className="text-body-secondary">{totalElements} sonuç</small>
      </CCardHeader>

      <CCardBody>
        {/* Filtreler */}
        <CRow className="mb-3 g-2">
          <CCol md={4}>
            <CFormInput
              placeholder="Ara: isim, soyisim, email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <small className="text-body-secondary"></small>
          </CCol>

          <CCol md={3}>
            <CFormSelect value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
              <option value="ALL">Aktiflik: Tümü</option>
              <option value="ACTIVE">Aktif</option>
              <option value="PASSIVE">Pasif</option>
            </CFormSelect>
          </CCol>

          <CCol md={2}>
            <CFormSelect
              value={String(pageSize)}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </CFormSelect>
          </CCol>

          <CCol md={3} className="d-flex justify-content-end">
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => {
                setQ('')
                setActiveFilter('ALL')
                setPageSize(10)
                setPage(1)
              }}
            >
              Temizle
            </CButton>
          </CCol>
        </CRow>

        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Ad Soyad</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Durum</CTableHeaderCell>
              <CTableHeaderCell className="text-end">İşlem</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loading && (
              <CTableRow>
                <CTableDataCell colSpan={5}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm" />
                    <span>Yükleniyor...</span>
                  </div>
                </CTableDataCell>
              </CTableRow>
            )}

            {!loading && content.length === 0 && (
              <CTableRow>
                <CTableDataCell colSpan={5}>Kayıt yok</CTableDataCell>
              </CTableRow>
            )}

            {!loading &&
              content.map((c) => (
                <CTableRow
                  key={c.id}
                  // ✅ Pasif müşteri satırı grileştir
                  className={!c.active ? 'opacity-75' : undefined}
                  style={!c.active ? { backgroundColor: 'rgba(0,0,0,0.03)' } : undefined}
                >
                  <CTableDataCell>#{c.id}</CTableDataCell>

                  <CTableDataCell>
                    <div className="d-flex align-items-center gap-2">
                      <span>{c.fullName || `${c.firstName} ${c.lastName}`}</span>
                      {!c.active && (
                        <CBadge color="secondary" shape="rounded-pill">
                          Pasif
                        </CBadge>
                      )}
                    </div>
                  </CTableDataCell>

                  <CTableDataCell>{c.email}</CTableDataCell>

                  <CTableDataCell>
                    <CBadge color={c.active ? 'success' : 'secondary'}>
                      {c.active ? 'Aktif' : 'Pasif'}
                    </CBadge>
                  </CTableDataCell>

                  <CTableDataCell className="text-end">
                    <div className="d-inline-flex gap-2">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        onClick={() => navigate(`/customers/${c.id}`)}
                      >
                        Detay
                      </CButton>

                      <CButton
                        size="sm"
                        color={c.active ? 'danger' : 'success'}
                        variant="outline"
                        disabled={togglingId === c.id}
                        onClick={() => onToggle(c)}
                      >
                        {togglingId === c.id ? '...' : c.active ? 'Pasif Yap' : 'Aktif Yap'}
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
          </CTableBody>
        </CTable>

        {!loading && totalPages > 1 && (
          <div className="d-flex justify-content-end mt-3">
            <CPagination align="end" aria-label="Customers pagination">
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
