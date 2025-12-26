import vine from '@vinejs/vine'

export const updateTournamentValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(255),
    startDate: vine.date(),
    endDate: vine.date().afterOrSameAs('startDate'),
    location: vine.string().minLength(1).maxLength(500),
    refundDeadline: vine.date().nullable().optional(),
    waitlistTimerHours: vine.number().min(1).max(168).optional(),
  })
)

export const createTournamentValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(255),
    startDate: vine.date(),
    endDate: vine.date().afterOrSameAs('startDate'),
    location: vine.string().minLength(1).maxLength(500),
    refundDeadline: vine.date().nullable().optional(),
    waitlistTimerHours: vine.number().min(1).max(168).optional(),
  })
)
