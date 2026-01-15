export function formatDate(isoDate: string): string {
    if (!isoDate) return ''
    // Extraire uniquement la partie date (avant le 'T' si c'est un timestamp ISO complet)
    const datePart = isoDate.includes('T') ? isoDate.split('T')[0] : isoDate
    return datePart.split('-').reverse().join('-')
}

export function formatDateTime(isoDateTime: string): string {
    if (!isoDateTime) return ''
    const date = new Date(isoDateTime)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day}-${month}-${year} ${hours}:${minutes}`
}

export function formatTime(time: string): string {
    if (!time) return ''
    return time.slice(0, 5)
}

export function formatPrice(price: number): string {
    return price.toString()
}
