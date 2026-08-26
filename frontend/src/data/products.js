export function formatPrice(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function effectivePrice(product) {
  if (!product?.discount) return product.price
  return Math.round(product.price * (1 - product.discount / 100))
}
