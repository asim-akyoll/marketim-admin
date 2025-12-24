import { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAdminLowStockProducts } from '../../api/products'
import { formatTRY } from '../../utils/format'
import { notify } from '../../utils/toast'

const STOCK_DEFAULT_THRESHOLD = 10

const parseThreshold = (v) => {
  const n = Number(v)
  if (n === 10 || n === 20) return n
  return STOCK_DEFAULT_THRESHOLD
}

const stockMeta = (stock) => {
  const s = Number(stock)
  if (!Number.isFinite(s)) return { color: 'secondary', label: '-' }
  if (s <= 10) return { color: 'danger', label: 'LOW' } // <10 kırmızı
  if (s <= 20) return { color: 'warning', label: 'MED' } // 10-20 sarı
  return { color: 'success', label: 'GOOD' } // >20 yeşil
}

export default function LowStockProducts() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // ✅ URL yoksa default threshold=10
  const threshold = useMemo(() => {
    const raw = searchParams.get('threshold')
    return parseThreshold(raw)
  }, [searchParams])

  const page = useMemo(() => {
    const raw = searchParams.get('page')
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : 0
  }, [searchParams])

  const size = useMemo(() => {
    const raw = searchParams.get('size')
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : 10
  }, [searchParams])

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const totalElements = data?.totalElements ?? 0
  const items = data?.content ?? []

  const setParam = (next) => {
    const current = Object.fromEntries(searchParams.entries())
    setSearchParams({ ...current, ...next })
  }

  // ✅ sayfa ilk kez açıldığında threshold yoksa URL’e yaz (kalıcı ve tutarlı)
  useEffect(() => {
    const hasThreshold = searchParams.has('threshold')
    if (!hasThreshold) {
      setParam({ threshold: String(STOCK_DEFAULT_THRESHOLD), page: '0' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchList = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await getAdminLowStockProducts({
        threshold, // ✅ her zaman gönder
        page,
        size,
        sort: 'stock,asc',
      })
      setData(res)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Low stock listesi alınamadı'
      setErrorMsg(msg)
      notify.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ threshold/page/size değişince otomatik fetch
  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, page, size])

  const onChangeThreshold = (e) => {
    const next = parseThreshold(e.target.value)
    setParam({ threshold: String(next), page: '0' })
  }

  const onChangeSize = (e) => {
    const next = Number(e.target.value)
    setParam({ size: String(next), page: '0' })
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <strong>Low Stock</strong>

        <div className="d-flex align-items-center gap-2">
          <span className="text-body-secondary small">Threshold</span>

          {/* ✅ sadece 10 ve 20 */}
          <CFormSelect
            value={String(threshold)}
            onChange={onChangeThreshold}
            style={{ width: 110 }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
          </CFormSelect>

          <CFormSelect value={String(size)} onChange={onChangeSize} style={{ width: 100 }}>
            {[10, 20, 50].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </CFormSelect>

          <CButton color="secondary" variant="outline" onClick={fetchList} disabled={loading}>
            Yenile
          </CButton>

          <CButton color="primary" variant="outline" onClick={() => navigate('/products')}>
            Ürünlere Dön
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        {loading && (
          <div className="d-flex align-items-center gap-2">
            <CSpinner size="sm" />
            <span className="text-body-secondary">Yükleniyor...</span>
          </div>
        )}

        {errorMsg && (
          <CAlert color="danger" className="mb-3">
            {errorMsg}
          </CAlert>
        )}

        {!loading && !errorMsg && totalElements === 0 && (
          <CAlert color="warning">Kayıt yok (threshold: {threshold})</CAlert>
        )}

        {!loading && !errorMsg && totalElements > 0 && (
          <>
            <div className="d-flex justify-content-end text-body-secondary small mb-2">
              {totalElements} sonuç
            </div>
            <div style={{ minHeight: 180 }}>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Ad</CTableHeaderCell>
                    <CTableHeaderCell>Kategori</CTableHeaderCell>
                    <CTableHeaderCell>Fiyat</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Stok</CTableHeaderCell>
                    <CTableHeaderCell>Durum</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">İşlem</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {items.map((p) => {
                    const meta = stockMeta(p.stock)

                    return (
                      <CTableRow key={p.id}>
                        <CTableDataCell>#{p.id}</CTableDataCell>
                        <CTableDataCell>{p.name}</CTableDataCell>
                        <CTableDataCell>{p.categoryName ?? '-'}</CTableDataCell>
                        <CTableDataCell>{formatTRY(p.price)}</CTableDataCell>

                        {/* ✅ kayma fix + renk kuralı */}
                        <CTableDataCell className="text-center">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <span style={{ minWidth: 18, textAlign: 'right' }}>
                              {p.stock ?? '-'}
                            </span>
                            <CBadge
                              color={meta.color}
                              style={{
                                minWidth: 64,
                                display: 'inline-flex',
                                justifyContent: 'center',
                              }}
                            >
                              {meta.label}
                            </CBadge>
                          </div>
                        </CTableDataCell>

                        <CTableDataCell>
                          {p.active ? (
                            <CBadge color="success">Aktif</CBadge>
                          ) : (
                            <CBadge color="secondary">Pasif</CBadge>
                          )}
                        </CTableDataCell>

                        <CTableDataCell className="text-end">
                          <CButton
                            size="sm"
                            color="info"
                            variant="outline"
                            onClick={() => navigate(`/products/${p.id}`)}
                          >
                            Düzenle
                          </CButton>
                          <CButton
                            size="sm"
                            color="secondary"
                            variant="outline"
                            onClick={() => navigate(`/products/${p.id}/stock-history`)}
                          >
                            Hareketler
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}
