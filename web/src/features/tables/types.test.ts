import { describe, it, expect } from 'vitest'
import { tableSchema } from './types'

describe('tableSchema', () => {
  const validTable = {
    name: 'Table A',
    date: '2025-06-15',
    startTime: '10:00',
    pointsMin: 500,
    pointsMax: 1000,
    quota: 24,
    price: 10,
    isSpecial: false,
  }

  it('validates a correct table', () => {
    const result = tableSchema.safeParse(validTable)
    expect(result.success).toBe(true)
  })

  it('fails when name is empty', () => {
    const result = tableSchema.safeParse({ ...validTable, name: '' })
    expect(result.success).toBe(false)
  })

  it('fails when date is empty', () => {
    const result = tableSchema.safeParse({ ...validTable, date: '' })
    expect(result.success).toBe(false)
  })

  it('fails when startTime format is invalid', () => {
    const result = tableSchema.safeParse({ ...validTable, startTime: '25:00' })
    expect(result.success).toBe(false)
  })

  it('accepts valid startTime formats', () => {
    expect(tableSchema.safeParse({ ...validTable, startTime: '00:00' }).success).toBe(true)
    expect(tableSchema.safeParse({ ...validTable, startTime: '9:05' }).success).toBe(true)
    expect(tableSchema.safeParse({ ...validTable, startTime: '23:59' }).success).toBe(true)
  })

  it('fails when pointsMin is negative', () => {
    const result = tableSchema.safeParse({ ...validTable, pointsMin: -1 })
    expect(result.success).toBe(false)
  })

  it('fails when pointsMax is less than pointsMin', () => {
    const result = tableSchema.safeParse({ ...validTable, pointsMin: 1000, pointsMax: 500 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('pointsMax')
    }
  })

  it('accepts when pointsMax equals pointsMin', () => {
    const result = tableSchema.safeParse({ ...validTable, pointsMin: 500, pointsMax: 500 })
    expect(result.success).toBe(true)
  })

  it('fails when quota is less than 1', () => {
    const result = tableSchema.safeParse({ ...validTable, quota: 0 })
    expect(result.success).toBe(false)
  })

  it('fails when price is negative', () => {
    const result = tableSchema.safeParse({ ...validTable, price: -1 })
    expect(result.success).toBe(false)
  })

  it('accepts price of 0 (free tables)', () => {
    const result = tableSchema.safeParse({ ...validTable, price: 0 })
    expect(result.success).toBe(true)
  })

  it('defaults isSpecial to false', () => {
    const tableWithoutSpecial = { ...validTable }
    delete (tableWithoutSpecial as Record<string, unknown>).isSpecial
    const result = tableSchema.safeParse(tableWithoutSpecial)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isSpecial).toBe(false)
    }
  })

  it('coerces string numbers to numbers', () => {
    const result = tableSchema.safeParse({
      ...validTable,
      pointsMin: '500',
      pointsMax: '1000',
      quota: '24',
      price: '10',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.pointsMin).toBe(500)
      expect(result.data.pointsMax).toBe(1000)
      expect(result.data.quota).toBe(24)
      expect(result.data.price).toBe(10)
    }
  })
})
