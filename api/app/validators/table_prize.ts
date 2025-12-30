import vine from '@vinejs/vine'

export const createTablePrizeValidator = vine.compile(
  vine.object({
    rank: vine.number().min(1),
    prizeType: vine.enum(['cash', 'item']),
    cashAmount: vine.number().min(0).nullable().optional(),
    itemDescription: vine.string().nullable().optional(),
  })
)

export const updateTablePrizeValidator = vine.compile(
  vine.object({
    rank: vine.number().min(1).optional(),
    prizeType: vine.enum(['cash', 'item']).optional(),
    cashAmount: vine.number().min(0).nullable().optional(),
    itemDescription: vine.string().nullable().optional(),
  })
)
