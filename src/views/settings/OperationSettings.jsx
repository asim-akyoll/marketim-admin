import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormSwitch,
  CFormInput,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import { getAdminSettings, updateAdminSettings } from '../../api/settings'
import { notify } from '../../utils/toast'

export default function OperationSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [workingHoursEnabled, setWorkingHoursEnabled] = useState(false)
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00')
  const [workingHoursEnd, setWorkingHoursEnd] = useState('22:00')
  const [estimatedDeliveryMinutes, setEstimatedDeliveryMinutes] = useState('')
  const [deliveryZones, setDeliveryZones] = useState('')
  const [orderClosedMessage, setOrderClosedMessage] = useState('')

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const data = await getAdminSettings()

      setWorkingHoursEnabled(Boolean(data.workingHoursEnabled))
      setWorkingHoursStart(data.workingHoursStart || '09:00')
      setWorkingHoursEnd(data.workingHoursEnd || '22:00')

      setEstimatedDeliveryMinutes(
        data.estimatedDeliveryMinutes > 0 ? String(data.estimatedDeliveryMinutes) : '',
      )

      setDeliveryZones((data.deliveryZones || []).join(', '))
      setOrderClosedMessage(data.orderClosedMessage || '')
    } catch (err) {
      notify.error('Ayarlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Not: PATCH request'in tüm alanları bekliyor olabilir.
      // Bu yüzden önce mevcut settings'i alıp merge yapıyoruz (güvenli).
      const current = await getAdminSettings()

      await updateAdminSettings({
        ...current,
        workingHoursEnabled,
        workingHoursStart,
        workingHoursEnd,
        estimatedDeliveryMinutes:
          estimatedDeliveryMinutes === '' ? 0 : Number(estimatedDeliveryMinutes),
        deliveryZones: deliveryZones
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
        orderClosedMessage,
      })

      notify.success('Operasyon ayarları kaydedildi')
      fetchSettings()
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Kaydetme hatası')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <CCard>
        <CCardBody>
          <CSpinner size="sm" /> Yükleniyor...
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard>
      <CCardHeader>Operasyon / Çalışma Saatleri</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={12}>
              <CFormSwitch
                label="Çalışma Saatleri Aktif"
                checked={workingHoursEnabled}
                onChange={(e) => setWorkingHoursEnabled(e.target.checked)}
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                label="Başlangıç Saati"
                type="time"
                disabled={!workingHoursEnabled}
                value={workingHoursStart}
                onChange={(e) => setWorkingHoursStart(e.target.value)}
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                label="Bitiş Saati"
                type="time"
                disabled={!workingHoursEnabled}
                value={workingHoursEnd}
                onChange={(e) => setWorkingHoursEnd(e.target.value)}
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                label="Tahmini Teslim Süresi (dk)"
                type="number"
                placeholder="45"
                value={estimatedDeliveryMinutes}
                onChange={(e) => setEstimatedDeliveryMinutes(e.target.value)}
              />
            </CCol>

            <CCol md={6}>
              <CFormTextarea
                label="Teslimat Bölgeleri (virgülle)"
                placeholder="Kadıköy, Beşiktaş, Üsküdar"
                rows={2}
                value={deliveryZones}
                onChange={(e) => setDeliveryZones(e.target.value)}
              />
            </CCol>

            <CCol md={12}>
              <CFormInput
                label="Sipariş Kapalı Mesajı"
                placeholder="Şu anda hizmet veremiyoruz."
                value={orderClosedMessage}
                onChange={(e) => setOrderClosedMessage(e.target.value)}
              />
            </CCol>

            <CCol md={12} className="d-flex gap-2">
              <CButton type="submit" color="primary" disabled={saving}>
                {saving ? <CSpinner size="sm" /> : 'Kaydet'}
              </CButton>
              <CButton type="button" color="secondary" variant="outline" onClick={fetchSettings}>
                Yenile
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}
