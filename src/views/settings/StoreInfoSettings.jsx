import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import { getAdminSettings, updateAdminSettings } from '../../api/settings'
import { notify } from '../../utils/toast'

export default function StoreInfoSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    storeName: '',
    storeLogo: '',
    storePhone: '',
    storeEmail: '',
    storeAddress: '',
    invoiceTitle: '',
    invoiceTaxNumber: '',
    invoiceTaxOffice: '',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await getAdminSettings()
      setForm((prev) => ({ ...prev, ...data }))
    } catch {
      notify.error('Mağaza bilgileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const current = await getAdminSettings()
      await updateAdminSettings({ ...current, ...form })
      notify.success('Mağaza bilgileri kaydedildi')
      fetchData()
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
      <CCardHeader>Mağaza Genel Bilgileri</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormInput
                label="Mağaza Adı"
                name="storeName"
                value={form.storeName}
                onChange={onChange}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Logo URL"
                name="storeLogo"
                value={form.storeLogo}
                onChange={onChange}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Telefon"
                name="storePhone"
                value={form.storePhone}
                onChange={onChange}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="E-posta"
                name="storeEmail"
                value={form.storeEmail}
                onChange={onChange}
              />
            </CCol>
            <CCol md={12}>
              <CFormTextarea
                label="Adres"
                name="storeAddress"
                rows={3}
                value={form.storeAddress}
                onChange={onChange}
              />
            </CCol>

            <CCol md={12}>
              <hr />
            </CCol>

            <CCol md={4}>
              <CFormInput
                label="Fatura Ünvanı"
                name="invoiceTitle"
                value={form.invoiceTitle}
                onChange={onChange}
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                label="Vergi No"
                name="invoiceTaxNumber"
                value={form.invoiceTaxNumber}
                onChange={onChange}
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                label="Vergi Dairesi"
                name="invoiceTaxOffice"
                value={form.invoiceTaxOffice}
                onChange={onChange}
              />
            </CCol>

            <CCol md={12} className="d-flex gap-2">
              <CButton type="submit" color="primary" disabled={saving}>
                {saving ? <CSpinner size="sm" /> : 'Kaydet'}
              </CButton>
              <CButton color="secondary" variant="outline" onClick={fetchData}>
                Yenile
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}
