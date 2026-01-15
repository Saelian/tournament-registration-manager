import vine from '@vinejs/vine'

export const syncTableSponsorsValidator = vine.compile(
    vine.object({
        sponsorIds: vine.array(vine.number()),
    })
)
