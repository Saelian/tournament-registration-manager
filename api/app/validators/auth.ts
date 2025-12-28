import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    firstName: vine
      .string()
      .minLength(2)
      .maxLength(50)
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    lastName: vine
      .string()
      .minLength(2)
      .maxLength(50)
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    phone: vine.string().regex(/^0[1-9][0-9]{8}$/),
  })
)
