import React from 'react'
import { CButton, CContainer } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

const Page403 = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer className="text-center">
        <div className="clearfix">
          <h1 className="float-start display-3 me-4">403</h1>
          <h4 className="pt-3">Yetkiniz yok</h4>
          <p className="text-body-secondary">
            Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.
          </p>
        </div>

        <div className="d-flex justify-content-center gap-2 mt-3">
          <CButton color="primary" onClick={() => navigate('/dashboard', { replace: true })}>
            Dashboard’a dön
          </CButton>
          <CButton color="secondary" variant="outline" onClick={() => navigate(-1)}>
            Geri
          </CButton>
        </div>
      </CContainer>
    </div>
  )
}

export default Page403
