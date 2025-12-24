import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
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
import { getCategories } from '../../api/categories'
import { getAdminProducts, toggleAdminProductActive } from '../../api/products'
import { notify } from '../../utils/toast'

const parseIntSafe = (v, fallback) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const parseSize = (v) => {
  const s = parseIntSafe(v, 20)
  return [10, 20, 50, 100].includes(s) ? s : 20
}

const triggerLowStockRefresh = () => {
  window.dispatchEvent(new Event('lowstock:refresh'))
}

export default function ProductsList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // URL -> state
  const page = useMemo(() => Math.max(0, parseIntSafe(searchParams.get('page'), 0)), [searchParams])
  const size = useMemo(() => parseSize(searchParams.get('size')), [searchParams])

  const active = useMemo(() => {
    const v = searchParams.get('active')
    if (v === null) return null
    if (v === 'true') return true
    if (v === 'false') return false
    return null
  }, [searchParams])

  const categoryId = useMemo(() => {
    const v = searchParams.get('categoryId')
    if (!v) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }, [searchParams])

  const q = useMemo(() => searchParams.get('q') || '', [searchParams])

  const [categories, setCategories] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const setParam = (next) => {
    const sp = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') sp.delete(k)
      else sp.set(k, String(v))
    })
    setSearchParams(sp, { replace: true })
  }

  const fetchCategories = async () => {
    try {
      const res = await getCategories()
      setCategories(res || [])
    } catch {
      setCategories([])
    }
  }

  const fetchList = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await getAdminProducts({
        page,
        size,
        active: active ?? undefined,
        categoryId: categoryId ?? undefined,
        q: q?.trim() ? q.trim() : undefined,
        sort: 'id,desc',
      })
      setData(res)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Ürün listesi alınamadı'
      setErrorMsg(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, active, categoryId, q])

  const onToggleActive = async (id) => {
    try {
      await toggleAdminProductActive(id)
      notify.success('Ürün durumu güncellendi')
      triggerLowStockRefresh()
      await fetchList()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Toggle işlemi başarısız'
      notify.error(msg)
    }
  }

  const content = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

  // ✅ <=10 kırmızı, 11-20 sarı, >20 yeşil
  const stockBadge = (stock) => {
    const s = Number(stock ?? 0)
    if (s <= 10) return <CBadge color="danger">{s}</CBadge>
    if (s <= 20) return <CBadge color="warning">{s}</CBadge>
    return <CBadge color="success">{s}</CBadge>
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <strong>Products</strong>

        <div className="d-flex gap-2">
          <CButton color="secondary" variant="outline" onClick={fetchList} disabled={loading}>
            Yenile
          </CButton>
          <CButton color="primary" onClick={() => navigate('/products/new')}>
            Yeni Ürün
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        {/* Filters */}
        <CRow className="g-3 mb-3 align-items-end">
          <CCol md={3}>
            <CFormLabel className="text-body-secondary">Search</CFormLabel>
            <CFormInput
              value={q}
              placeholder="Ürün adı..."
              onChange={(e) => setParam({ q: e.target.value, page: 0 })}
            />
          </CCol>

          <CCol md={3}>
            <CFormLabel className="text-body-secondary">Kategori</CFormLabel>
            <CFormSelect
              value={categoryId ? String(categoryId) : ''}
              onChange={(e) => setParam({ categoryId: e.target.value || null, page: 0 })}
            >
              <option value="">Tümü</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormLabel className="text-body-secondary">Aktif</CFormLabel>
            <CFormSelect
              value={active === null ? '' : String(active)}
              onChange={(e) => {
                const v = e.target.value
                setParam({ active: v === '' ? null : v, page: 0 })
              }}
            >
              <option value="">Tümü</option>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormLabel className="text-body-secondary">Sayfa Boyutu</CFormLabel>
            <CFormSelect
              value={String(size)}
              onChange={(e) => setParam({ size: parseSize(e.target.value), page: 0 })}
            >
              {[10, 20, 50, 100].map((s) => (
                <option key={s} value={String(s)}>
                  {s}/sayfa
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>

        {loading && (
          <div className="d-flex align-items-center gap-2">
            <CSpinner size="sm" />
            <span className="text-body-secondary">Veriler yükleniyor...</span>
          </div>
        )}

        {!loading && errorMsg && (
          <CAlert color="danger">
            {errorMsg}
            <div className="mt-2">
              <CButton color="light" size="sm" onClick={fetchList}>
                Tekrar dene
              </CButton>
            </div>
          </CAlert>
        )}

        {!loading && !errorMsg && content.length === 0 && (
          <CAlert color="warning" className="mb-0">
            Kayıt yok
          </CAlert>
        )}

        {!loading && !errorMsg && content.length > 0 && (
          <>
            <CTable hover responsive className="align-middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 80 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell>Ürün</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 140 }}>Stok</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 180 }}>Kategori</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 120 }}>Durum</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 260 }} className="text-end">
                    İşlemler
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {content.map((p) => (
                  <CTableRow key={p.id}>
                    <CTableDataCell className="text-body-secondary">#{p.id}</CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-semibold">{p.name}</div>
                      <div className="small text-body-secondary">{p.description || '—'}</div>
                    </CTableDataCell>

                    <CTableDataCell>{stockBadge(p.stock)}</CTableDataCell>

                    <CTableDataCell>{p.categoryName || '—'}</CTableDataCell>

                    <CTableDataCell>
                      <CBadge color={p.active ? 'success' : 'secondary'}>
                        {p.active ? 'Aktif' : 'Pasif'}
                      </CBadge>
                    </CTableDataCell>

                    <CTableDataCell className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <CButton
                          color="primary"
                          variant="outline"
                          size="sm"
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

                        <CButton
                          color={p.active ? 'danger' : 'success'}
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleActive(p.id)}
                        >
                          {p.active ? 'Pasif Yap' : 'Aktif Yap'}
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            {/* Pagination */}
            <CRow className="mt-3 align-items-center">
              <CCol className="text-body-secondary small">
                Toplam: {totalElements} • Sayfa: {page + 1}/{Math.max(totalPages, 1)}
              </CCol>
              <CCol className="d-flex justify-content-end gap-2">
                <CButton
                  color="secondary"
                  variant="outline"
                  disabled={page <= 0 || loading}
                  onClick={() => setParam({ page: page - 1 })}
                >
                  Önceki
                </CButton>
                <CButton
                  color="secondary"
                  variant="outline"
                  disabled={page >= totalPages - 1 || loading}
                  onClick={() => setParam({ page: page + 1 })}
                >
                  Sonraki
                </CButton>
              </CCol>
            </CRow>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}
