import { describe, it, expect } from 'vitest'
import { tournamentSchema } from './types'

describe('tournamentSchema', () => {
  const validTournament = {
    name: 'Tournoi de Badminton 2025',
    startDate: '2025-06-15',
    endDate: '2025-06-16',
    location: 'Gymnase Municipal',
    options: {
      refundDeadline: null,
      waitlistTimerHours: 4,
    },
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

  it('accepts null refundDeadline in options', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      options: { refundDeadline: null, waitlistTimerHours: 4 },
    })
    expect(result.success).toBe(true)
  })

  it('accepts undefined options', () => {
    const tournamentWithoutOptions = { ...validTournament }
    delete (tournamentWithoutOptions as Record<string, unknown>).options
    const result = tournamentSchema.safeParse(tournamentWithoutOptions)
    expect(result.success).toBe(true)
  })

  it('accepts valid refundDeadline in options', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      options: { refundDeadline: '2025-06-10', waitlistTimerHours: 4 },
    })
    expect(result.success).toBe(true)
  })

  it('fails when waitlistTimerHours in options is less than 1', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      options: { waitlistTimerHours: 0 },
    })
    expect(result.success).toBe(false)
  })

  it('fails when waitlistTimerHours in options exceeds 168', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      options: { waitlistTimerHours: 169 },
    })
    expect(result.success).toBe(false)
  })

  it('accepts waitlistTimerHours at boundary values', () => {
    expect(
      tournamentSchema.safeParse({
        ...validTournament,
        options: { waitlistTimerHours: 1 },
      }).success
    ).toBe(true)
    expect(
      tournamentSchema.safeParse({
        ...validTournament,
        options: { waitlistTimerHours: 168 },
      }).success
    ).toBe(true)
  })

  it('accepts undefined waitlistTimerHours in options', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      options: { refundDeadline: null },
    })
    expect(result.success).toBe(true)
  })

  it('coerces string waitlistTimerHours to number', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      options: { waitlistTimerHours: '6' },
    })
    expect(result.success).toBe(true)
    if (result.success && result.data.options) {
      expect(result.data.options.waitlistTimerHours).toBe(6)
    }
  })

  it('validates shortDescription max length', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      shortDescription: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid shortDescription', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      shortDescription: 'Description courte du tournoi',
    })
    expect(result.success).toBe(true)
  })

  it('validates rulesLink as URL', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      rulesLink: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid rulesLink URL', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      rulesLink: 'https://example.com/rules.pdf',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for rulesLink', () => {
    const result = tournamentSchema.safeParse({
      ...validTournament,
      rulesLink: '',
    })
    expect(result.success).toBe(true)
  })
})
