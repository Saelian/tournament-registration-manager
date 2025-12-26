import { z } from 'zod'

export const tournamentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  location: z.string().min(1, 'Le lieu est requis').max(500),
  refundDeadline: z.string().nullable().optional(),
  waitlistTimerHours: z.coerce.number().min(1).max(168).optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'La date de fin doit être après ou égale à la date de début',
    path: ['endDate'],
  }
)

export type TournamentFormData = z.infer<typeof tournamentSchema>

export interface Tournament {
  id: number
  name: string
  startDate: string
  endDate: string
  location: string
  refundDeadline: string | null
  waitlistTimerHours: number
}
