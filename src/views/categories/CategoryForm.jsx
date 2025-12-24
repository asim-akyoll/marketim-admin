// src/views/categories/CategoryForm.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
  CSpinner,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { notify } from '../../utils/toast'
import {
  createAdminCategory,
  getAdminCategoryById,
  updateAdminCategory,
} from '../../api/categories'

const buildClientErrors = ({ name, description }) => {
  const next = {}

  const n = (name ?? '').trim()
  if (!n) next.name = 'Kategori adı zorunlu'
  else if (n.length < 2 || n.length > 60) next.name = 'Kategori adı 2-60 karakter olmalı'

  const d = (description ?? '').trim()
  if (d && d.length > 255) next.description = 'Açıklama en fazla 255 karakter olmalı'

  return next
}

export default function CategoryForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [loadingCategory, setLoadingCategory] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)

  // Edit modunda category çek
  useEffect(() => {
    if (!isEdit) return

    setLoadingCategory(true)
    setServerError(null)

    getAdminCategoryById(id)
      .then((c) => {
        setForm({
          name: c?.name ?? '',
          description: c?.description ?? '',
        })
      })
      .catch((err) => {
        const msg = err?.message || 'Kategori bulunamadı / yüklenemedi'
        setServerError(msg)
      })
      .finally(() => setLoadingCategory(false))
  }, [id, isEdit])

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const validate = () => {
    const next = buildClientErrors(form)
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const payload = useMemo(() => {
    return {
      name: form.name.trim(),
      description: form.description.trim() || null,
    }
  }, [form])

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) return

    setLoading(true)
    try {
      if (isEdit) {
        await updateAdminCategory(id, payload)
        notify.success('Kategori güncellendi')
      } else {
        await createAdminCategory(payload)
        notify.success('Kategori oluşturuldu')
      }

      navigate('/categories')
    } catch (err) {
      // axios interceptor senin projede error.response.data’yı reject ediyordu
      // o yüzden burada err.message beklemek doğru
      const msg = err?.validationErrors?.name || err?.message || 'İşlem başarısız'

      setServerError(msg)
      notify.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (isEdit && loadingCategory) {
    return (
      <div className="d-flex align-items-center gap-2">
        <CSpinner size="sm" />
        <span className="text-body-secondary">Kategori yükleniyor...</span>
      </div>
    )
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>{isEdit ? `Kategori Düzenle (#${id})` : 'Yeni Kategori'}</strong>
      </CCardHeader>

      <CCardBody>
        {serverError && (
          <CAlert color="danger" className="mb-3">
            {serverError}
          </CAlert>
        )}

        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Kategori Adı</CFormLabel>
              <CFormInput
                value={form.name}
                onChange={onChange('name')}
                invalid={!!errors.name}
                placeholder="Örn: Meyve & Sebzeler"
              />
              {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
            </CCol>

            <CCol md={12}>
              <CFormLabel>Açıklama</CFormLabel>
              <CFormTextarea
                rows={4}
                value={form.description}
                onChange={onChange('description')}
                invalid={!!errors.description}
                placeholder="Opsiyonel açıklama"
              />
              {errors.description && (
                <div className="text-danger small mt-1">{errors.description}</div>
              )}
            </CCol>

            <CCol md={12} className="d-flex justify-content-end gap-2">
              <CButton
                color="secondary"
                variant="outline"
                onClick={() => navigate('/categories')}
                disabled={loading}
              >
                İptal
              </CButton>
              <CButton color="primary" type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}
