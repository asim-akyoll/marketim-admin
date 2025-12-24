import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormSwitch,
  CFormCheck,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CFormTextarea,
} from '@coreui/react'
import { getAdminSettings, updateAdminSettings } from '../../api/settings'
import { notify } from '../../utils/toast'

const METHODS = [
  { key: 'CASH', label: 'Kapıda Nakit' },
  { key: 'CARD', label: 'Kapıda Kredi Kartı' },
]

export default function ShippingPaymentSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Delivery
  const [deliveryFeeFixed, setDeliveryFeeFixed] = useState('')
  const [deliveryFreeThreshold, setDeliveryFreeThreshold] = useState('')

  // Payment
  const [payOnDeliveryEnabled, setPayOnDeliveryEnabled] = useState(true)
  const [payOnDeliveryMethods, setPayOnDeliveryMethods] = useState(['CASH', 'CARD'])

  // Order rules
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [orderAcceptingEnabled, setOrderAcceptingEnabled] = useState(true)

  // Return / Cancel policy text
  const [returnCancelPolicyText, setReturnCancelPolicyText] = useState('')

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const data = await getAdminSettings()

      // 0 ise input boş kalsın -> placeholder görünsün
      setDeliveryFeeFixed(data.deliveryFeeFixed > 0 ? String(data.deliveryFeeFixed) : '')
      setDeliveryFreeThreshold(
        data.deliveryFreeThreshold > 0 ? String(data.deliveryFreeThreshold) : '',
      )

      setPayOnDeliveryEnabled(Boolean(data.payOnDeliveryEnabled))
      setPayOnDeliveryMethods(data.payOnDeliveryMethods ?? [])

      setMinOrderAmount(data.minOrderAmount > 0 ? String(data.minOrderAmount) : '')
      setOrderAcceptingEnabled(Boolean(data.orderAcceptingEnabled))

      setReturnCancelPolicyText(data.returnCancelPolicyText || '')
    } catch (err) {
      notify.error('Ayarlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Kapıda ödeme kapatılınca yöntemleri temizle
  useEffect(() => {
    if (!payOnDeliveryEnabled) {
      setPayOnDeliveryMethods([])
    }
  }, [payOnDeliveryEnabled])

  const toggleMethod = (methodKey) => {
    setPayOnDeliveryMethods((prev) =>
      prev.includes(methodKey) ? prev.filter((x) => x !== methodKey) : [...prev, methodKey],
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Not: PATCH request'in tüm alanları bekliyor olabilir.
      // Bu yüzden önce mevcut settings'i alıp merge yapıyoruz (güvenli).
      const current = await getAdminSettings()

      await updateAdminSettings({
        ...current,
        deliveryFeeFixed: deliveryFeeFixed === '' ? 0 : Number(deliveryFeeFixed),
        deliveryFreeThreshold: deliveryFreeThreshold === '' ? 0 : Number(deliveryFreeThreshold),

        payOnDeliveryEnabled,
        payOnDeliveryMethods,

        minOrderAmount: minOrderAmount === '' ? 0 : Number(minOrderAmount),
        orderAcceptingEnabled,

        returnCancelPolicyText,
      })

      notify.success('Ayarlar kaydedildi')
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
      <CCardHeader>Teslimat & Ödeme</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          {!orderAcceptingEnabled && (
            <CAlert color="warning" className="mb-3">
              <strong>Dikkat:</strong> Sipariş alımı şu anda kapalı.
            </CAlert>
          )}

          <CRow className="g-3">
            {/* Delivery */}
            <CCol md={6}>
              <CFormInput
                label="Teslimat Ücreti (₺)"
                type="number"
                step="0.01"
                placeholder="0,0"
                value={deliveryFeeFixed}
                onChange={(e) => setDeliveryFeeFixed(e.target.value)}
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                label="Ücretsiz Teslimat Eşiği (₺)"
                type="number"
                step="0.01"
                placeholder="0,0"
                value={deliveryFreeThreshold}
                onChange={(e) => setDeliveryFreeThreshold(e.target.value)}
              />
            </CCol>

            {/* Payment */}
            <CCol md={12}>
              <CFormSwitch
                label="Kapıda Ödeme Aktif"
                checked={payOnDeliveryEnabled}
                onChange={(e) => setPayOnDeliveryEnabled(e.target.checked)}
              />
            </CCol>

            <CCol md={12}>
              <div className="fw-semibold mb-1">Kapıda Ödeme Yöntemleri</div>
              {METHODS.map((m) => (
                <CFormCheck
                  key={m.key}
                  label={m.label}
                  checked={payOnDeliveryMethods.includes(m.key)}
                  disabled={!payOnDeliveryEnabled}
                  onChange={() => toggleMethod(m.key)}
                />
              ))}
            </CCol>

            {/* Order rules */}
            <CCol md={12}>
              <hr />
              <div className="fw-semibold">Sipariş Kuralları</div>
            </CCol>

            <CCol md={6}>
              <CFormInput
                label="Minimum Sipariş Tutarı (₺)"
                type="number"
                step="0.01"
                placeholder="0,0"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
              />
            </CCol>

            <CCol md={6}>
              <CFormSwitch
                label="Sipariş Alımı Açık"
                checked={orderAcceptingEnabled}
                onChange={(e) => setOrderAcceptingEnabled(e.target.checked)}
              />
            </CCol>

            {/* Return / Cancel Policy */}
            <CCol md={12}>
              <hr />
              <div className="fw-semibold">İade / İptal Politikası</div>
            </CCol>

            <CCol md={12}>
              <CFormTextarea
                label="Müşteriye gösterilecek metin"
                placeholder="Örn: Siparişiniz teslim edilmeden önce iptal edilebilir. Teslimattan sonra 14 gün içinde iade talebi oluşturabilirsiniz..."
                rows={6}
                value={returnCancelPolicyText}
                onChange={(e) => setReturnCancelPolicyText(e.target.value)}
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
