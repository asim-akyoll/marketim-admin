export const statusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'DELIVERED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    default:
      return 'secondary'
  }
}

export const statusLabelTR = (status) => {
  switch (status) {
    case 'PENDING':
      return 'Beklemede'
    case 'DELIVERED':
      return 'Teslim Edildi'
    case 'CANCELLED':
      return 'İptal'
    default:
      return status ?? '-'
  }
}

/**
 * UI tarafında hangi geçişlere izin vereceğimizi belirler.
 * Backend kuralınla uyumlu:
 * - CANCELLED -> hiçbir şeye dönemez
 * - DELIVERED -> geri dönemez
 * - PENDING -> DELIVERED / CANCELLED olabilir
 */
export const allowedNextStatuses = (currentStatus) => {
  switch (currentStatus) {
    case 'PENDING':
      return ['PENDING', 'DELIVERED', 'CANCELLED']
    case 'DELIVERED':
      return ['DELIVERED']
    case 'CANCELLED':
      return ['CANCELLED']
    default:
      return ['PENDING', 'DELIVERED', 'CANCELLED']
  }
}
