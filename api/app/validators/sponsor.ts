import vine from '@vinejs/vine'

export const createSponsorValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1),
        websiteUrl: vine.string().url().nullable().optional(),
        contactEmail: vine.string().email().nullable().optional(),
        description: vine.string().nullable().optional(),
        isGlobal: vine.boolean().optional(),
    })
)

export const updateSponsorValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1).optional(),
        websiteUrl: vine.string().url().nullable().optional(),
        contactEmail: vine.string().email().nullable().optional(),
        description: vine.string().nullable().optional(),
        isGlobal: vine.boolean().optional(),
    })
)
