import { z } from 'zod'

export const tournamentOptionsSchema = z.object({
  refundDeadline: z.string().nullable().optional(),
  waitlistTimerHours: z.coerce.number().min(1).max(168).optional(),
})

export const tournamentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  location: z.string().min(1, 'Le lieu est requis').max(500),
  options: tournamentOptionsSchema.optional(),
  shortDescription: z.string().max(500, 'Maximum 500 caractères').nullable().optional(),
  longDescription: z.string().nullable().optional(),
  rulesLink: z.string().url('URL invalide').max(2048).nullable().optional().or(z.literal('')),
  rulesContent: z.string().nullable().optional(),
  ffttHomologationLink: z.string().url('URL invalide').max(2048).nullable().optional().or(z.literal('')),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'La date de fin doit être après ou égale à la date de début',
    path: ['endDate'],
  }
)

export type TournamentFormData = z.infer<typeof tournamentSchema>

export interface TournamentOptions {
  refundDeadline: string | null
  waitlistTimerHours: number
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
}
