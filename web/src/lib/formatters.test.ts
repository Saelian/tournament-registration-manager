import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, formatPrice } from './formatters'

describe('formatters', () => {
    describe('formatDate', () => {
        it('formats ISO date to dd-MM-yyyy', () => {
            expect(formatDate('2025-06-15')).toBe('15-06-2025')
        })

        it('returns empty string for empty input', () => {
            expect(formatDate('')).toBe('')
        })
    })

    describe('formatTime', () => {
        it('slices time to HH:mm', () => {
            expect(formatTime('14:30:00')).toBe('14:30')
            expect(formatTime('09:05:59')).toBe('09:05')
        })

        it('returns empty string for empty input', () => {
            expect(formatTime('')).toBe('')
        })
    })

    describe('formatPrice', () => {
        it('converts price to string', () => {
            expect(formatPrice(10)).toBe('10')
            expect(formatPrice(10.5)).toBe('10.5')
            expect(formatPrice(0.5)).toBe('0.5')
            expect(formatPrice(0)).toBe('0')
        })
    })
})
