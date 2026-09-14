const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
})

const inrCompactFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 2
})

export function formatINR(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return inrFormatter.format(value)
}

export function formatINRCompact(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `₹${inrCompactFormatter.format(value)}`
}

export function formatArea(sqft) {
  if (!sqft) return '—'
  return `${sqft.toLocaleString('en-IN')} sqft`
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatRelativeDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const diffMs = Date.now() - d.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mo ago`
  return `${Math.floor(months / 12)} yr ago`
}

export function titleCase(str) {
  if (!str) return '—'
  return str
    .split(/[\s-]+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

export function pricePerSqft(price, area) {
  if (!price || !area) return null
  return price / area
}
