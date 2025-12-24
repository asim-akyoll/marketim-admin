import React from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { formatTRY } from '../../utils/format'
import { statusColor, statusLabelTR } from '../../utils/orderUi'

const RecentOrdersTable = ({ orders }) => {
  const navigate = useNavigate()
  const list = orders ?? []

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <span className="fw-semibold">Son 5 Sipariş</span>

        <div className="d-flex align-items-center gap-2">
          <CButton color="primary" variant="outline" size="sm" onClick={() => navigate('/orders')}>
            Tüm Siparişler
          </CButton>
          <span className="text-body-secondary small">Dashboard</span>
        </div>
      </CCardHeader>

      <CCardBody>
        <CTable hover responsive className="mb-0">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Müşteri</CTableHeaderCell>
              <CTableHeaderCell>Tutar</CTableHeaderCell>
              <CTableHeaderCell>Durum</CTableHeaderCell>
              <CTableHeaderCell>Tarih</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {list.map((o) => (
              <CTableRow
                key={o.id}
                title="Detay için tıkla"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/orders/${o.id}`)}
              >
                <CTableDataCell className="fw-semibold text-primary">#{o.id}</CTableDataCell>
                <CTableDataCell>{o.userFullName ?? '-'}</CTableDataCell>
                <CTableDataCell>{formatTRY(o.totalAmount ?? 0)}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={statusColor(o.status)}>{statusLabelTR(o.status)}</CBadge>
                </CTableDataCell>
                <CTableDataCell>
                  {o.createdAt ? new Date(o.createdAt).toLocaleString('tr-TR') : '-'}
                </CTableDataCell>
              </CTableRow>
            ))}

            {list.length === 0 && (
              <CTableRow>
                <CTableDataCell colSpan={5} className="text-body-secondary">
                  Henüz görüntülenecek sipariş bulunmuyor.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default RecentOrdersTable
