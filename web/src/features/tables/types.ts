import { z } from 'zod'

export const FFTT_CATEGORIES = [
  'Poussin',
  'Benjamin',
  'Minime',
  'Cadet',
  'Junior',
  'Senior',
  'Vétéran 1',
  'Vétéran 2',
  'Vétéran 3',
  'Vétéran 4',
  'Vétéran 5',
] as const

export type FfttCategory = (typeof FFTT_CATEGORIES)[number]
export type GenderRestriction = 'M' | 'F' | null

export const tableSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  date: z.string().min(1, 'La date est requise'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:mm invalide'),
  pointsMin: z.coerce.number().min(0, 'Minimum 0'),
  pointsMax: z.coerce.number().min(0, 'Minimum 0'),
  quota: z.coerce.number().min(1, 'Minimum 1'),
  price: z.coerce.number().min(0, 'Minimum 0'),
  isSpecial: z.boolean().default(false),
  genderRestriction: z.enum(['M', 'F']).nullable().default(null),
  allowedCategories: z.array(z.enum(FFTT_CATEGORIES)).nullable().default(null),
  maxCheckinTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().default(null),
}).refine((data) => data.pointsMax >= data.pointsMin, {
  message: 'Le max doit être supérieur ou égal au min',
  path: ['pointsMax'],
})

export type TableFormData = z.infer<typeof tableSchema>

export interface Table {
  id: number
  name: string
  date: string
  startTime: string
  pointsMin: number
  pointsMax: number
  quota: number
  price: number
  isSpecial: boolean
  genderRestriction: GenderRestriction
  allowedCategories: FfttCategory[] | null
  maxCheckinTime: string | null
  effectiveCheckinTime: string
  registeredCount: number
}

export interface EligibleTable extends Table {
  isEligible: boolean
  ineligibilityReasons: string[]
}

