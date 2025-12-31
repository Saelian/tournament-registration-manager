import vine from '@vinejs/vine'
import { FFTT_CATEGORIES } from '#constants/fftt'

const genderRestrictionRule = vine.string().in(['M', 'F']).nullable()
const allowedCategoriesRule = vine
  .array(vine.string().in(FFTT_CATEGORIES as unknown as string[]))
  .nullable()
const maxCheckinTimeRule = vine
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  .nullable()

export const createTableValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    date: vine.date(),
    startTime: vine.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // Simple HH:mm
    pointsMin: vine.number().min(0),
    pointsMax: vine.number().min(0),
    quota: vine.number().min(1),
    price: vine.number().min(0),
    isSpecial: vine.boolean().optional(),
    genderRestriction: genderRestrictionRule.optional(),
    allowedCategories: allowedCategoriesRule.optional(),
    maxCheckinTime: maxCheckinTimeRule.optional(),
    nonNumberedOnly: vine.boolean().optional(),
    prizes: vine
      .array(
        vine.object({
          rank: vine.number().min(1),
          prizeType: vine.enum(['cash', 'item']),
          cashAmount: vine.number().min(0).nullable().optional(),
          itemDescription: vine.string().nullable().optional(),
        })
      )
      .optional(),
    sponsorIds: vine.array(vine.number()).optional(),
  })
)

export const updateTableValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    date: vine.date().optional(),
    startTime: vine
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    pointsMin: vine.number().min(0).optional(),
    pointsMax: vine.number().min(0).optional(),
    quota: vine.number().min(1).optional(),
    price: vine.number().min(0).optional(),
    isSpecial: vine.boolean().optional(),
    genderRestriction: genderRestrictionRule.optional(),
    allowedCategories: allowedCategoriesRule.optional(),
    maxCheckinTime: maxCheckinTimeRule.optional(),
    nonNumberedOnly: vine.boolean().optional(),
  })
)
