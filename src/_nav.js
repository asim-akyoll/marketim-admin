import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilBasket, cilCart, cilList, cilPeople } from '@coreui/icons'
import { CNavItem, CNavGroup, CNavTitle } from '@coreui/react'
import { cilClock } from '@coreui/icons'

export const getNav = (lowStockCount = 0) => [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Siparişler',
    to: '/orders',
    icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Ürün Yönetimi',
    icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Kategoriler',
        to: '/categories',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
      },
      { component: CNavItem, name: 'Ürünler', to: '/products' },
      {
        component: CNavItem,
        name: 'Low Stock',
        to: '/products/low-stock?threshold=10',
        badge: lowStockCount > 0 ? { color: 'danger', text: String(lowStockCount) } : undefined,
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Müşteriler',
    to: '/customers',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Ayarlar',
  },
  {
    component: CNavItem,
    name: 'Teslimat & Ödeme',
    to: '/settings/shipping-payment',
  },
  {
    component: CNavItem,
    name: 'Operasyon & Çalışma Saatleri',
    to: '/settings/operation',
  },
  {
    component: CNavItem,
    name: 'Mağaza Bilgileri',
    to: '/settings/store-info',
  },
  {
    component: CNavItem,
    name: 'Sistem',
    to: '/settings/system',
  },
  {
    component: CNavItem,
    name: 'İçerik',
    to: '/settings/content',
  },
  {
    component: CNavItem,
    name: 'Raporlama & Yazdırma',
    to: '/settings/reports',
  },
]

export default getNav
