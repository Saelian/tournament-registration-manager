import vine from '@vinejs/vine'

const tournamentOptionsSchema = vine.object({
  refundDeadline: vine.string().nullable().optional(),
  waitlistTimerHours: vine.number().min(1).max(168).optional(),
})

export const updateTournamentValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(255),
    startDate: vine.date(),
    endDate: vine.date().afterOrSameAs('startDate'),
    location: vine.string().minLength(1).maxLength(500),
    options: tournamentOptionsSchema.optional(),
    shortDescription: vine.string().maxLength(500).nullable().optional(),
    longDescription: vine.string().nullable().optional(),
    rulesLink: vine.string().url().maxLength(2048).nullable().optional(),
    rulesContent: vine.string().nullable().optional(),
    ffttHomologationLink: vine.string().url().maxLength(2048).nullable().optional(),
  })
)

export const createTournamentValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(255),
    startDate: vine.date(),
    endDate: vine.date().afterOrSameAs('startDate'),
    location: vine.string().minLength(1).maxLength(500),
    options: tournamentOptionsSchema.optional(),
    shortDescription: vine.string().maxLength(500).nullable().optional(),
    longDescription: vine.string().nullable().optional(),
    rulesLink: vine.string().url().maxLength(2048).nullable().optional(),
    rulesContent: vine.string().nullable().optional(),
    ffttHomologationLink: vine.string().url().maxLength(2048).nullable().optional(),
  })
)
