import { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getAdminStockMovements } from '../../api/stock'
import { notify } from '../../utils/toast'

const typeLabelTR = (t) => {
  switch (t) {
    case 'ORDER_CREATE':
      return 'Sipariş (Düşüş)'
    case 'ORDER_CANCEL':
      return 'Sipariş İptal (İade)'
    case 'ADMIN_ADJUST':
      return 'Admin Düzeltme'
    default:
      return t || '-'
  }
}

const typeColor = (t) => {
  switch (t) {
    case 'ORDER_CREATE':
      return 'danger'
    case 'ORDER_CANCEL':
      return 'success'
    case 'ADMIN_ADJUST':
      return 'warning'
    default:
      return 'secondary'
  }
}

const fmtDateTime = (iso) => {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleString('tr-TR')
  } catch {
    return iso
  }
}

export default function StockHistory() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = useMemo(() => {
    const n = Number(searchParams.get('page'))
    return Number.isFinite(n) && n >= 0 ? n : 0
  }, [searchParams])

  const size = useMemo(() => {
    const n = Number(searchParams.get('size'))
    return Number.isFinite(n) && n > 0 ? n : 20
  }, [searchParams])

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const items = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const setParam = (next) => {
    const current = Object.fromEntries(searchParams.entries())
    setSearchParams({ ...current, ...next })
  }

  const fetchList = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await getAdminStockMovements({
        productId: Number(productId),
        page,
        size,
        sort: 'createdAt,desc',
      })
      setData(res)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Stock history alınamadı'
      setErrorMsg(msg)
      notify.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, page, size])

  const onChangeSize = (e) => {
    const next = Number(e.target.value)
    setParam({ size: String(next), page: '0' })
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <strong>Stock History (Product #{productId})</strong>

        <div className="d-flex align-items-center gap-2">
          <CFormSelect value={String(size)} onChange={onChangeSize} style={{ width: 110 }}>
            {[10, 20, 50].map((n) => (
              <option key={n} value={String(n)}>
                {n}/sayfa
              </option>
            ))}
          </CFormSelect>

          <CButton color="secondary" variant="outline" onClick={fetchList} disabled={loading}>
            Yenile
          </CButton>

          <CButton color="primary" variant="outline" onClick={() => navigate(-1)}>
            Geri
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
          <CAlert color="warning">Kayıt yok.</CAlert>
        )}

        {!loading && !errorMsg && totalElements > 0 && (
          <>
            <div className="d-flex justify-content-end text-body-secondary small mb-2">
              {totalElements} kayıt
            </div>

            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Tarih</CTableHeaderCell>
                  <CTableHeaderCell>Tip</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Delta</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Önce</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Sonra</CTableHeaderCell>
                  <CTableHeaderCell>Actor</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Ref</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {items.map((m) => (
                  <CTableRow key={m.id}>
                    <CTableDataCell>{fmtDateTime(m.createdAt)}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={typeColor(m.type)}>{typeLabelTR(m.type)}</CBadge>
                    </CTableDataCell>

                    <CTableDataCell className="text-center">
                      <span
                        className={m.delta > 0 ? 'text-success' : m.delta < 0 ? 'text-danger' : ''}
                      >
                        {m.delta > 0 ? `+${m.delta}` : m.delta}
                      </span>
                    </CTableDataCell>

                    <CTableDataCell className="text-center">{m.beforeStock ?? '-'}</CTableDataCell>
                    <CTableDataCell className="text-center">{m.afterStock ?? '-'}</CTableDataCell>
                    <CTableDataCell>{m.actor ?? '-'}</CTableDataCell>

                    <CTableDataCell className="text-center">
                      {m.referenceType ? (
                        <span>
                          {m.referenceType} #{m.referenceId ?? '-'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            {/* Basit pagination */}
            <div className="d-flex justify-content-end gap-2 mt-3">
              <CButton
                color="secondary"
                variant="outline"
                disabled={page <= 0}
                onClick={() => setParam({ page: String(page - 1) })}
              >
                Önceki
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setParam({ page: String(page + 1) })}
              >
                Sonraki
              </CButton>
            </div>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}
