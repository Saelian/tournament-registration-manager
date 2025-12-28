export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  return isoDate.split('-').reverse().join('-')
}

export function formatTime(time: string): string {
  if (!time) return ''
  return time.slice(0, 5)
}

export function formatPrice(price: number): string {
  return price.toString()
}
