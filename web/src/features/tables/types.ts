import { z } from 'zod'

export const tableSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  date: z.string().min(1, 'La date est requise'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:mm invalide'),
  pointsMin: z.coerce.number().min(0, 'Minimum 0'),
  pointsMax: z.coerce.number().min(0, 'Minimum 0'),
  quota: z.coerce.number().min(1, 'Minimum 1'),
  price: z.coerce.number().min(0, 'Minimum 0'),
  isSpecial: z.boolean().default(false),
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
  registeredCount: number
}

export interface EligibleTable extends Table {
  isEligible: boolean
  ineligibilityReasons: string[]
}

