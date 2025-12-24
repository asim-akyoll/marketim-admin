// src/views/categories/CategoriesList.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { notify } from '../../utils/toast'
import { getAdminCategories, toggleAdminCategoryActive } from '../../api/categories'
import { CTooltip } from '@coreui/react'

const toInt = (v, fallback) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export default function CategoriesList() {
  const navigate = useNavigate()
  const location = useLocation()

  const query = useMemo(() => new URLSearchParams(location.search), [location.search])

  // ✅ URL -> values (tek kaynak)
  const page = Math.max(toInt(query.get('page'), 0), 0)
  const size = Math.max(toInt(query.get('size'), 10), 1) // ✅ size yoksa 10, asla 0 olmasın

  const q = query.get('q') ?? ''

  const activeParam = query.get('active') // "true" | "false" | null
  const active = activeParam === 'true' ? true : activeParam === 'false' ? false : 'all'

  const sort = query.get('sort') || 'id'
  const dir = query.get('dir') || 'desc'
  const sortValue = `${sort}:${dir}`

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    items: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  })

  const setQuery = (next) => {
    const sp = new URLSearchParams(location.search)

    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') sp.delete(k)
      else sp.set(k, String(v))
    })

    navigate({ pathname: location.pathname, search: sp.toString() }, { replace: false })
  }

  const fetchList = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await getAdminCategories({
        page,
        size,
        q: q.trim() || undefined,
        active: active === 'all' ? undefined : active,
        sort,
        dir,
      })
      setData(res)
    } catch (err) {
      const msg = err?.message || 'Kategoriler yüklenemedi'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // ✅ URL’de size yoksa ilk girişte default size’ı URL’e yaz (ve backend’e 10 gitsin)
    if (!query.get('size')) {
      setQuery({ size: 10, page: 0 })
      return
    }
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  const onToggleActive = async (id) => {
    try {
      const updated = await toggleAdminCategoryActive(id)
      notify.success('Kategori durumu güncellendi')

      // Eğer filtre "Sadece Aktif" ise ve kategori pasife düştüyse, bilgi ver
      if (active === true && updated?.active === false) {
        notify.info('Filtren “Sadece Aktif” olduğu için kategori listeden çıkarıldı')
      }
      if (active === false && updated?.active === true) {
        notify.info('Filtren “Sadece Pasif” olduğu için kategori listeden çıkarıldı')
      }

      fetchList()
    } catch (err) {
      const msg = err?.message || 'Toggle işlemi başarısız'
      notify.error(msg)
    }
  }

  const onChangeQ = (e) => setQuery({ q: e.target.value, page: 0 })
  const onChangeActive = (e) =>
    setQuery({ active: e.target.value === 'all' ? '' : e.target.value, page: 0 })
  const onChangeSize = (e) => setQuery({ size: e.target.value, page: 0 })

  const onChangeSort = (e) => {
    const [s, d] = e.target.value.split(':')
    setQuery({ sort: s, dir: d, page: 0 })
  }

  const goPage = (p) => setQuery({ page: p })

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <strong>Kategoriler</strong>
        <CButton color="primary" onClick={() => navigate('/categories/new')}>
          Yeni Kategori
        </CButton>
      </CCardHeader>

      <CCardBody>
        {error && (
          <CAlert color="danger" className="mb-3">
            {error}
          </CAlert>
        )}

        <CRow className="g-2 mb-3">
          <CCol md={4}>
            <CFormInput placeholder="Ara (q)..." value={q} onChange={onChangeQ} />
          </CCol>

          <CCol md={3}>
            <CFormSelect value={active} onChange={onChangeActive}>
              <option value="all">Hepsi (active)</option>
              <option value="true">Sadece Aktif</option>
              <option value="false">Sadece Pasif</option>
            </CFormSelect>
          </CCol>

          <CCol md={2}>
            {/* ✅ value STRING olmalı (select’te en stabil) */}
            <CFormSelect value={String(size)} onChange={onChangeSize}>
              <option value="10">10 / sayfa</option>
              <option value="20">20 / sayfa</option>
              <option value="50">50 / sayfa</option>
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormSelect value={sortValue} onChange={onChangeSort}>
              <option value="id:desc">ID (desc)</option>
              <option value="id:asc">ID (asc)</option>
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
            </CFormSelect>
          </CCol>
        </CRow>

        {loading ? (
          <div className="d-flex align-items-center gap-2">
            <CSpinner size="sm" />
            <span className="text-body-secondary">Yükleniyor...</span>
          </div>
        ) : (
          <>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 80 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Slug</CTableHeaderCell>
                  <CTableHeaderCell>Active</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 220 }}>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {data.items?.length ? (
                  data.items.map((c) => (
                    <CTableRow key={c.id}>
                      <CTableDataCell>{c.id}</CTableDataCell>
                      <CTableDataCell>{c.name}</CTableDataCell>
                      <CTableDataCell className="text-body-secondary">
                        <div className="d-flex align-items-center gap-2">
                          <span>{c.slug}</span>

                          <CTooltip content="Slug kopyala">
                            <CButton
                              color="secondary"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(c.slug || '')
                                  notify.success('Slug kopyalandı')
                                } catch {
                                  notify.error('Kopyalama başarısız')
                                }
                              }}
                            >
                              Kopyala
                            </CButton>
                          </CTooltip>
                        </div>
                      </CTableDataCell>

                      <CTableDataCell>
                        {c.active ? (
                          <CBadge color="success">Aktif</CBadge>
                        ) : (
                          <CBadge color="secondary">Pasif</CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell className="d-flex gap-2">
                        <CButton
                          color="secondary"
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/categories/${c.id}`)}
                        >
                          Düzenle
                        </CButton>
                        <CButton
                          color={c.active ? 'danger' : 'success'}
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleActive(c.id)}
                        >
                          {c.active ? 'Pasif Yap' : 'Aktif Yap'}
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={5} className="text-center">
                      <div className="py-4 text-body-secondary">Kayıt bulunamadı</div>
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => navigate('/categories/new')}
                      >
                        İlk kategoriyi oluştur
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            {data.totalPages > 1 && (
              <div className="d-flex justify-content-end">
                <CPagination className="mb-0">
                  <CPaginationItem disabled={page <= 0} onClick={() => goPage(page - 1)}>
                    Prev
                  </CPaginationItem>

                  {Array.from({ length: data.totalPages }, (_, i) => i).map((p) => (
                    <CPaginationItem key={p} active={p === page} onClick={() => goPage(p)}>
                      {p + 1}
                    </CPaginationItem>
                  ))}

                  <CPaginationItem
                    disabled={page >= data.totalPages - 1}
                    onClick={() => goPage(page + 1)}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              </div>
            )}
          </>
        )}
      </CCardBody>
    </CCard>
  )
}
