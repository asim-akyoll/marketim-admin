import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormSwitch,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { getAdminSettings, updateAdminSettings, clearAdminCache } from '../../api/settings'
import { notify } from '../../utils/toast'

export default function SystemSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)

  const [maintenanceModeEnabled, setMaintenanceModeEnabled] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('Şu an hizmet veremiyoruz.')

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const data = await getAdminSettings()
      setMaintenanceModeEnabled(Boolean(data.maintenanceModeEnabled))
      setMaintenanceMessage(data.maintenanceMessage || 'Şu an hizmet veremiyoruz.')
    } catch (err) {
      notify.error('Sistem ayarları yüklenemedi')
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
      const current = await getAdminSettings()

      await updateAdminSettings({
        ...current,
        maintenanceModeEnabled,
        maintenanceMessage,
      })

      notify.success('Sistem ayarları kaydedildi')
      fetchSettings()
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Kaydetme hatası')
    } finally {
      setSaving(false)
    }
  }

  const onClearCache = async () => {
    if (
      !confirm(
        'Cache temizlenecek. Bu işlem veritabanındaki hiçbir veriyi silmez. Devam edilsin mi?',
      )
    )
      return

    setClearing(true)
    try {
      const res = await clearAdminCache()
      notify.success(res?.message || 'Cache temizlendi')
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Cache temizlenemedi')
    } finally {
      setClearing(false)
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
      <CCardHeader>Sistem</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={12}>
              <CFormSwitch
                label="Bakım Modu (Maintenance)"
                checked={maintenanceModeEnabled}
                onChange={(e) => setMaintenanceModeEnabled(e.target.checked)}
              />
            </CCol>

            {maintenanceModeEnabled && (
              <CCol md={5}>
                <CAlert color="warning">
                  Bakım modu aktifken müşteri tarafında “hizmet veremiyoruz” mesajı gösterilir.
                </CAlert>
              </CCol>
            )}

            <CCol md={12}>
              <CFormTextarea
                label="Bakım Modu Mesajı"
                rows={4}
                placeholder="Şu an hizmet veremiyoruz."
                value={maintenanceMessage}
                disabled={!maintenanceModeEnabled}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
              />
            </CCol>

            <CCol md={12}>
              <hr />
            </CCol>

            <CCol md={12}>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <CButton type="submit" color="primary" disabled={saving}>
                  {saving ? <CSpinner size="sm" /> : 'Kaydet'}
                </CButton>

                <CButton type="button" color="secondary" variant="outline" onClick={fetchSettings}>
                  Yenile
                </CButton>

                <CButton
                  type="button"
                  color="danger"
                  variant="outline"
                  onClick={onClearCache}
                  disabled={clearing}
                >
                  {clearing ? <CSpinner size="sm" /> : 'Cache Temizle'}
                </CButton>

                {/* Küçük açıklama */}
                <span className="text-info small ms-2">
                  Cache temizleme işlemi <strong>veritabanındaki hiçbir veriyi silmez</strong>.
                </span>
              </div>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}
