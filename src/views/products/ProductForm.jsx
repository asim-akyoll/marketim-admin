import { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormLabel,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCategories } from '../../api/categories'
import { createAdminProduct, getAdminProductById, updateAdminProduct } from '../../api/products'
import { notify } from '../../utils/toast'

const toNumberOrNull = (v) => {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const triggerLowStockRefresh = () => {
  window.dispatchEvent(new Event('lowstock:refresh'))
}

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(false)

  const [categories, setCategories] = useState([])

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: '',
  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        // güvence: active false gelirse seçtirmeyelim (public endpointte gelmez ama garanti)
        setCategories(list.filter((c) => c?.active !== false))
      })
      .catch(() => setCategories([]))
  }, [])

  // Edit ise ürünü çek
  useEffect(() => {
    if (!isEdit) return
    setServerError(null)
    setLoadingProduct(true)

    getAdminProductById(id)
      .then((p) => {
        setForm({
          name: p.name ?? '',
          description: p.description ?? '',
          price: p.price ?? '',
          stock: p.stock ?? '',
          imageUrl: p.imageUrl ?? '',
          categoryId: p.categoryId ? String(p.categoryId) : '',
        })
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Ürün bulunamadı / yüklenemedi'
        setServerError(msg)
      })
      .finally(() => setLoadingProduct(false))
  }, [id, isEdit])

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const validate = () => {
    const next = {}

    if (!form.name.trim()) next.name = 'Ürün adı zorunlu'
    if (!form.categoryId) next.categoryId = 'Kategori zorunlu'

    const price = toNumberOrNull(form.price)
    if (price == null || price < 0) next.price = 'Fiyat 0 ve üzeri olmalı'

    const stock = toNumberOrNull(form.stock)
    if (!Number.isInteger(stock) || stock < 0) next.stock = 'Stok 0 ve üzeri tam sayı olmalı'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const payload = useMemo(() => {
    return {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim() || null,
      categoryId: Number(form.categoryId),
    }
  }, [form])

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) return

    setLoading(true)
    try {
      if (isEdit) {
        await updateAdminProduct(id, payload)
        notify.success('Ürün güncellendi')
      } else {
        await createAdminProduct(payload)
        notify.success('Ürün oluşturuldu')
      }

      triggerLowStockRefresh()
      navigate('/products')
    } catch (err) {
      const msg = err?.response?.data?.message || 'İşlem başarısız'
      setServerError(msg)
      notify.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (isEdit && loadingProduct) {
    return (
      <div className="d-flex align-items-center gap-2">
        <CSpinner size="sm" />
        <span className="text-body-secondary">Ürün yükleniyor...</span>
      </div>
    )
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>{isEdit ? `Ürün Düzenle (#${id})` : 'Yeni Ürün'}</strong>
      </CCardHeader>

      <CCardBody>
        {serverError && (
          <CAlert color="danger" className="mb-3">
            {serverError}
            <div className="small mt-2 text-body-secondary">
              Not: Pasif kategorilere ürün eklenemez.
            </div>
          </CAlert>
        )}

        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Ürün Adı</CFormLabel>
              <CFormInput value={form.name} onChange={onChange('name')} invalid={!!errors.name} />
              {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
            </CCol>

            <CCol md={6}>
              <CFormLabel>Kategori</CFormLabel>
              <CFormSelect
                value={form.categoryId}
                onChange={onChange('categoryId')}
                invalid={!!errors.categoryId}
              >
                <option value="">Seçiniz</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </CFormSelect>
              {errors.categoryId && (
                <div className="text-danger small mt-1">{errors.categoryId}</div>
              )}
            </CCol>

            <CCol md={4}>
              <CFormLabel>Fiyat</CFormLabel>
              <CFormInput
                type="number"
                step="0.01"
                value={form.price}
                onChange={onChange('price')}
                invalid={!!errors.price}
              />
              {errors.price && <div className="text-danger small mt-1">{errors.price}</div>}
            </CCol>

            <CCol md={4}>
              <CFormLabel>Stok</CFormLabel>
              <CFormInput
                type="number"
                step="1"
                value={form.stock}
                onChange={onChange('stock')}
                invalid={!!errors.stock}
              />
              {errors.stock && <div className="text-danger small mt-1">{errors.stock}</div>}
            </CCol>

            <CCol md={4}>
              <CFormLabel>Image URL</CFormLabel>
              <CFormInput value={form.imageUrl} onChange={onChange('imageUrl')} />
            </CCol>

            <CCol md={12}>
              <CFormLabel>Açıklama</CFormLabel>
              <CFormTextarea rows={4} value={form.description} onChange={onChange('description')} />
            </CCol>

            <CCol md={12} className="d-flex justify-content-end gap-2">
              <CButton color="secondary" variant="outline" onClick={() => navigate('/products')}>
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
