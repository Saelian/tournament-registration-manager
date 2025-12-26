export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  return isoDate.split('-').reverse().join('-')
}

export function formatTime(time: string): string {
  if (!time) return ''
  return time.slice(0, 5)
}

export function formatPrice(priceInCents: number): string {
  return (priceInCents / 100).toString()
}
