import vine from '@vinejs/vine'

/**
 * Validateur pour la création d'inscription admin.
 * POST /admin/registrations
 */
export const createAdminRegistrationValidator = vine.compile(
    vine.object({
        licence: vine.string().regex(/^\d{6,8}$/),
        tableIds: vine.array(vine.number().positive()).minLength(1),
        paymentMethod: vine.enum(['helloasso', 'cash', 'check', 'card']),
        bypassRules: vine.boolean().optional(),
        collected: vine.boolean().optional(),
    })
)

/**
 * Validateur pour la génération de lien de paiement HelloAsso.
 * POST /admin/registrations/:id/generate-payment-link
 */
export const generatePaymentLinkValidator = vine.compile(
    vine.object({
        email: vine.string().email().optional(),
    })
)

/**
 * Validateur pour marquer un paiement comme encaissé.
 * PATCH /admin/payments/:id/collect
 */
export const collectPaymentValidator = vine.compile(
    vine.object({})
)
