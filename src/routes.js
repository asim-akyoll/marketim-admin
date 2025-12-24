import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const OrdersList = React.lazy(() => import('./views/orders/OrdersList'))
const OrderDetail = React.lazy(() => import('./views/orders/OrderDetail'))
const ProductsList = React.lazy(() => import('./views/products/ProductsList'))
const ProductForm = React.lazy(() => import('./views/products/ProductForm'))
const LowStockProducts = React.lazy(() => import('./views/products/LowStockProducts'))
const StockHistory = React.lazy(() => import('./views/products/StockHistory'))
const CategoriesList = React.lazy(() => import('./views/categories/CategoriesList'))
const CategoryForm = React.lazy(() => import('./views/categories/CategoryForm'))
const CustomersList = React.lazy(() => import('./views/customers/CustomersList'))
const CustomerDetail = React.lazy(() => import('./views/customers/CustomerDetail'))
const ShippingPaymentSettings = React.lazy(() => import('./views/settings/ShippingPaymentSettings'))
const OperationSettings = React.lazy(() => import('./views/settings/OperationSettings'))
const StoreInfoSettings = React.lazy(() => import('./views/settings/StoreInfoSettings'))
const SystemSettings = React.lazy(() => import('./views/settings/SystemSettings'))
const ContentSettings = React.lazy(() => import('./views/settings/ContentSettings'))
const Reports = React.lazy(() => import('./views/settings/Reports'))

const routes = [
  { path: '/orders', name: 'Orders', element: OrdersList },
  { path: '/categories', name: 'Categories', element: CategoriesList },
  { path: '/categories/new', name: 'New Category', element: CategoryForm },
  { path: '/categories/:id', name: 'Edit Category', element: CategoryForm },
  { path: '/customers', name: 'Customers', element: CustomersList },
  { path: '/customers/:id', name: 'Customer Detail', element: CustomerDetail },

  { path: '/products', name: 'Products', element: ProductsList },
  { path: '/products/new', name: 'New Product', element: ProductForm },
  { path: '/products/:id', name: 'Edit Product', element: ProductForm },
  { path: '/products/low-stock', name: 'Low Stock', element: LowStockProducts },
  { path: '/products/:productId/stock-history', name: 'Stock History', element: StockHistory },
  {
    path: '/settings/shipping-payment',
    name: 'Teslimat & Ödeme',
    element: ShippingPaymentSettings,
  },
  {
    path: '/settings/operation',
    name: 'Operasyon & Çalışma Saatleri',
    element: OperationSettings,
  },
  {
    path: '/settings/store-info',
    name: 'Mağaza Bilgileri',
    element: StoreInfoSettings,
  },
  {
    path: '/settings/system',
    name: 'Sistem',
    element: SystemSettings,
  },
  {
    path: '/settings/content',
    name: 'İçerik',
    element: ContentSettings,
  },
  {
    path: '/settings/reports',
    name: 'Raporlama & Yazdırma',
    element: Reports,
  },

  { path: '/orders/:id', name: 'Order Detail', element: OrderDetail },
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
]

export default routes
