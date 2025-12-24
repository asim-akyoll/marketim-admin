import React, { useEffect, useMemo, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CFormTextarea,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CAlert,
} from '@coreui/react'
import { getAdminSettings, updateAdminSettings } from '../../api/settings'
import { notify } from '../../utils/toast'

const BASE_TABS = [
  { key: 'faq', label: 'SSS' },
  { key: 'terms', label: 'Kurallar' },
  { key: 'kvkk', label: 'KVKK' },
]

export default function ContentSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeKey, setActiveKey] = useState('faq')

  const [faqText, setFaqText] = useState('')
  const [termsText, setTermsText] = useState('')
  const [kvkkText, setKvkkText] = useState('')
  const [distanceSalesText, setDistanceSalesText] = useState('')

  const showDistance = useMemo(() => distanceSalesText?.trim() !== '', [distanceSalesText])

  const tabs = useMemo(() => {
    // Mesafeli satış metni doluysa tab ekle
    return showDistance ? [...BASE_TABS, { key: 'distance', label: 'Mesafeli Satış' }] : BASE_TABS
  }, [showDistance])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const data = await getAdminSettings()
      setFaqText(data.faqText || '')
      setTermsText(data.termsText || '')
      setKvkkText(data.kvkkText || '')
      setDistanceSalesText(data.distanceSalesText || '')
    } catch {
      notify.error('İçerik ayarları yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Mesafeli satış metni boşaldıysa aktif tab distance ise faq'a dön
  useEffect(() => {
    if (!showDistance && activeKey === 'distance') {
      setActiveKey('faq')
    }
  }, [showDistance, activeKey])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const current = await getAdminSettings()

      await updateAdminSettings({
        ...current,
        faqText,
        termsText,
        kvkkText,
        distanceSalesText,
      })

      notify.success('İçerikler kaydedildi')
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
      <CCardHeader>İçerik</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CNav variant="tabs">
            {tabs.map((t) => (
              <CNavItem key={t.key}>
                <CNavLink active={activeKey === t.key} onClick={() => setActiveKey(t.key)}>
                  {t.label}
                </CNavLink>
              </CNavItem>
            ))}
          </CNav>

          <CTabContent className="mt-3">
            <CTabPane visible={activeKey === 'faq'}>
              <CFormTextarea
                label="SSS Metni"
                rows={10}
                value={faqText}
                onChange={(e) => setFaqText(e.target.value)}
                placeholder="SSS içeriğini buraya yaz..."
              />
            </CTabPane>

            <CTabPane visible={activeKey === 'terms'}>
              <CFormTextarea
                label="Kurallar Metni"
                rows={10}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                placeholder="Kurallar / kullanım şartları..."
              />
            </CTabPane>

            <CTabPane visible={activeKey === 'kvkk'}>
              <CFormTextarea
                label="KVKK Metni"
                rows={10}
                value={kvkkText}
                onChange={(e) => setKvkkText(e.target.value)}
                placeholder="KVKK metni..."
              />
            </CTabPane>

            {showDistance && (
              <CTabPane visible={activeKey === 'distance'}>
                <CFormTextarea
                  label="Mesafeli Satış Sözleşmesi"
                  rows={10}
                  value={distanceSalesText}
                  onChange={(e) => setDistanceSalesText(e.target.value)}
                  placeholder="Mesafeli satış sözleşmesi metni..."
                />
              </CTabPane>
            )}
          </CTabContent>

          {!showDistance && (
            <div className="mt-3">
              <span
                className="text-info small px-2 py-1"
                style={{
                  backgroundColor: 'rgba(13, 202, 240, 0.15)',
                  borderRadius: '6px',
                  display: 'inline-block',
                }}
              >
                Mesafeli satış sözleşmesi metni eklemek istersen aşağıdaki alana yazabilirsin.
              </span>
            </div>
          )}

          {/* Mesafeli satış metni boşken de ekleyebilmek için alanı her zaman gösteriyoruz */}
          <div className="mt-3">
            <CFormTextarea
              label="Mesafeli Satış Sözleşmesi (Opsiyonel)"
              rows={8}
              value={distanceSalesText}
              onChange={(e) => setDistanceSalesText(e.target.value)}
              placeholder="İstersen mesafeli satış sözleşmesi metnini buraya ekle..."
            />
          </div>

          <CRow className="mt-3">
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
