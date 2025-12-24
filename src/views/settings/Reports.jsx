import React, { useMemo, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { getAdminReportPdf } from '../../api/reports'
import { notify } from '../../utils/toast'

const REPORT_TYPES = [
  { value: 'ORDER', label: 'Siparis Raporu' },
  { value: 'STOCK', label: 'Stok Durum Raporu' },
  { value: 'DAILY', label: 'Gunluk Ozet' },
  { value: 'MONTHLY', label: 'Ay Sonu Raporu' },
]

const pad = (n) => String(n).padStart(2, '0')
const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function Reports() {
  const [type, setType] = useState('ORDER')

  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState(todayISO())

  const [downloading, setDownloading] = useState(false)
  const [printing, setPrinting] = useState(false)

  const canRun = useMemo(() => {
    if (!type || !startDate || !endDate) return false
    return true
  }, [type, startDate, endDate])

  const buildFileName = () => {
    return `report-${type.toLowerCase()}-${startDate}_to_${endDate}.pdf`
  }

  const downloadPdf = async () => {
    if (!canRun) return
    setDownloading(true)
    try {
      const blob = await getAdminReportPdf({ type, startDate, endDate })
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))

      const a = document.createElement('a')
      a.href = url
      a.download = buildFileName()
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)
      notify.success('PDF indirildi')
    } catch (err) {
      notify.error(err?.message || err?.response?.data?.message || 'PDF indirilemedi')
    } finally {
      setDownloading(false)
    }
  }

  const printPdf = async () => {
    if (!canRun) return
    setPrinting(true)
    try {
      const blob = await getAdminReportPdf({ type, startDate, endDate })
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))

      const w = window.open(url)
      if (!w) {
        notify.error('Popup engellendi. Tarayıcıda popuplara izin ver.')
        return
      }

      // PDF viewer yüklenince print
      const interval = setInterval(() => {
        try {
          if (w.document?.readyState === 'complete') {
            clearInterval(interval)
            w.focus()
            w.print()
          }
        } catch (_) {
          // cross-origin gibi görünse de blob URL genelde sorun çıkarmaz
        }
      }, 300)

      notify.success('Yazdırma penceresi açıldı')
    } catch (err) {
      notify.error(err?.message || err?.response?.data?.message || 'Yazdırma başlatılamadı')
    } finally {
      setPrinting(false)
    }
  }

  return (
    <CCard>
      <CCardHeader>Raporlama & Yazdırma</CCardHeader>
      <CCardBody>
        <CAlert color="info" className="mb-3">
          Bu sayfadan rapor tipini ve tarih aralığını seçerek PDF rapor indirebilir veya
          yazdırabilirsin.
        </CAlert>

        <CForm onSubmit={(e) => e.preventDefault()}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormSelect
                label="Rapor Tipi"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {REPORT_TYPES.map((r) => (
                  <option key={r.value} value={r.value} disabled={r.disabled}>
                    {r.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={3}>
              <CFormInput
                label="Başlangıç Tarihi"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </CCol>

            <CCol md={3}>
              <CFormInput
                label="Bitiş Tarihi"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </CCol>

            <CCol md={12} className="d-flex gap-2 flex-wrap">
              <CButton color="primary" onClick={downloadPdf} disabled={!canRun || downloading}>
                {downloading ? <CSpinner size="sm" /> : 'PDF İndir'}
              </CButton>

              <CButton
                color="secondary"
                variant="outline"
                onClick={printPdf}
                disabled={!canRun || printing}
              >
                {printing ? <CSpinner size="sm" /> : 'Yazdır'}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}
