import { describe, it, expect } from 'vitest'
import { tournamentSchema } from './types'

describe('tournamentSchema', () => {
  const validTournament = {
    name: 'Tournoi de Badminton 2025',
    startDate: '2025-06-15',
    endDate: '2025-06-16',
    location: 'Gymnase Municipal',
    refundDeadline: null,
    waitlistTimerHours: 4,
  }

  it('validates a correct tournament', () => {
    const result = tournamentSchema.safeParse(validTournament)
    expect(result.success).toBe(true)
  })

  it('fails when name is empty', () => {
    const result = tournamentSchema.safeParse({ ...validTournament, name: '' })
    expect(result.success).toBe(false)
  })

  it('fails when name exceeds 255 characters', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      name: 'a'.repeat(256),
    })
    expect(result.success).toBe(false)
  })

  it('fails when startDate is empty', () => {
    const result = tournamentSchema.safeParse({ ...validTournament, startDate: '' })
    expect(result.success).toBe(false)
  })

  it('fails when endDate is empty', () => {
    const result = tournamentSchema.safeParse({ ...validTournament, endDate: '' })
    expect(result.success).toBe(false)
  })

  it('fails when endDate is before startDate', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      startDate: '2025-06-20',
      endDate: '2025-06-15',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('endDate')
    }
  })

  it('accepts when endDate equals startDate', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      startDate: '2025-06-15',
      endDate: '2025-06-15',
    })
    expect(result.success).toBe(true)
  })

  it('fails when location is empty', () => {
    const result = tournamentSchema.safeParse({ ...validTournament, location: '' })
    expect(result.success).toBe(false)
  })

  it('fails when location exceeds 500 characters', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      location: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('accepts null refundDeadline', () => {
    const result = tournamentSchema.safeParse({ ...validTournament, refundDeadline: null })
    expect(result.success).toBe(true)
  })

  it('accepts undefined refundDeadline', () => {
    const tournamentWithoutRefund = { ...validTournament }
    delete (tournamentWithoutRefund as Record<string, unknown>).refundDeadline
    const result = tournamentSchema.safeParse(tournamentWithoutRefund)
    expect(result.success).toBe(true)
  })

  it('accepts valid refundDeadline', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      refundDeadline: '2025-06-10',
    })
    expect(result.success).toBe(true)
  })

  it('fails when waitlistTimerHours is less than 1', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      waitlistTimerHours: 0,
    })
    expect(result.success).toBe(false)
  })

  it('fails when waitlistTimerHours exceeds 168', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      waitlistTimerHours: 169,
    })
    expect(result.success).toBe(false)
  })

  it('accepts waitlistTimerHours at boundary values', () => {
    expect(
      tournamentSchema.safeParse({ ...validTournament, waitlistTimerHours: 1 }).success
    ).toBe(true)
    expect(
      tournamentSchema.safeParse({ ...validTournament, waitlistTimerHours: 168 }).success
    ).toBe(true)
  })

  it('accepts undefined waitlistTimerHours', () => {
    const tournamentWithoutWaitlist = { ...validTournament }
    delete (tournamentWithoutWaitlist as Record<string, unknown>).waitlistTimerHours
    const result = tournamentSchema.safeParse(tournamentWithoutWaitlist)
    expect(result.success).toBe(true)
  })

  it('coerces string waitlistTimerHours to number', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      waitlistTimerHours: '6',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.waitlistTimerHours).toBe(6)
    }
  })
})
