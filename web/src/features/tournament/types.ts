import { z } from 'zod'

const faqItemSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1, 'La question est requise').max(500),
  answer: z.string().min(1, 'La réponse est requise').max(2000),
  order: z.number(),
})

export const tournamentOptionsSchema = z.object({
  refundDeadline: z.string().nullable().optional(),
  waitlistTimerHours: z.coerce.number().min(1).max(168).optional(),
  registrationStartDate: z.string().nullable().optional(),
  registrationEndDate: z.string().nullable().optional(),
  faqItems: z.array(faqItemSchema).optional(),
})

export const tournamentSchema = z
  .object({
    name: z.string().min(1, 'Le nom est requis').max(255),
    startDate: z.string().min(1, 'La date de début est requise'),
    endDate: z.string().min(1, 'La date de fin est requise'),
    location: z.string().min(1, 'Le lieu est requis').max(500),
    options: tournamentOptionsSchema.optional(),
    shortDescription: z.string().max(500, 'Maximum 500 caractères').nullable().optional(),
    longDescription: z.string().nullable().optional(),
    rulesLink: z.string().url('URL invalide').max(2048).nullable().optional().or(z.literal('')),
    rulesContent: z.string().nullable().optional(),
    ffttHomologationLink: z
      .string()
      .url('URL invalide')
      .max(2048)
      .nullable()
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'La date de fin doit être après ou égale à la date de début',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.options?.registrationStartDate && data.options?.registrationEndDate) {
        return new Date(data.options.registrationEndDate) >= new Date(data.options.registrationStartDate)
      }
      return true
    },
    {
      message: 'La date de fin des inscriptions doit être après ou égale à la date de début',
      path: ['options', 'registrationEndDate'],
    }
  )

export type TournamentFormData = z.infer<typeof tournamentSchema>

export interface FAQItem {
  id: string
  question: string
  answer: string
  order: number
}

export interface TournamentOptions {
  refundDeadline: string | null
  waitlistTimerHours: number
  registrationStartDate: string | null
  registrationEndDate: string | null
  faqItems: FAQItem[]
}

export type RegistrationPeriodStatus = 'not_started' | 'open' | 'closed'

export interface RegistrationStatus {
  status: RegistrationPeriodStatus
  isOpen: boolean
  relevantDate: string | null
  message: string
}

export interface Tournament {
  id: number
  name: string
  startDate: string
  endDate: string
  location: string
  options: TournamentOptions
  shortDescription: string | null
  longDescription: string | null
  rulesLink: string | null
  rulesContent: string | null
  ffttHomologationLink: string | null
  registrationStatus?: RegistrationStatus
}
