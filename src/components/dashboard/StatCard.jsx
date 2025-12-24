import React from 'react'
import { CCard, CCardBody } from '@coreui/react'

const StatCard = ({ title, value, subtitle }) => {
  return (
    <CCard className="h-100">
      <CCardBody>
        <div className="text-body-secondary small">{title}</div>
        <div className="fs-4 fw-semibold">{value}</div>
        {subtitle ? <div className="small text-body-secondary">{subtitle}</div> : null}
      </CCardBody>
    </CCard>
  )
}

export default StatCard
