import { z } from 'zod'

export const sponsorSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    websiteUrl: z.string().url('URL invalide').nullable().optional(),
    contactEmail: z.string().email('Email invalide').nullable().optional(),
    description: z.string().nullable().optional(),
    isGlobal: z.boolean().default(false),
})

export type SponsorFormData = z.infer<typeof sponsorSchema>

export interface Sponsor {
    id: number
    name: string
    websiteUrl: string | null
    contactEmail: string | null
    description: string | null
    isGlobal: boolean
    tables: { id: number; name: string }[]
}
