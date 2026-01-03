import vine from '@vinejs/vine'

export const processRefundValidator = vine.compile(
  vine.object({
    refundMethod: vine.enum(['helloasso_manual', 'bank_transfer', 'cash']),
  })
)
